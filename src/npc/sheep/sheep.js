import {
  addSprite2D,
  createSprite2DLayer,
  loadSpriteAtlas,
  playSprite2DAnimation,
  stopSpriteAnimation,
  updateSprite2D,
} from "@babylonjs/lite";

import {
  getCharacterCollider,
  moveWithCollisions,
  worldToScreen,
} from "../../game-logic.js";
import {
  CharacterType,
  SheepState,
  createFearProfile,
  createSheepStateMachine,
} from "./sheep-state.js";
import {
  createGridWalkability,
  gridCellCenter,
  planFleeRoute,
  planSeparationRoute,
} from "./sheep-navigation.js";
import { getYSortedLayerOrder } from "../../render-depth.js";

export const SHEEP_FRAME_SIZE = 128;
export const SHEEP_PIVOT = { x: 0.5, y: 0.84 };
const SHEEP_RENDER_OFFSET_Y = 12;
export const SHEEP_MOVEMENT_COLLIDER = {
  type: "circle",
  x: 64,
  y: 61,
  radius: 26,
};
export const SHEEP_COMBAT_COLLIDER = {
  x: 24,
  y: SHEEP_FRAME_SIZE * SHEEP_PIVOT.y - 56,
  width: 80,
  height: 56,
};

const FRAME_DURATION_MS = 100;
const ANIMATIONS = Object.freeze({
  idle: { frameCount: 8, loop: true },
  bouncing: { frameCount: 6, loop: false },
});
const DEFAULT_API = {
  addSprite2D,
  createSprite2DLayer,
  playSprite2DAnimation,
  stopSpriteAnimation,
  updateSprite2D,
};
const DEFAULT_KNOCKBACK_DURATION_SECONDS = 0.15;
const DEFAULT_KNOCKBACK_SPEED = 220;

export async function loadSheepAtlases(engine) {
  const options = {
    gridSize: [SHEEP_FRAME_SIZE, SHEEP_FRAME_SIZE],
    sampling: "nearest",
  };
  const [idle, bouncing] = await Promise.all([
    loadSpriteAtlas(engine, "./assets/npc/sheep/happy-sheep-idle.png", options),
    loadSpriteAtlas(engine, "./assets/npc/sheep/happy-sheep-bouncing.png", options),
  ]);
  return { idle, bouncing };
}

function validateFleeConfiguration(minimum, maximum, movementSpeed) {
  if (
    !Number.isInteger(minimum) || !Number.isInteger(maximum)
    || minimum < 1 || minimum > maximum
  ) {
    throw new RangeError("Flee distances must be ordered positive integers.");
  }
  if (!Number.isFinite(movementSpeed) || movementSpeed <= 0) {
    throw new RangeError("movementSpeed must be greater than zero.");
  }
}

