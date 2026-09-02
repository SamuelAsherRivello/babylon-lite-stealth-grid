import { createDistanceImpulse } from "../../gameplay/player-damage.js";
import { createBushGravity } from "./bush-gravity.js";
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
  getCharacterCollider,
  isColliderWithinBounds,
  getMovementVector,
  moveWithCollisions,
  selectMovementInput,
  worldToScreen,
} from "../../gameplay/game-logic.js";
import { GRID } from "../../systems/environment/grid-contract.js";
import { PlayerState, createPlayerStateMachine } from "./player-state.js";
import { createVirtualController } from "../../../plugins/virtual-controller-babylon-lite/index.js";
import { getCharacterGridCell, getCharacterLayerOrder } from "../character-spatial.js";
import { GridSpot } from "../../systems/environment/grid-spot.js";
import {
  PLAYER_ITEMS,
  PLAYER_PAWN_FRAME,
  PLAYER_WEAPONS,
  cycleLoadout,
} from "./player-pawn-catalog.js";
import {
  CardinalDirection,
  createCardinalDirectionMemory,
} from "../../gameplay/cardinal-direction.js";

export function getLoadoutCycleType(event) {
  if (event.code === "Digit1" || event.code === "Numpad1" || event.key === "1") {
    return "weapon";
  }
  if (event.code === "Digit2" || event.code === "Numpad2" || event.key === "2") {
    return "item";
  }
  return null;
}

export const PLAYER_FRAME = PLAYER_PAWN_FRAME;
export const PLAYER_PIVOT = { x: 0.5, y: 0.78 };
// Artwork offset within the character's grid cell. Colliders stay anchored
// to the gameplay position so this can be tuned independently later.
export const PLAYER_ART_OFFSET = Object.freeze({ x: 0, y: -40 });
export const PLAYER_MOVEMENT_COLLIDER = {
  type: "circle",
  x: PLAYER_FRAME.width * PLAYER_PIVOT.x,
  y: PLAYER_FRAME.height * PLAYER_PIVOT.y,
  radius: 18.2,
};
export const PLAYER_COMBAT_COLLIDER = {
  x: PLAYER_FRAME.width * PLAYER_PIVOT.x - GRID.tileSizePx / 2,
  y: PLAYER_FRAME.height * PLAYER_PIVOT.y + GRID.tileSizePx / 2 - GRID.tileSizePx,
  width: GRID.tileSizePx,
  height: GRID.tileSizePx,
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
  const [idle, run, shoot, ...loadoutAtlases] = await Promise.all([
    loadSpriteAtlas(engine, "./assets/player/pawn/Pawn_Idle.png", options),
    loadSpriteAtlas(engine, "./assets/player/pawn/Pawn_Run.png", options),
    loadSpriteAtlas(engine, "./assets/player/pawn/Pawn_Interact Knife.png", options),
    ...["Axe", "Gold", "Hammer", "Knife", "Meat", "Pickaxe", "Wood"].flatMap((name) => [
      loadSpriteAtlas(engine, `./assets/player/pawn/Pawn_Idle ${name}.png`, options),
      loadSpriteAtlas(engine, `./assets/player/pawn/Pawn_Run ${name}.png`, options),
    ]),
  ]);
  const atlases = { idle, run, shoot };
  for (const [index, name] of ["axe", "gold", "hammer", "knife", "meat", "pickaxe", "wood"].entries()) {
    atlases[`idle-${name}`] = loadoutAtlases[index * 2];
    atlases[`run-${name}`] = loadoutAtlases[index * 2 + 1];
  }
  return atlases;
}

