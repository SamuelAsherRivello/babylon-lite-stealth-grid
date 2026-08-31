import {
  addSprite2D,
  createSprite2DLayer,
  loadSpriteAtlas,
  playSprite2DAnimation,
  stopSpriteAnimation,
  updateSprite2D,
} from "@babylonjs/lite";

import {
  createGridAlignedMovementController,
  createJumpState,
  getCharacterCollider,
  getMovementVector,
  moveWithCollisions,
  selectMovementInput,
  startJump,
  updateJump,
  worldToGrid,
  worldToScreen,
} from "./game-logic.js";
import { GRID } from "./grid-contract.js";
import { PlayerState, createPlayerStateMachine } from "./player-state.js";
import { createVirtualController } from "./ui/virtual-controller.js";
import { GAME_DEPTH } from "./render-depth.js";
import {
  CardinalDirection,
  createCardinalDirectionMemory,
} from "./cardinal-direction.js";

export const PLAYER_FRAME = { width: 192, height: 192 };
export const PLAYER_PIVOT = { x: 0.5, y: 0.78 };
export const PLAYER_MOVEMENT_COLLIDER = {
  type: "circle",
  x: 93,
  y: 126,
  radius: 18.2,
};
export const PLAYER_COMBAT_COLLIDER = {
  x: 64,
  y: PLAYER_FRAME.height * PLAYER_PIVOT.y - 128,
  width: 64,
  height: 128,
};
const PLAYER_CHARACTER = {
  frame: PLAYER_FRAME,
  pivot: PLAYER_PIVOT,
  collider: PLAYER_MOVEMENT_COLLIDER,
};

const PLAYER_SPEED = 210;
const ENABLE_QUANTIZE_MOVEMENT = false;
const ARROW_SPAWN_OFFSETS = new Map([
  ["1,0", { x: 64, y: 55 }],
  ["-1,0", { x: -64, y: 55 }],
  ["0,1", { x: 0, y: 64 }],
  ["0,-1", { x: 0, y: 0 }],
]);
const DEFAULT_KNOCKBACK_DURATION_SECONDS = 0.15;
const DEFAULT_KNOCKBACK_SPEED = 300;
const MOVEMENT_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
]);

export function getArrowSpawnPosition(position, direction) {
  const offset = ARROW_SPAWN_OFFSETS.get(`${direction.x},${direction.y}`)
    ?? ARROW_SPAWN_OFFSETS.get("1,0");
  return {
    x: position.x + offset.x,
    y: position.y + offset.y,
  };
}

export async function loadPlayerAtlases(engine) {
  const options = {
    gridSize: [PLAYER_FRAME.width, PLAYER_FRAME.height],
    sampling: "nearest",
  };
  const [idle, run, shoot] = await Promise.all([
    loadSpriteAtlas(engine, "./assets/units/archer/Archer_Idle.png", options),
    loadSpriteAtlas(engine, "./assets/units/archer/Archer_Run.png", options),
    loadSpriteAtlas(engine, "./assets/units/archer/Archer_Shoot.png", options),
  ]);
  return { idle, run, shoot };
}