export function createSheep({
  atlases,
  initialPosition,
  bounds,
  obstacles,
  grid,
  scareDistanceCells = 3,
  frighteningTypes = [CharacterType.PLAYER],
  minimumFleeDistanceCells = 1,
  maximumFleeDistanceCells = 3,
  movementSpeed = 180,
  random = Math.random,
  api = DEFAULT_API,
}) {
  validateFleeConfiguration(
    minimumFleeDistanceCells,
    maximumFleeDistanceCells,
    movementSpeed,
  );
  const fearProfile = createFearProfile({ scareDistanceCells, frighteningTypes });
  const character = {
    frame: { width: SHEEP_FRAME_SIZE, height: SHEEP_FRAME_SIZE },
    pivot: SHEEP_PIVOT,
    collider: SHEEP_MOVEMENT_COLLIDER,
  };
  const isWalkable = createGridWalkability({ bounds, character, grid, obstacles });
  const stateMachine = createSheepStateMachine({ fearProfile });
  let position = { ...initialPosition };
  let route = [];
  let animationManager = null;
  let activeAnimation = null;
  let facing = 1;
  let dynamicColliders = [];
  let knockback = { x: 0, y: 0 };
  let knockbackTimer = 0;
  let knockbackDuration = 0;

  const layers = {};
  const sprites = {};
  const initialScreenPosition = worldToScreen(position, 1, bounds.height);
  const initialOrder = getYSortedLayerOrder(position.y, bounds.height);
  for (const animationName of Object.keys(ANIMATIONS)) {
    const layer = api.createSprite2DLayer(atlases[animationName], {
      capacity: 1,
      order: initialOrder,
      pivot: [SHEEP_PIVOT.x, SHEEP_PIVOT.y],
      visible: animationName === SheepState.IDLE,
    });
    layers[animationName] = layer;
    sprites[animationName] = api.addSprite2D(layer, {
      positionPx: [initialScreenPosition.x, initialScreenPosition.y - SHEEP_RENDER_OFFSET_Y],
      sizePx: [SHEEP_FRAME_SIZE, SHEEP_FRAME_SIZE],
      frame: 0,
    });
  }

  function getGridCell() {
    return {
      x: Math.floor(position.x / grid.tileSizePx),
      y: Math.floor(position.y / grid.tileSizePx),
    };
  }

  function updateSprites() {
    const screenPosition = worldToScreen(position, 1, bounds.height);
    const order = getYSortedLayerOrder(position.y, bounds.height);
    for (const layer of Object.values(layers)) {
      layer.order = order;
    }
    for (const sprite of Object.values(sprites)) {
      api.updateSprite2D(sprite, {
        positionPx: [screenPosition.x, screenPosition.y - SHEEP_RENDER_OFFSET_Y],
        flipX: facing < 0,
      });
    }
  }

  function planRoute() {
    const separationIntent = stateMachine.separationIntent;
    if (separationIntent) {
      const separationBlockers = dynamicColliders.filter(
        ({ id }) => id !== separationIntent.partnerId,
      );
      return planSeparationRoute({
        start: getGridCell(),
        partner: separationIntent.partnerCell,
        preferredDirection: separationIntent.direction,
        isWalkable: (cell) => isWalkable(cell, separationBlockers),
      }).map((cell) => gridCellCenter(cell, grid.tileSizePx));
    }
    const threat = stateMachine.threat;
    if (!threat) {
      return [];
    }
    return planFleeRoute({
      start: getGridCell(),
      threat: threat.cell,
      minimumSteps: minimumFleeDistanceCells,
      maximumSteps: maximumFleeDistanceCells,
      isWalkable: (cell) => isWalkable(cell, dynamicColliders),
      random,
    }).map((cell) => gridCellCenter(cell, grid.tileSizePx));
  }

  function getAnimationName(state) {
    return state === SheepState.BOUNCING ? "bouncing" : "idle";
  }

  function playStateAnimation(state) {
    if (!animationManager) {
      return;
    }
    if (activeAnimation) {
      api.stopSpriteAnimation(activeAnimation);
    }
    const animationName = getAnimationName(state);
    for (const [name, layer] of Object.entries(layers)) {
      layer.visible = name === animationName;
    }
    const descriptor = ANIMATIONS[animationName];
    activeAnimation = api.playSprite2DAnimation(
      animationManager,
      sprites[animationName],
      0,
      descriptor.frameCount - 1,
      descriptor.loop,
      FRAME_DURATION_MS,
      state === SheepState.BOUNCING
        ? {
            onEnd: () => {
              route = planRoute();
              const transition = stateMachine.completeBouncing(route.length > 0);
              if (transition.changed) {
                playStateAnimation(transition.state);
              }
            },
          }
        : undefined,
    );
  }

  function stopRunning() {
    route = [];
    const transition = stateMachine.completeRunning();
    if (transition.changed) {
      playStateAnimation(transition.state);
    }
  }

  function updateRunning(deltaSeconds) {
    const target = route[0];
    if (!target) {
      stopRunning();
      return;
    }
    const offset = { x: target.x - position.x, y: target.y - position.y };
    const distance = Math.hypot(offset.x, offset.y);
    if (distance === 0) {
      route.shift();
      updateRunning(0);
      return;
    }
    const movement = { x: offset.x / distance, y: offset.y / distance };
    if (movement.x !== 0) {
      facing = movement.x < 0 ? -1 : 1;
    }
    const step = Math.min(movementSpeed * deltaSeconds, distance);
    const separationPartnerId = stateMachine.separationIntent?.partnerId;
    const movementBlockers = dynamicColliders.filter(
      ({ id }) => id !== separationPartnerId,
    );
    const nextPosition = moveWithCollisions(
      position,
      movement,
      step,
      bounds,
      character,
      [
        ...obstacles,
        ...movementBlockers.map(({ collider }) => collider),
      ],
    );
    if (nextPosition.x === position.x && nextPosition.y === position.y) {
      stopRunning();
      return;
    }
    position = nextPosition;
    if (Math.hypot(target.x - position.x, target.y - position.y) < 1e-7) {
      position = { ...target };
      route.shift();
      if (route.length === 0) {
        stopRunning();
      }
    }
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
        screenPosition.x + (0.5 - SHEEP_PIVOT.x) * (SHEEP_FRAME_SIZE - sizePx[0]),
        screenPosition.y - SHEEP_RENDER_OFFSET_Y
          + (0.5 - SHEEP_PIVOT.y) * (SHEEP_FRAME_SIZE - sizePx[1]),
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
    config: Object.freeze({
      scareDistanceCells,
      frighteningTypes: [...fearProfile.frighteningTypes],
      minimumFleeDistanceCells,
      maximumFleeDistanceCells,
      movementSpeed,
    }),
    layers: Object.values(layers),
    get state() {
      return stateMachine.state;
    },
    getPosition() {
      return { ...position };
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
        SHEEP_COMBAT_COLLIDER,
      );
    },
    getGridCell,
    getRequestedPosition(deltaSeconds) {
      if (knockbackTimer > 0) {
        const intensity = Math.max(0, knockbackTimer / knockbackDuration);
        return {
          x: position.x + knockback.x * intensity * deltaSeconds,
          y: position.y + knockback.y * intensity * deltaSeconds,
        };
      }
      if (stateMachine.state !== SheepState.RUNNING || !route[0]) {
        return { ...position };
      }
      const offset = { x: route[0].x - position.x, y: route[0].y - position.y };
      const distance = Math.hypot(offset.x, offset.y);
      if (distance <= 0) {
        return { ...position };
      }
      const step = Math.min(movementSpeed * Math.max(0, deltaSeconds), distance);
      return {
        x: position.x + offset.x / distance * step,
        y: position.y + offset.y / distance * step,
      };
    },
    getContactPartnerId() {
      return stateMachine.separationIntent?.partnerId ?? null;
    },
    playAnimation(manager) {
      animationManager = manager;
      playStateAnimation(SheepState.IDLE);
    },
    setVisualTransform,
    update(deltaSeconds, characters = [], currentDynamicColliders = []) {
      dynamicColliders = currentDynamicColliders;
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
      if (stateMachine.state === SheepState.IDLE) {
        const transition = stateMachine.updateFear(getGridCell(), characters);
        if (transition.changed) {
          playStateAnimation(transition.state);
        }
      } else if (stateMachine.state === SheepState.RUNNING) {
        updateRunning(deltaSeconds);
      }
      return { position: { ...position }, state: stateMachine.state };
    },
    applyKnockback,
    beginContact(intent) {
      route = [];
      const transition = stateMachine.beginContact(intent);
      if (transition.changed) {
        playStateAnimation(transition.state);
      }
      return transition;
    },
    dispose() {
      if (activeAnimation) {
        api.stopSpriteAnimation(activeAnimation);
        activeAnimation = null;
      }
    },
  };
}
