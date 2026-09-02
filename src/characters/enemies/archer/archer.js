import { addSprite2D, createSprite2DLayer, loadSpriteAtlas, playSprite2DAnimation, removeSprite2D, removeSpriteAnimation, updateSprite2D } from "@babylonjs/lite";
import { createGridAlignedMovementController, getCharacterCollider, worldToScreen } from "../../../gameplay/game-logic.js";
import { getYSortedLayerOrder } from "../../../systems/environment/render-depth.js";
import { chooseArcherAction, ARCHER_RECOVERY_SECONDS } from "./archer-ai.js";
import { getQuantizedGridCell } from "../../../systems/environment/grid-spot.js";
import { requestPlayerAttack, updatePlayerAttackPreparation, hasPlayerAttackPreparation, cancelPlayerAttackPreparation } from '../player-attack-preparation.js';

export const ARCHER_FRAME = Object.freeze({ width: 192, height: 192 });
export const ARCHER_PIVOT = Object.freeze({ x: 0.5, y: 0.84 });
export const ARCHER_ART_OFFSET = Object.freeze({ x: 0, y: -55 });
export const ARCHER_MOVEMENT_COLLIDER = Object.freeze({ type: "circle", x: 96, y: ARCHER_FRAME.height * ARCHER_PIVOT.y, radius: 24 });
export const ARCHER_COMBAT_COLLIDER = Object.freeze({ x: ARCHER_FRAME.width * ARCHER_PIVOT.x - 64 / 2, y: ARCHER_FRAME.height * ARCHER_PIVOT.y + 64 / 2 - 64, width: 64, height: 64 });
const ARROW_ATTACH_OFFSET = Object.freeze({ x: 24.48, y: 29.55 });
const ARROW_ATTACH_FRAME = 5;
const ARROW_ATTACH_ANGLE = Math.atan2(-55, -64);
const ANIMS = Object.freeze({ idle: ["Archer_Idle.png", 6, true], walking: ["Archer_Run.png", 4, true], shooting: ["Archer_Shoot.png", 6, false] });

export async function loadArcherAtlases(engine) {
  return Object.fromEntries(await Promise.all(Object.entries(ANIMS).map(async ([name, [file]]) => [name, await loadSpriteAtlas(engine, `./assets/units/archer/${file}`, { gridSize: [192, 192], sampling: "nearest" })])));
}

