import {
  addSprite2D,
  createSprite2DLayer,
  loadSpriteAtlas,
  playSprite2DAnimation,
  removeSprite2D,
  stopSpriteAnimation,
  updateSprite2D,
} from "@babylonjs/lite";

import {
  getCharacterCollider,
  createGridAlignedMovementController,
  moveWithCollisions,
  worldToScreen,
} from "../../../gameplay/game-logic.js";
import { getCharacterGridCell, getCharacterLayerOrder } from "../../character-spatial.js";
import {
  LANCER_ANIMATION_CATALOG,
  LANCER_ANIMATION_NAMES,
} from "./lancer-animation-catalog.js";
import {
  LancerState,
  createLancerStateMachine,
  selectLancerAction,
} from "./lancer-state.js";
import {
  createLancerDefenseConfig,
  selectIncomingProjectile,
} from "./lancer-defense.js";

export const LANCER_FRAME = Object.freeze({ width: 320, height: 320 });
export const LANCER_PIVOT = Object.freeze({ x: 0.5, y: 0.84 });
export const LANCER_ART_OFFSET = Object.freeze({ x: 0, y: -100 });
export const LANCER_MOVEMENT_COLLIDER = Object.freeze({
  type: "circle",
  x: 160,
  y: LANCER_FRAME.height * LANCER_PIVOT.y,
  radius: 24,
});
export const LANCER_COMBAT_COLLIDER = Object.freeze({
  x: LANCER_FRAME.width * LANCER_PIVOT.x - 64 / 2,
  y: LANCER_FRAME.height * LANCER_PIVOT.y + 64 / 2 - 64,
  width: 64,
  height: 64,
});

const DEFAULT_API = Object.freeze({
  addSprite2D,
  createSprite2DLayer,
  loadSpriteAtlas,
  playSprite2DAnimation,
  removeSprite2D,
  stopSpriteAnimation,
  updateSprite2D,
});
const DEFAULT_KNOCKBACK_DURATION_SECONDS = 0.15;
const DEFAULT_KNOCKBACK_SPEED = 260;

export async function loadLancerAtlases(engine, api = DEFAULT_API) {
  const entries = await Promise.all(
    LANCER_ANIMATION_NAMES.map(async (name) => {
      const descriptor = LANCER_ANIMATION_CATALOG[name];
      const atlas = await api.loadSpriteAtlas(engine, descriptor.imageUrl, {
        gridSize: [...descriptor.gridSize],
        sampling: descriptor.sampling,
      });
      return [name, atlas];
    }),
  );
  return Object.fromEntries(entries);
}

function normalizeMovement(movement) {
  const length = Math.hypot(movement.x, movement.y);
  return length > 0
    ? { x: movement.x / length, y: movement.y / length }
    : { x: 0, y: 0 };
}