export function createPlayer({
  atlases,
  bounds,
  obstacles,
  initialPosition,
  onShoot = () => {},
}) {
  let position = { ...initialPosition };
  const initialScreenPosition = worldToScreen(position, 1, bounds.height);
  const layers = {};
  const sprites = {};
  for (const animation of ["idle", "run", "shoot"]) {
    const layer = createSprite2DLayer(atlases[animation], {
      capacity: 1,
      order: GAME_DEPTH.player,
      pivot: [PLAYER_PIVOT.x, PLAYER_PIVOT.y],
      visible: animation === "idle",
    });
    layers[animation] = layer;
    sprites[animation] = addSprite2D(layer, {
      positionPx: [initialScreenPosition.x, initialScreenPosition.y],
      sizePx: [PLAYER_FRAME.width, PLAYER_FRAME.height],
      frame: 0,
    });
  }

  const pressedKeys = new Set();
  const jumpState = createJumpState();
  let inputEnabled = true;
  let knockback = { x: 0, y: 0 };
  let knockbackTimer = 0;
  let knockbackDuration = 0;
  const stateMachine = createPlayerStateMachine();
  let animationManager = null;
  let activeAnimation = null;
  const shotDirectionMemory = createCardinalDirectionMemory(
    CardinalDirection.RIGHT,
  );
  const gridAlignedMovement = createGridAlignedMovementController(
    PLAYER_CHARACTER,
    GRID.tileSizePx,
  );

  function getSelectedMovement() {
    return selectMovementInput(
      getMovementVector(pressedKeys),
      virtualController.getMovement(),
    );
  }

  function playStateAnimation(name) {
    if (!animationManager) {
      return;
    }
    if (activeAnimation) {
      stopSpriteAnimation(activeAnimation);
    }
    for (const [layerName, layer] of Object.entries(layers)) {
      layer.visible = layerName === name;
    }
    const lastFrame = name === "idle" ? 5 : name === "run" ? 3 : 7;
    activeAnimation = playSprite2DAnimation(
      animationManager,
      sprites[name],
      0,
      lastFrame,
      name !== "shoot",
      100,
      name === "shoot"
        ? {
            onEnd: () => {
              const transition = stateMachine.completeShooting(
                getSelectedMovement(),
              );
              if (transition.changed) {
                playStateAnimation(getAnimationName(transition.state));
              }
            },
          }
        : undefined,
    );
  }

  function getAnimationName(state) {
    if (state === PlayerState.RUNNING) {
      return "run";
    }
    if (state === PlayerState.SHOOTING) {
      return "shoot";
    }
    return "idle";
  }

  function shoot() {
    if (!inputEnabled) {
      return;
    }
    const transition = stateMachine.startShooting(
      shotDirectionMemory.resolve(getSelectedMovement()),
    );
    if (transition.changed) {
      playStateAnimation(getAnimationName(transition.state));
    }
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
        screenPosition.x + (0.5 - PLAYER_PIVOT.x) * (PLAYER_FRAME.width - sizePx[0]),
        screenPosition.y + (0.5 - PLAYER_PIVOT.y) * (PLAYER_FRAME.height - sizePx[1]),
      ];
    }
    for (const sprite of Object.values(sprites)) {
      updateSprite2D(sprite, patch);
    }
  }

  const virtualController = createVirtualController({
    joystick: document.querySelector("#movement-joystick"),
    puck: document.querySelector("#movement-puck"),
    jumpButton: document.querySelector("#jump-action"),
    shootButton: document.querySelector("#shoot-action"),
    onJump: () => inputEnabled && startJump(jumpState),
    onShoot: shoot,
    onMovementChange: (movement) => {
      shotDirectionMemory.rememberMovement(movement);
    },
  });

  function resetInput() {
    pressedKeys.clear();
    virtualController.reset();
    gridAlignedMovement.reset();
  }

  function setKey(event, isPressed) {
    if (!MOVEMENT_KEYS.has(event.code)) {
      return;
    }

    event.preventDefault();
    if (!inputEnabled) {
      pressedKeys.delete(event.code);
      return;
    }
    if (isPressed) {
      pressedKeys.add(event.code);
      shotDirectionMemory.rememberCode(event.code, event.repeat);
    } else {
      pressedKeys.delete(event.code);
    }
  }

  function handleKeyDown(event) {
    if (event.code === "KeyC" || event.code === "KeyV") {
      event.preventDefault();
      if (!event.repeat && inputEnabled) {
        if (event.code === "KeyC") {
          startJump(jumpState);
        } else {
          shoot();
        }
      }
      return;
    }
    setKey(event, true);
  }

  function handleKeyUp(event) {
    setKey(event, false);
  }

  function handleBlur() {
    pressedKeys.clear();
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

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", handleBlur);

  return {
    layers: Object.values(layers),
    dispose() {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      virtualController.dispose();
      if (activeAnimation) {
        stopSpriteAnimation(activeAnimation);
      }
    },
    getMovementCollider() {
      return getCharacterCollider(
        position,
        PLAYER_FRAME,
        PLAYER_PIVOT,
        PLAYER_MOVEMENT_COLLIDER,
      );
    },
    getCombatCollider() {
      return getCharacterCollider(
        position,
        PLAYER_FRAME,
        PLAYER_PIVOT,
        PLAYER_COMBAT_COLLIDER,
      );
    },
    getPosition() {
      return { ...position };
    },
    getGridPosition(tileSize) {
      return worldToGrid(position, tileSize, {
        width: PLAYER_FRAME.width,
        height: PLAYER_FRAME.height,
        pivotX: PLAYER_PIVOT.x,
        pivotY: PLAYER_PIVOT.y,
      });
    },
    resetInput,
    setInputEnabled(enabled) {
      inputEnabled = Boolean(enabled);
      if (!inputEnabled) {
        resetInput();
      }
    },
    playAnimation(manager) {
      animationManager = manager;
      playStateAnimation("idle");
    },
    setVisualTransform,
    update(deltaSeconds, dynamicColliders = []) {
      const selectedMovement = getSelectedMovement();
      const knockbackMovement = getKnockbackMovement(deltaSeconds);
      const transition = stateMachine.updateLocomotion(selectedMovement);
      if (transition.changed) {
        playStateAnimation(getAnimationName(transition.state));
      }

      if (
        stateMachine.state === PlayerState.SHOOTING
        && activeAnimation
        && stateMachine.releaseShot(activeAnimation.current)
      ) {
        onShoot(
          getArrowSpawnPosition(position, stateMachine.shotDirection),
          stateMachine.shotDirection,
        );
      }

      const movement = knockbackMovement || (stateMachine.movementLocked
        ? { x: 0, y: 0 }
        : selectedMovement);
      const distance = knockbackMovement
        ? Math.hypot(knockbackMovement.x, knockbackMovement.y) * deltaSeconds
        : PLAYER_SPEED * deltaSeconds;
      const activeObstacles = [
        ...obstacles,
        ...dynamicColliders.map(({ collider }) => collider),
      ];
      if (knockbackMovement) {
        gridAlignedMovement.reset();
        position = moveWithCollisions(
          position,
          movement,
          distance,
          bounds,
          PLAYER_CHARACTER,
          activeObstacles,
        );
      } else if (ENABLE_QUANTIZE_MOVEMENT) {
        position = gridAlignedMovement.move(
          position,
          movement,
          distance,
          deltaSeconds,
          bounds,
          activeObstacles,
        );
      } else {
        gridAlignedMovement.reset();
        position = moveWithCollisions(
          position,
          movement,
          distance,
          bounds,
          PLAYER_CHARACTER,
          activeObstacles,
        );
      }

      const screenPosition = worldToScreen(position, 1, bounds.height);
      const jumpOffset = updateJump(jumpState, deltaSeconds);
      for (const sprite of Object.values(sprites)) {
        updateSprite2D(sprite, {
          positionPx: [screenPosition.x, screenPosition.y - jumpOffset],
          flipX: stateMachine.facing < 0,
        });
      }

      return { movement, position: { ...position } };
    },
    applyKnockback,
  };
}