export function createArcher({ atlases, initialPosition, bounds, obstacles = [], onShoot = () => {} }) {
  let position = { ...initialPosition }; let artYOffset = 0; let disposed = false; let manager = null; let active = null; let state = "idle";
  let facing = 1; let target = null; let recovery = 0; let released = false; let shootElapsed = 0;
  let movementIntent = { x: 0, y: 0 };
  let latestPlayer = null;
  const gridMovement = createGridAlignedMovementController({ frame: ARCHER_FRAME, pivot: ARCHER_PIVOT, collider: ARCHER_MOVEMENT_COLLIDER }, 64);
  const layers = {}; const sprites = {};
  const getArtScreenPosition = (worldPosition) => worldToScreen({ x: worldPosition.x + ARCHER_ART_OFFSET.x, y: worldPosition.y + ARCHER_ART_OFFSET.y }, 1, bounds.height);
  const updateSprites = (transform = {}) => {
    const screen = getArtScreenPosition(position);
    const positionPx = transform.positionPx ?? [screen.x, screen.y + artYOffset];
    Object.values(sprites).forEach((sprite) => updateSprite2D(sprite, { ...transform, positionPx }));
  };
  for (const [name] of Object.entries(ANIMS)) {
    const layer = createSprite2DLayer(atlases[name], { capacity: 1, order: getYSortedLayerOrder(position.y, bounds.height), pivot: [0.5, 0.84], visible: name === "idle" });
    layers[name] = layer; const screen = getArtScreenPosition(position); sprites[name] = addSprite2D(layer, { positionPx: [screen.x, screen.y + artYOffset], sizePx: [192, 192], frame: 0 });
  }
  function play(name) { state = name; if (!manager || disposed) return; if (active) { active.stop?.(); removeSpriteAnimation(manager, active); active = null; } Object.entries(layers).forEach(([key, layer]) => { layer.visible = key === name; }); const [, count, loop] = ANIMS[name]; active = playSprite2DAnimation(manager, sprites[name], 0, count - 1, loop, 100, loop ? undefined : { onEnd: () => { if (name === "shooting") { recovery = ARCHER_RECOVERY_SECONDS; state = "recovering"; } else play("idle"); } }); }
  function setVisualTransform(transform) {
    const screenPosition = getArtScreenPosition(position);
    const centeredTransform = transform.sizePx
      ? {
          ...transform,
          positionPx: [
            screenPosition.x + (0.5 - ARCHER_PIVOT.x) * (ARCHER_FRAME.width - transform.sizePx[0]),
            screenPosition.y + artYOffset + (0.5 - ARCHER_PIVOT.y) * (ARCHER_FRAME.height - transform.sizePx[1]),
          ],
        }
      : transform;
    updateSprites(centeredTransform);
  }
  return {
    layers: Object.values(layers),
    isMovementLocked() { return disposed || state === "shooting" || recovery > 0; },
    get state() {
      return state;
    },
    get isAttacking() {
      return state === "shooting";
    },
    getHeading() {
      return facing < 0 ? "left" : "right";
    },
    getPosition() {
      return { ...position };
    },
    setPosition(next) { cancelPlayerAttackPreparation(this); position = { ...next }; updateSprites(); },
    getMovementCollider() {
      return getCharacterCollider(position, ARCHER_FRAME, ARCHER_PIVOT, ARCHER_MOVEMENT_COLLIDER);
    },
    getCombatCollider() {
      return getCharacterCollider(position, ARCHER_FRAME, ARCHER_PIVOT, ARCHER_COMBAT_COLLIDER);
    },
    getGridPosition: (tileSize = 64) => getQuantizedGridCell(position, { tileSizePx: tileSize }),
    playAnimation(m) {
      manager = m;
      play("idle");
    },
    faceDirection(direction) {
      if (this.isMovementLocked() || !direction.x) return;
      facing = Math.sign(direction.x);
      updateSprites({ flipX: facing < 0 });
    },
    setMovementIntent(movement) {
      movementIntent = { x: movement.x, y: movement.y };
    },
    update(deltaSeconds, dynamicColliders = [], _projectiles, player) {
      if (disposed) return;
      const delta = Math.max(0, deltaSeconds);
      if (delta <= 0) return;
      latestPlayer = player;
      if (recovery > 0) {
        recovery = Math.max(0, recovery - delta);
        if (recovery === 0) play("idle");
        return;
      }
      if (state === "shooting") {
        shootElapsed += delta;
        const attachmentFrame = ARROW_ATTACH_FRAME;
        if (!released && (active ? active.current >= attachmentFrame : shootElapsed >= attachmentFrame * 0.1) && target) {
          released = true;
          const offsetX = ARROW_ATTACH_OFFSET.x * facing;
          const angle = (facing < 0 ? ARROW_ATTACH_ANGLE : Math.PI - ARROW_ATTACH_ANGLE)
            - facing * Math.PI / 180;
          onShoot(
            { x: position.x + offsetX, y: position.y + ARROW_ATTACH_OFFSET.y },
            { ...target },
            { initialRotation: angle, initialVelocityDirection: { x: Math.cos(angle), y: -Math.sin(angle) }, landingCenterY: position.y },
          );
        }
        return;
      }
      if (!hasPlayerAttackPreparation(this) && chooseArcherAction(position, player, 'ready').state === 'shooting') {
        requestPlayerAttack(this, { getTarget: () => latestPlayer,
          eligible: value => chooseArcherAction(position, value, 'ready').state === 'shooting',
          commit: value => this.shootAt(value.position) });
      }
      if (state === 'shooting') return;
      const preparing = updatePlayerAttackPreparation(this, delta, center => {
        position = gridMovement.moveTo(position, center, 120 * delta, bounds, [...obstacles, ...dynamicColliders.map(({ collider }) => collider)]);
      });
      if (state === 'shooting') { updateSprites(); return; }
      if (!preparing) position = gridMovement.move(position, movementIntent, 120 * delta, delta, bounds, [...obstacles, ...dynamicColliders.map(({ collider }) => collider)]);
      const locomotion = movementIntent.x || movementIntent.y ? "walking" : "idle";
      if (state !== locomotion) play(locomotion);
      updateSprites();
      const action = preparing ? { facing: 0 } : chooseArcherAction(position, player, "ready");
      // Commit facing once per update, after shooting/recovery have returned.
      // These animations have horizontal facing only; queued patrol requests
      // must not rotate perception independently of the displayed sprite.
      const nextFacing = action.facing || Math.sign(movementIntent.x) || facing;
      if (nextFacing !== facing) {
        facing = nextFacing;
        Object.values(sprites).forEach((sprite) => updateSprite2D(sprite, { flipX: facing < 0 }));
      }
    },
    shootAt(position) {
      if (this.isMovementLocked()) return false;
      movementIntent = { x: 0, y: 0 };
      this.faceDirection({ x: position.x - this.getPosition().x, y: position.y - this.getPosition().y });
      target = { ...position };
      released = false;
      shootElapsed = 0;
      play("shooting");
      return true;
    },
    shoot() {
      if (state !== "idle") return false;
      target = null;
      released = false;
      shootElapsed = 0;
      play("shooting");
      return true;
    },
    setVisualTransform,
    setArtYOffset(value) {
      artYOffset = Number.isFinite(value) ? value : 0;
      updateSprites();
    },
    applyKnockback() {},
    dispose() {
      if (disposed) return;
      cancelPlayerAttackPreparation(this);
      disposed = true;
      Object.values(sprites).forEach(removeSprite2D);
      Object.values(layers).forEach((layer) => {
        layer.visible = false;
      });
    },
  };
}
