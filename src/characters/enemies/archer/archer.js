import { addSprite2D, createSprite2DLayer, loadSpriteAtlas, playSprite2DAnimation, removeSprite2D, updateSprite2D } from "@babylonjs/lite";
import { getCharacterCollider, moveWithCollisions, worldToScreen } from "../../../gameplay/game-logic.js";
import { getYSortedLayerOrder } from "../../../systems/environment/render-depth.js";
import { chooseArcherAction, ARCHER_RECOVERY_SECONDS } from "./archer-ai.js";

export const ARCHER_FRAME = Object.freeze({ width: 192, height: 192 });
export const ARCHER_PIVOT = Object.freeze({ x: 0.5, y: 0.84 });
export const ARCHER_ART_OFFSET = Object.freeze({ x: 0, y: -55 });
export const ARCHER_MOVEMENT_COLLIDER = Object.freeze({ type: "circle", x: 96, y: ARCHER_FRAME.height * ARCHER_PIVOT.y, radius: 24 });
export const ARCHER_COMBAT_COLLIDER = Object.freeze({ x: ARCHER_FRAME.width * ARCHER_PIVOT.x - 64 / 2, y: ARCHER_FRAME.height * ARCHER_PIVOT.y + 64 / 2 - 64, width: 64, height: 64 });
const ARROW_ATTACH_OFFSET = Object.freeze({ x: 16, y: 55 });
const ARROW_ATTACH_ANGLE = Math.atan2(-55, -64);
const ANIMS = Object.freeze({ idle: ["Archer_Idle.png", 6, true], walking: ["Archer_Run.png", 6, true], shooting: ["Archer_Shoot.png", 6, false] });

export async function loadArcherAtlases(engine) {
  return Object.fromEntries(await Promise.all(Object.entries(ANIMS).map(async ([name, [file]]) => [name, await loadSpriteAtlas(engine, `./assets/units/archer/${file}`, { gridSize: [192, 192], sampling: "nearest" })])));
}

export function createArcher({ atlases, initialPosition, bounds, obstacles = [], onShoot = () => {} }) {
  let position = { ...initialPosition }; let artYOffset = 0; let disposed = false; let manager = null; let active = null; let state = "idle";
  let facing = 1; let target = null; let recovery = 0; let released = false; let shootElapsed = 0;
  let movementIntent = { x: 0, y: 0 };
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
  function play(name) { state = name; if (!manager || disposed) return; if (active) active.stop?.(); Object.entries(layers).forEach(([key, layer]) => { layer.visible = key === name; }); const [, count, loop] = ANIMS[name]; active = playSprite2DAnimation(manager, sprites[name], 0, count - 1, loop, 100, loop ? undefined : { onEnd: () => { if (name === "shooting") { recovery = ARCHER_RECOVERY_SECONDS; state = "recovering"; } else play("idle"); } }); }
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
    setPosition(next) { position = { ...next }; updateSprites(); },
    getMovementCollider() {
      return getCharacterCollider(position, ARCHER_FRAME, ARCHER_PIVOT, ARCHER_MOVEMENT_COLLIDER);
    },
    getCombatCollider() {
      return getCharacterCollider(position, ARCHER_FRAME, ARCHER_PIVOT, ARCHER_COMBAT_COLLIDER);
    },
    getGridPosition: () => ({ x: Math.floor(position.x / 64), y: Math.floor(position.y / 64) }),
    playAnimation(m) {
      manager = m;
      play("idle");
    },
    setMovementIntent(movement) { movementIntent = { x: movement.x, y: movement.y }; },
    update(deltaSeconds, _dynamic, _projectiles, player) {
      if (disposed) return;
      const delta = Math.max(0, deltaSeconds);
      if (recovery > 0) {
        recovery = Math.max(0, recovery - delta);
        if (recovery === 0) play("idle");
        return;
      }
      if (state === "shooting") {
        shootElapsed += delta;
        if (!released && (active?.current >= 3 || shootElapsed >= 0.3) && target) {
          released = true;
          const offsetX = ARROW_ATTACH_OFFSET.x * facing;
          const angle = facing < 0 ? ARROW_ATTACH_ANGLE : Math.PI - ARROW_ATTACH_ANGLE;
          onShoot(
            { x: position.x + offsetX, y: position.y + ARROW_ATTACH_OFFSET.y },
            { ...target },
            { initialRotation: angle, initialVelocityDirection: { x: Math.cos(angle), y: -Math.sin(angle) } },
          );
        }
        return;
      }
      position = moveWithCollisions(position, movementIntent,
        120 * delta, bounds,
        { frame: ARCHER_FRAME, pivot: ARCHER_PIVOT, collider: ARCHER_MOVEMENT_COLLIDER },
        obstacles);
      const locomotion = movementIntent.x || movementIntent.y ? "walking" : "idle";
      if (state !== locomotion) play(locomotion);
      updateSprites();
      const action = chooseArcherAction(position, player, "ready");
      if (action.facing) {
        facing = action.facing;
        Object.values(sprites).forEach((sprite) => updateSprite2D(sprite, { flipX: facing < 0 }));
      }
      if (action.state === "shooting") {
        target = action.target;
        released = false;
        shootElapsed = 0;
        play("shooting");
      }
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
      disposed = true;
      Object.values(sprites).forEach(removeSprite2D);
      Object.values(layers).forEach((layer) => {
        layer.visible = false;
      });
    },
  };
}
