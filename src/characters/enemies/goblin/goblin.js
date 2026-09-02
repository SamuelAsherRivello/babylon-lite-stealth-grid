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
// Sprite coordinates use a screen-down Y offset; this asset's visible body
// sits one cell above the shared logical anchor inside its frame.
export const GOBLIN_ART_OFFSET = Object.freeze({ x: 0, y: -64 });
export const GOBLIN_MOVEMENT_COLLIDER = Object.freeze({
  type: "circle",
  x: 96,
  y: GOBLIN_FRAME.height * GOBLIN_PIVOT.y,
  radius: 24,
});
export const GOBLIN_COMBAT_COLLIDER = Object.freeze({
  x: GOBLIN_FRAME.width * GOBLIN_PIVOT.x - 64 / 2,
  y: GOBLIN_FRAME.height * GOBLIN_PIVOT.y + 64 / 2 - 64,
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
  onAttack = () => {},
  movementSpeed = 120,
  api = DEFAULT_API,
}) {
  const character = {
    frame: GOBLIN_FRAME,
    pivot: GOBLIN_PIVOT,
    collider: GOBLIN_MOVEMENT_COLLIDER,
  };
  const gridMovement = createGridAlignedMovementController(character, 64);
  const stateMachine = createEnemyStateMachine();
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

  const layers = {};
  const sprites = {};
  const getArtScreenPosition = (worldPosition) => worldToScreen({ x: worldPosition.x + GOBLIN_ART_OFFSET.x, y: worldPosition.y + GOBLIN_ART_OFFSET.y }, 1, bounds.height);
  const initialScreenPosition = getArtScreenPosition(position);
  const initialOrder = getCharacterLayerOrder(
    getCharacterCollider(position, character.frame, character.pivot, character.collider),
    bounds.height,
  );
  for (const name of GOBLIN_ANIMATION_NAMES) {
    const descriptor = GOBLIN_ANIMATION_CATALOG[name];
    const layer = api.createSprite2DLayer(atlases[name], {
      capacity: 1,
      order: initialOrder,
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
      const screenPosition = getArtScreenPosition(position);
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
    isMovementLocked() { return stateMachine.movementLocked || knockbackTimer > 0; },
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
      onAttack();
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
      playStateAnimation("idle");
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
    update(deltaSeconds, dynamicColliders = []) {
      if (disposed) {
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
      position = gridMovement.move(
        position,
        movement,
        movementSpeed * Math.max(0, deltaSeconds),
        deltaSeconds,
        bounds,
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