export function createPlayer({
  atlases,
  bounds,
  obstacles,
  initialPosition,
  onShoot = () => {},
  onDropItem = () => {},
}) {
  let position = { ...initialPosition };
  const gridSpot = new GridSpot(position, { width: GRID.tileSizePx, height: GRID.tileSizePx });
  const getArtScreenPosition = (worldPosition) => worldToScreen({
    x: worldPosition.x + PLAYER_ART_OFFSET.x,
    y: worldPosition.y + PLAYER_ART_OFFSET.y,
  }, 1, bounds.height);
  const initialScreenPosition = getArtScreenPosition(position);
  const initialOrder = getCharacterLayerOrder(
    getCharacterCollider(position, PLAYER_FRAME, PLAYER_PIVOT, PLAYER_MOVEMENT_COLLIDER),
    bounds.height,
  );
  const layers = {};
  const sprites = {};
  for (const animation of Object.keys(atlases)) {
    const layer = createSprite2DLayer(atlases[animation], {
      capacity: 1,
      order: initialOrder,
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
  let inputEnabled = true;
  const bushGravity = createBushGravity();
  const knockbackImpulse = createDistanceImpulse();
  const stateMachine = createPlayerStateMachine();
  let weaponSlot = null;
  let itemSlot = null;
  let presentationOverride = null;
  let presentationOverrideTimer = 0;
  let animationManager = null;
  let activeAnimation = null;
  let visualAlpha = 1;
  let renderOrderOverride = null;
  const shotDirectionMemory = createCardinalDirectionMemory(
    CardinalDirection.RIGHT,
  );
  const gridAlignedMovement = createGridAlignedMovementController(
    PLAYER_CHARACTER,
    GRID.tileSizePx,
  );

  function getSelectedMovement() {
    if (!inputEnabled) return { x: 0, y: 0 };
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
    const visibleName = name === "idle" || name === "run"
      ? getLocomotionAnimationName(name)
      : name;
    for (const [layerName, layer] of Object.entries(layers)) {
      layer.visible = layerName === visibleName;
    }
    const lastFrame = visibleName.startsWith("idle")
      ? 7
      : visibleName.startsWith("run") ? 5 : 3;
    activeAnimation = playSprite2DAnimation(
      animationManager,
      sprites[visibleName],
      0,
      lastFrame,
      visibleName !== "shoot",
      100,
      visibleName === "shoot"
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

  function getLocomotionAnimationName(name) {
    const suffix = presentationOverride
      || itemSlot
      || (!itemSlot && weaponSlot);
    return suffix ? `${name}-${suffix}` : name;
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
    if (!inputEnabled || !weaponSlot) {
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
      visualAlpha = alpha;
      for (const layer of Object.values(layers)) {
        layer.opacity = visualAlpha;
      }
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
        screenPosition.x + (0.5 - PLAYER_PIVOT.x) * (PLAYER_FRAME.width - sizePx[0]),
        screenPosition.y + (0.5 - PLAYER_PIVOT.y) * (PLAYER_FRAME.height - sizePx[1]),
      ];
    }
    for (const sprite of Object.values(sprites)) {
      updateSprite2D(sprite, patch);
    }
  }

  function updateSprites() {
    const screenPosition = getArtScreenPosition(position);
    const order = renderOrderOverride ?? getCharacterLayerOrder(
      getCharacterCollider(position, PLAYER_FRAME, PLAYER_PIVOT, PLAYER_MOVEMENT_COLLIDER),
      bounds.height,
    );
    for (const layer of Object.values(layers)) layer.order = order;
    for (const sprite of Object.values(sprites)) {
      updateSprite2D(sprite, {
        positionPx: [screenPosition.x, screenPosition.y],
      });
    }
  }

  function useItem() {
    if (!inputEnabled || !itemSlot) return;
    const item = itemSlot;
    itemSlot = null;
    presentationOverride = null;
    onDropItem(item, { ...position }, getSelectedMovement());
    playStateAnimation(stateMachine.state === PlayerState.RUNNING ? "run" : "idle");
  }

  const virtualController = createVirtualController({
    joystick: document.querySelector("#movement-joystick"),
    puck: document.querySelector("#movement-puck"),
    itemButton: document.querySelector("#item-action"),
    attackButton: document.querySelector("#attack-action"),
    onItem: useItem,
    onAttack: shoot,
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
    const loadoutCycleType = getLoadoutCycleType(event);
    if (loadoutCycleType && !event.repeat) {
      event.preventDefault();
      if (inputEnabled && stateMachine.canChangeLoadout) {
        if (loadoutCycleType === "weapon") {
          weaponSlot = cycleLoadout(weaponSlot, PLAYER_WEAPONS);
          presentationOverride = weaponSlot;
          presentationOverrideTimer = weaponSlot ? 0.5 : 0;
        } else {
          itemSlot = cycleLoadout(itemSlot, PLAYER_ITEMS);
          presentationOverride = itemSlot;
          presentationOverrideTimer = 0;
        }
        if (stateMachine.state !== PlayerState.ATTACKING) {
          playStateAnimation(
            stateMachine.state === PlayerState.RUNNING ? "run" : "idle",
          );
        }
      }
      return;
    }
    if (event.code === "KeyC" || event.code === "KeyV") {
      event.preventDefault();
      if (!event.repeat && inputEnabled) {
        if (event.code === "KeyC") {
          useItem();
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
    distance = speed * duration / 2,
  } = {}) {
    knockbackImpulse.start(direction, { distance, duration });
    bushGravity.cancel();
  }

  function getKnockbackMovement(deltaSeconds) {
    const displacement = knockbackImpulse.step(deltaSeconds);
    return displacement && { x: displacement.x / Math.max(deltaSeconds, 1e-9), y: displacement.y / Math.max(deltaSeconds, 1e-9) };
  }

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", handleBlur);

  return {
    layers: Object.values(layers),
    observeHidingBushes(bushes) {
      const wasActive = bushGravity.active;
      bushGravity.observe(bushes, position, inputEnabled && !knockbackImpulse.active);
      if (wasActive !== bushGravity.active) gridAlignedMovement.reset();
    },
    isGravityMoving() { return bushGravity.active; },
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
    setPosition(next) { position = { ...next }; gridSpot.update(position); updateSprites(); },
    getLoadout() {
      return { weapon: weaponSlot, item: itemSlot };
    },
    getGridPosition(tileSize) {
      if (tileSize === GRID.tileSizePx) return { ...gridSpot.cell };
      return getCharacterGridCell(this.getMovementCollider(), tileSize);
    },
    getGridSpot() { return gridSpot; },
    getHeading() {
      return stateMachine.heading;
    },
    resetInput,
    setInputEnabled(enabled) {
      inputEnabled = Boolean(enabled);
      if (!inputEnabled) {
        bushGravity.cancel();
        resetInput();
      }
    },
    playAnimation(manager) {
      animationManager = manager;
      playStateAnimation("idle");
    },
    setVisualTransform,
    setRenderOrder(order) {
      renderOrderOverride = order === null ? null : Number(order);
      updateSprites();
    },
    update(deltaSeconds, dynamicColliders = []) {
      if (presentationOverrideTimer > 0) {
        presentationOverrideTimer = Math.max(
          0,
          presentationOverrideTimer - Math.max(0, deltaSeconds),
        );
        if (presentationOverrideTimer === 0) {
          presentationOverride = null;
          playStateAnimation(
            stateMachine.state === PlayerState.RUNNING ? "run" : "idle",
          );
        }
      }
      const selectedMovement = bushGravity.movementLocked ? { x: 0, y: 0 } : getSelectedMovement();
      const knockbackMovement = getKnockbackMovement(deltaSeconds);
      const transition = stateMachine.updateLocomotion(selectedMovement);
      if (transition.changed) {
        playStateAnimation(getAnimationName(transition.state));
      }

      if (
        inputEnabled
        && stateMachine.state === PlayerState.SHOOTING
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
        const length = Math.hypot(movement.x, movement.y) || 1;
        const direction = { x: movement.x / length, y: movement.y / length };
        const steps = Math.max(1, Math.ceil(distance));
        for (let step = 0; step < steps; step++) {
          const candidate = moveWithCollisions(position, direction, distance / steps, bounds, PLAYER_CHARACTER, activeObstacles);
          const collider = getCharacterCollider(candidate, PLAYER_FRAME, PLAYER_PIVOT, PLAYER_MOVEMENT_COLLIDER);
          if (isColliderWithinBounds(collider, bounds.width, bounds.height)) position = candidate;
        }
      } else if (bushGravity.movementLocked) {
        gridAlignedMovement.reset();
        const target = bushGravity.step(deltaSeconds);
        if (target) {
          const dx = target.x - position.x;
          const dy = target.y - position.y;
          const length = Math.hypot(dx, dy);
          const steps = Math.max(1, Math.ceil(length));
          const direction = length ? { x: dx / length, y: dy / length } : { x: 0, y: 0 };
          for (let step = 0; step < steps; step++) {
            const next = moveWithCollisions(position, direction, length / steps, bounds, PLAYER_CHARACTER, activeObstacles);
            const expected = { x: position.x + dx / steps, y: position.y + dy / steps };
            position = next;
            if (Math.hypot(next.x - expected.x, next.y - expected.y) > 1e-6) {
              bushGravity.cancel();
              break;
            }
            if (step === steps - 1) position = target;
          }
        }
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

      gridSpot.update(position);

      const screenPosition = getArtScreenPosition(position);
      const order = renderOrderOverride ?? getCharacterLayerOrder(this.getMovementCollider(), bounds.height);
      for (const layer of Object.values(layers)) {
        layer.order = order;
      }
      for (const sprite of Object.values(sprites)) {
        updateSprite2D(sprite, {
          positionPx: [screenPosition.x, screenPosition.y],
          flipX: stateMachine.facing < 0,
        });
      }

      return { movement, position: { ...position } };
    },
    applyKnockback,
  };
}
