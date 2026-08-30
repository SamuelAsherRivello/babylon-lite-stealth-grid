import {
  addSprite2D,
  attachSpriteAnimationsToRenderer,
  createEngine,
  createSprite2DLayer,
  createSpriteAnimationManager,
  createSpriteRenderer,
  loadSpriteAtlas,
  playSprite2DAnimation,
  registerSpriteRenderer,
  startEngine,
  updateSprite2D,
} from "@babylonjs/lite";

import {
  getMovementVector,
  moveWithinBounds,
  worldToScreen,
} from "./game-logic.js";

const SCREEN_WIDTH = 576;
const SCREEN_HEIGHT = 1024;
const TILE_SIZE = 64;
const ARCHER_FRAME_WIDTH = 192;
const ARCHER_FRAME_HEIGHT = 144;
const ARCHER_SPEED = 210;

const canvas = document.querySelector("#renderCanvas");
const coordinates = document.querySelector("#coordinates");
const errorOutput = document.querySelector("#error");
const pressedKeys = new Set();

async function start() {
  if (!navigator.gpu) {
    throw new Error("This Babylon Lite demo requires a browser with WebGPU enabled.");
  }

  const engine = await createEngine(canvas);
  const [terrainAtlas, archerAtlas] = await Promise.all([
    loadSpriteAtlas(engine, "./assets/terrain/Tilemap_color3.png", {
      gridSize: [TILE_SIZE, TILE_SIZE],
      sampling: "nearest",
    }),
    loadSpriteAtlas(engine, "./assets/units/archer/Archer_Run.png", {
      gridSize: [ARCHER_FRAME_WIDTH, ARCHER_FRAME_HEIGHT],
      sampling: "nearest",
    }),
  ]);

  const terrainLayer = createSprite2DLayer(terrainAtlas, {
    capacity: (SCREEN_WIDTH / TILE_SIZE) * (SCREEN_HEIGHT / TILE_SIZE),
    order: 0,
    pivot: [0, 0],
  });

  for (let y = 0; y < SCREEN_HEIGHT; y += TILE_SIZE) {
    for (let x = 0; x < SCREEN_WIDTH; x += TILE_SIZE) {
      addSprite2D(terrainLayer, {
        positionPx: [x, y],
        sizePx: [TILE_SIZE, TILE_SIZE],
        frame: 10,
      });
    }
  }

  const unitLayer = createSprite2DLayer(archerAtlas, {
    capacity: 1,
    order: 1,
    pivot: [0.5, 0.78],
  });

  let worldPosition = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 };
  const initialScreenPosition = worldToScreen(worldPosition, 1, SCREEN_HEIGHT);
  const archer = addSprite2D(unitLayer, {
    positionPx: [initialScreenPosition.x, initialScreenPosition.y],
    sizePx: [ARCHER_FRAME_WIDTH, ARCHER_FRAME_HEIGHT],
    frame: 0,
  });

  const renderer = createSpriteRenderer(engine, {
    layers: [terrainLayer, unitLayer],
    clearValue: { r: 0.25, g: 0.48, b: 0.22, a: 1 },
  });
  registerSpriteRenderer(renderer);

  const animationManager = createSpriteAnimationManager();
  attachSpriteAnimationsToRenderer(renderer, animationManager);
  playSprite2DAnimation(animationManager, archer, 0, 3, true, 100);

  let previousTime = performance.now();

  function update(currentTime) {
    const deltaSeconds = Math.min((currentTime - previousTime) / 1000, 0.05);
    previousTime = currentTime;

    const movement = getMovementVector(pressedKeys);
    worldPosition = moveWithinBounds(
      worldPosition,
      movement,
      ARCHER_SPEED * deltaSeconds,
      SCREEN_WIDTH,
      SCREEN_HEIGHT,
    );

    const screenPosition = worldToScreen(worldPosition, 1, SCREEN_HEIGHT);
    updateSprite2D(archer, {
      positionPx: [screenPosition.x, screenPosition.y],
      flipX: movement.x < 0 ? true : movement.x > 0 ? false : undefined,
    });
    coordinates.value = `X ${Math.round(worldPosition.x)} · Y ${Math.round(worldPosition.y)}`;

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
  await startEngine(engine);
}

function setKey(event, isPressed) {
  const movementKeys = new Set([
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowLeft",
    "ArrowDown",
    "ArrowRight",
  ]);

  if (!movementKeys.has(event.code)) {
    return;
  }

  event.preventDefault();
  if (isPressed) {
    pressedKeys.add(event.code);
  } else {
    pressedKeys.delete(event.code);
  }
}

window.addEventListener("keydown", (event) => setKey(event, true));
window.addEventListener("keyup", (event) => setKey(event, false));
window.addEventListener("blur", () => pressedKeys.clear());

start().catch((error) => {
  console.error(error);
  errorOutput.textContent = error instanceof Error ? error.message : String(error);
});
