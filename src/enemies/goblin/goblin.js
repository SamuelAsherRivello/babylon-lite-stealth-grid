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
  moveWithCollisions,
  worldToGrid,
  worldToScreen,
} from "../../game-logic.js";
import { GAME_DEPTH } from "../../render-depth.js";
import {
  EnemyState,
  createEnemyStateMachine,
} from "../enemy-state.js";
import {
  GOBLIN_ANIMATION_CATALOG,
  GOBLIN_ANIMATION_NAMES,
} from "./goblin-animation-catalog.js";
import { selectGoblinAttackAnimation } from "./goblin-state.js";

export const GOBLIN_FRAME = Object.freeze({ width: 192, height: 192 });
export const GOBLIN_PIVOT = Object.freeze({ x: 0.5, y: 0.84 });
export const GOBLIN_MOVEMENT_COLLIDER = Object.freeze({
  type: "circle",
  x: 96,
  y: 123,
  radius: 24,
});
export const GOBLIN_COMBAT_COLLIDER = Object.freeze({
  x: 64,
  y: GOBLIN_FRAME.height * GOBLIN_PIVOT.y - 96,
  width: 64,
  height: 96,
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

export async function loadGoblinAtlases(engine, api = DEFAULT_API) {
  const entries = await Promise.all(
    GOBLIN_ANIMATION_NAMES.map(async (name) => {
      const descriptor = GOBLIN_ANIMATION_CATALOG[name];
      const atlas = await api.loadSpriteAtlas(
        engine,
        descriptor.imageUrl,
        {
          gridSize: [...descriptor.gridSize],
          sampling: descriptor.sampling,
        },
      );
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

export function createGoblin({
  atlases,
  initialPosition,
  bounds,
  obstacles,
  movementSpeed = 120,
  api = DEFAULT_API,
}) {
  const character = {
    frame: GOBLIN_FRAME,
    pivot: GOBLIN_PIVOT,
    collider: GOBLIN_MOVEMENT_COLLIDER,
  };
  const stateMachine = createEnemyStateMachine();
  let position = { ...initialPosition };
  let movementIntent = { x: 0, y: 0 };
  let facing = 1;
  let currentFlipX = false;
  let animationManager = null;
  let activeAnimation = null;
  let disposed = false;
  let knockback = { x: 0, y: 0 };
  let knockbackTimer = 0;
  let knockbackDuration = 0;

  const layers = {};
  const sprites = {};
  const initialScreenPosition = worldToScreen(position, 1, bounds.height);
  for (const name of GOBLIN_ANIMATION_NAMES) {
    const descriptor = GOBLIN_ANIMATION_CATALOG[name];
    const layer = api.createSprite2DLayer(atlases[name], {
      capacity: 1,
      order: GAME_DEPTH.npcs,
      pivot: [...descriptor.pivot],
      visible: name === "idle",
    });
    layers[name] = layer;
    sprites[name] = api.addSprite2D(layer, {
      positionPx: [initialScreenPosition.x, initialScreenPosition.y],
      sizePx: [...descriptor.displaySize],
      frame: 0,
    });
  }

  function updateSprites() {
    const screenPosition = worldToScreen(position, 1, bounds.height);
    const order = GAME_DEPTH.npcs + screenPosition.y / (bounds.height * 4);
    for (const layer of Object.values(layers)) {
      layer.order = order;
    }
    for (const sprite of Object.values(sprites)) {
      api.updateSprite2D(sprite, {
        positionPx: [screenPosition.x, screenPosition.y],
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
    const descriptor = GOBLIN_ANIMATION_CATALOG[name];
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
    if (scaleX !== undefined) {
      patch.scaleX = scaleX;
    }
    if (scaleY !== undefined) {
      patch.scaleY = scaleY;
    }
    if (alpha !== undefined) {
      patch.alpha = alpha;
    }
    if (rotation !== undefined) {
      patch.rotation = rotation;
    }
    if (color !== undefined) {
      patch.color = color;
    }
    if (sizePx !== undefined) {
      patch.sizePx = sizePx;
      const screenPosition = worldToScreen(position, 1, bounds.height);
      patch.positionPx = [
        screenPosition.x + (0.5 - 0.5) * (GOBLIN_FRAME.width - sizePx[0]),
        screenPosition.y + (0.5 - 0.84) * (GOBLIN_FRAME.height - sizePx[1]),
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
    if (knockbackTimer <= 0) {
      return null;
    }
    const intensity = Math.max(0, knockbackTimer / knockbackDuration);
    knockbackTimer = Math.max(0, knockbackTimer - Math.max(0, deltaSeconds));
    return {
      x: knockback.x * intensity,
      y: knockback.y * intensity,
    };
  }

  return {
    layers: Object.values(layers),
    get state() {
      return stateMachine.state;
    },
    attack(direction) {
      if (disposed) {
        return false;
      }
      const transition = stateMachine.startAttack();
      if (!transition.changed) {
        return false;
      }
      const selection = selectGoblinAttackAnimation(direction, facing);
      facing = selection.facing;
      currentFlipX = selection.flipX;
      playStateAnimation(selection.name);
      return true;
    },
    dispose() {
      if (disposed) {
        return;
      }
      disposed = true;
      if (activeAnimation) {
        api.stopSpriteAnimation(activeAnimation);
        activeAnimation = null;
      }
      for (const sprite of Object.values(sprites)) {
        api.removeSprite2D(sprite);
      }
      for (const layer of Object.values(layers)) {
        layer.visible = false;
      }
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
        GOBLIN_COMBAT_COLLIDER,
      );
    },
    getGridPosition(tileSize) {
      return worldToGrid(position, tileSize, {
        width: GOBLIN_FRAME.width,
        height: GOBLIN_FRAME.height,
        pivotX: GOBLIN_PIVOT.x,
        pivotY: GOBLIN_PIVOT.y,
      });
    },
    getPosition() {
      return { ...position };
    },
    playAnimation(manager) {
      animationManager = manager;
      playStateAnimation("idle");
    },
    setVisualTransform,
    setMovementIntent(movement) {
      movementIntent = normalizeMovement(movement);
    },
    update(deltaSeconds, dynamicColliders = []) {
      if (disposed) {
        return { position: { ...position }, state: stateMachine.state };
      }
      const knockbackMovement = getKnockbackMovement(deltaSeconds);
      if (knockbackMovement) {
        position = moveWithCollisions(
          position,
          knockbackMovement,
          Math.hypot(knockbackMovement.x, knockbackMovement.y) * deltaSeconds,
          bounds,
          character,
          [
            ...obstacles,
            ...dynamicColliders.map(({ collider }) => collider),
          ],
        );
        updateSprites();
        return { position: { ...position }, state: stateMachine.state };
      }
      if (stateMachine.state !== EnemyState.ATTACKING) {
        if (movementIntent.x !== 0) {
          facing = movementIntent.x < 0 ? -1 : 1;
        }
        currentFlipX = facing < 0;
        const transition = stateMachine.updateLocomotion(movementIntent);
        if (transition.changed) {
          playStateAnimation(transition.state);
        }
      }
      const movement = stateMachine.movementLocked
        ? { x: 0, y: 0 }
        : movementIntent;
      position = moveWithCollisions(
        position,
        movement,
        movementSpeed * Math.max(0, deltaSeconds),
        bounds,
        character,
        [
          ...obstacles,
          ...dynamicColliders.map(({ collider }) => collider),
        ],
      );
      updateSprites();
      return { position: { ...position }, state: stateMachine.state };
    },
    applyKnockback,
  };
}