export function createLancer({
  atlases,
  initialPosition,
  bounds,
  obstacles,
  onAttack = () => {},
  movementSpeed = 120,
  defenseConfig = {},
  api = DEFAULT_API,
}) {
  const character = {
    frame: LANCER_FRAME,
    pivot: LANCER_PIVOT,
    collider: LANCER_MOVEMENT_COLLIDER,
  };
  const gridMovement = createGridAlignedMovementController(character, 64);
  const stateMachine = createLancerStateMachine();
  const defense = createLancerDefenseConfig(defenseConfig);
  const attemptedProjectileIds = new Set();
  let position = { ...initialPosition };
  let artYOffset = 0;
  let movementIntent = { x: 0, y: 0 };
  let facing = 1;
  let heading = "right";
  let currentFlipX = false;
  let animationManager = null;
  let activeAnimation = null;
  let disposed = false;
  let knockback = { x: 0, y: 0 };
  let knockbackTimer = 0;
  let knockbackDuration = 0;
  let defenseRemainingSeconds = 0;

  const layers = {};
  const sprites = {};
  const getArtScreenPosition = (worldPosition) => worldToScreen({ x: worldPosition.x + LANCER_ART_OFFSET.x, y: worldPosition.y + LANCER_ART_OFFSET.y }, 1, bounds.height);
  const initialScreenPosition = getArtScreenPosition(position);
  const initialOrder = getCharacterLayerOrder(
    getCharacterCollider(position, character.frame, character.pivot, character.collider),
    bounds.height,
  );
  for (const name of LANCER_ANIMATION_NAMES) {
    const descriptor = LANCER_ANIMATION_CATALOG[name];
    const layer = api.createSprite2DLayer(atlases[name], {
      capacity: 1,
      order: initialOrder,
      pivot: [...descriptor.pivot],
      visible: name === LancerState.IDLE,
    });
    layers[name] = layer;
    sprites[name] = api.addSprite2D(layer, {
      positionPx: [initialScreenPosition.x, initialScreenPosition.y],
      sizePx: [...descriptor.displaySize],
      frame: 0,
    });
  }

  function updateSprites() {
    const screenPosition = getArtScreenPosition(position);
    const order = getCharacterLayerOrder(
      getCharacterCollider(position, character.frame, character.pivot, character.collider),
      bounds.height,
    );
    for (const layer of Object.values(layers)) {
      layer.order = order;
    }
    for (const sprite of Object.values(sprites)) {
      api.updateSprite2D(sprite, {
        positionPx: [screenPosition.x, screenPosition.y + artYOffset],
        flipX: currentFlipX,
      });
    }
  }

  function playStateAnimation(name) {
    if (!animationManager || disposed) {
      return;
    }
    if (activeAnimation) {
      api.stopSpriteAnimation(activeAnimation);
    }
    for (const [layerName, layer] of Object.entries(layers)) {
      layer.visible = layerName === name;
    }
    const descriptor = LANCER_ANIMATION_CATALOG[name];
    activeAnimation = api.playSprite2DAnimation(
      animationManager,
      sprites[name],
      0,
      descriptor.frameCount - 1,
      descriptor.loop,
      descriptor.frameDurationMs,
      descriptor.loop
        ? undefined
        : {
            onEnd: () => {
              if (disposed) {
                return;
              }
              const transition = stateMachine.completeAttack(movementIntent);
              currentFlipX = facing < 0;
              if (transition.changed) {
                playStateAnimation(transition.state);
              }
            },
          },
    );
    updateSprites();
  }

  function setVisualTransform({
    scaleX,
    scaleY,
    alpha,
    rotation,
    color,
    sizePx,
  }) {
    const patch = {};
    if (scaleX !== undefined) patch.scaleX = scaleX;
    if (scaleY !== undefined) patch.scaleY = scaleY;
    if (alpha !== undefined) patch.alpha = alpha;
    if (rotation !== undefined) patch.rotation = rotation;
    if (color !== undefined) patch.color = color;
    if (sizePx !== undefined) {
      patch.sizePx = sizePx;
      const screenPosition = getArtScreenPosition(position);
      patch.positionPx = [
        screenPosition.x + (0.5 - LANCER_PIVOT.x) * (LANCER_FRAME.width - sizePx[0]),
        screenPosition.y + artYOffset + (0.5 - LANCER_PIVOT.y) * (LANCER_FRAME.height - sizePx[1]),
      ];
    }
    for (const sprite of Object.values(sprites)) {
      api.updateSprite2D(sprite, patch);
    }
  }

  function applyKnockback(direction, {
    duration = DEFAULT_KNOCKBACK_DURATION_SECONDS,
    speed = DEFAULT_KNOCKBACK_SPEED,
  } = {}) {
    const normalizer = Math.hypot(direction.x, direction.y) || 1;
    knockback = {
      x: direction.x / normalizer * speed,
      y: direction.y / normalizer * speed,
    };
    knockbackTimer = duration;
    knockbackDuration = Math.max(0.0001, duration);
  }

  function getKnockbackMovement(deltaSeconds) {
    if (knockbackTimer <= 0) return null;
    const intensity = Math.max(0, knockbackTimer / knockbackDuration);
    knockbackTimer = Math.max(0, knockbackTimer - Math.max(0, deltaSeconds));
    return { x: knockback.x * intensity, y: knockback.y * intensity };
  }

  return {
    layers: Object.values(layers),
    isMovementLocked() { return stateMachine.movementLocked || knockbackTimer > 0; },
    get state() {
      return stateMachine.state;
    },
    get isAttacking() {
      return stateMachine.state === LancerState.ATTACK_1
        || stateMachine.state === LancerState.ATTACK_2;
    },
    get isDefending() {
      return defenseRemainingSeconds > 0;
    },
    attack(name = LancerState.ATTACK_1, direction = { x: 0, y: 0 }) {
      if (disposed) return false;
      const transition = stateMachine.startAttack(name);
      if (!transition.changed) return false;
      const selection = selectLancerAction(name, direction, facing);
      facing = selection.facing;
      currentFlipX = selection.flipX;
      playStateAnimation(selection.name);
      onAttack();
      return true;
    },
    setGuarding(enabled, direction = { x: 0, y: 0 }) {
      if (disposed) return false;
      if (defenseRemainingSeconds > 0) return false;
      const selection = selectLancerAction("guard", direction, facing);
      facing = selection.facing;
      currentFlipX = selection.flipX;
      const transition = stateMachine.setGuarding(enabled, movementIntent);
      if (transition.changed) playStateAnimation(transition.state);
      return transition.changed;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (activeAnimation) {
        api.stopSpriteAnimation(activeAnimation);
        activeAnimation = null;
      }
      for (const sprite of Object.values(sprites)) api.removeSprite2D(sprite);
      for (const layer of Object.values(layers)) layer.visible = false;
    },
    getMovementCollider() {
      return getCharacterCollider(
        position,
        character.frame,
        character.pivot,
        character.collider,
      );
    },
    getCombatCollider() {
      return getCharacterCollider(
        position,
        character.frame,
        character.pivot,
        LANCER_COMBAT_COLLIDER,
      );
    },
    getGridPosition(tileSize) {
      return getCharacterGridCell(this.getMovementCollider(), tileSize);
    },
    getHeading() {
      return heading;
    },
    getPosition() {
      return { ...position };
    },
    setPosition(next) { position = { ...next }; updateSprites(); },
    playAnimation(manager) {
      animationManager = manager;
      playStateAnimation(LancerState.IDLE);
    },
    setVisualTransform,
    setArtYOffset(value) { artYOffset = Number.isFinite(value) ? value : 0; updateSprites(); },
    setMovementIntent(movement) {
      movementIntent = normalizeMovement(movement);
      if (Math.abs(movementIntent.y) > Math.abs(movementIntent.x) && movementIntent.y !== 0) {
        heading = movementIntent.y < 0 ? "up" : "down";
      } else if (movementIntent.x !== 0) {
        heading = movementIntent.x < 0 ? "left" : "right";
      }
    },
    update(deltaSeconds, dynamicColliders = [], projectiles = []) {
      if (disposed) {
        return { position: { ...position }, state: stateMachine.state };
      }
      if (defenseRemainingSeconds <= 0) {
        const incoming = selectIncomingProjectile(
          projectiles,
          this.getCombatCollider(),
          facing,
          defense,
          attemptedProjectileIds,
        );
        if (incoming) {
          currentFlipX = facing < 0;
          defenseRemainingSeconds = defense.defenseDurationSeconds;
          stateMachine.startDefense();
          playStateAnimation(LancerState.GUARD);
        }
      }
      if (defenseRemainingSeconds > 0) {
        defenseRemainingSeconds = Math.max(
          0,
          defenseRemainingSeconds - Math.max(0, deltaSeconds),
        );
        if (defenseRemainingSeconds < 1e-9) defenseRemainingSeconds = 0;
        if (defenseRemainingSeconds === 0) {
          const transition = stateMachine.completeDefense(movementIntent);
          if (transition.changed) playStateAnimation(transition.state);
        }
        updateSprites();
        return { position: { ...position }, state: stateMachine.state };
      }
      const knockbackMovement = getKnockbackMovement(deltaSeconds);
      if (knockbackMovement) {
        gridMovement.reset();
        position = moveWithCollisions(
          position,
          knockbackMovement,
          Math.hypot(knockbackMovement.x, knockbackMovement.y) * deltaSeconds,
          bounds,
          character,
          [...obstacles, ...dynamicColliders.map(({ collider }) => collider)],
        );
        updateSprites();
        return { position: { ...position }, state: stateMachine.state };
      }
      if (!stateMachine.movementLocked) {
        if (movementIntent.x !== 0) facing = movementIntent.x < 0 ? -1 : 1;
        currentFlipX = facing < 0;
        const transition = stateMachine.updateLocomotion(movementIntent);
        if (transition.changed) playStateAnimation(transition.state);
      }
      const movement = stateMachine.movementLocked
        ? { x: 0, y: 0 }
        : movementIntent;
      position = gridMovement.move(
        position,
        movement,
        movementSpeed * Math.max(0, deltaSeconds),
        deltaSeconds,
        bounds,
        [...obstacles, ...dynamicColliders.map(({ collider }) => collider)],
      );
      updateSprites();
      return { position: { ...position }, state: stateMachine.state };
    },
    applyKnockback,
  };
}
