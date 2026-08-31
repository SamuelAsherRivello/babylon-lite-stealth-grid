import {
  addSprite2D,
  createSprite2DLayer,
  loadSpriteAtlas,
  playSprite2DAnimation,
  stopSpriteAnimation,
  updateSprite2D,
} from "@babylonjs/lite";

import {
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
import { PlayerState, createPlayerStateMachine } from "./player-state.js";
import { createVirtualController } from "./ui/virtual-controller.js";

export const PLAYER_FRAME = { width: 192, height: 192 };
export const PLAYER_PIVOT = { x: 0.5, y: 0.78 };
export const PLAYER_COLLIDER = {
  type: "circle",
  x: 93,
  y: 126,
  radius: 26,
};

const PLAYER_SPEED = 210;
const ARROW_SPAWN_OFFSET = { x: 64, y: 55 };
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

export function getArrowSpawnPosition(position, facing) {
  return {
    x: position.x + facing * ARROW_SPAWN_OFFSET.x,
    y: position.y + ARROW_SPAWN_OFFSET.y,
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
      order: 1,
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
  const stateMachine = createPlayerStateMachine();
  let animationManager = null;
  let activeAnimation = null;

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
    const transition = stateMachine.startShooting();
    if (transition.changed) {
      playStateAnimation(getAnimationName(transition.state));
    }
  }

  const virtualController = createVirtualController({
    joystick: document.querySelector("#movement-joystick"),
    puck: document.querySelector("#movement-puck"),
    jumpButton: document.querySelector("#jump-action"),
    shootButton: document.querySelector("#shoot-action"),
    onJump: () => inputEnabled && startJump(jumpState),
    onShoot: shoot,
  });

  function resetInput() {
    pressedKeys.clear();
    virtualController.reset();
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
    getCollider() {
      return getCharacterCollider(
        position,
        PLAYER_FRAME,
        PLAYER_PIVOT,
        PLAYER_COLLIDER,
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
    update(deltaSeconds, dynamicColliders = []) {
      const selectedMovement = getSelectedMovement();
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
          getArrowSpawnPosition(position, stateMachine.facing),
          stateMachine.facing,
        );
      }

      const movement = stateMachine.movementLocked
        ? { x: 0, y: 0 }
        : selectedMovement;
      position = moveWithCollisions(
        position,
        movement,
        PLAYER_SPEED * deltaSeconds,
        bounds,
        {
          frame: PLAYER_FRAME,
          pivot: PLAYER_PIVOT,
          collider: PLAYER_COLLIDER,
        },
        [
          ...obstacles,
          ...dynamicColliders.map(({ collider }) => collider),
        ],
      );

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
  };
}
