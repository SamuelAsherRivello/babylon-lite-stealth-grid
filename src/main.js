import {
  addSprite2D,
  createEngine,
  createSprite2DLayer,
  createSpriteAnimationManager,
  createSpriteRenderer,
  loadSpriteAtlas,
  playSprite2DAnimation,
  registerSpriteRenderer,
  startEngine,
  updateSpriteAnimationManager,
} from "@babylonjs/lite";

import {
  createTerrainReviewTiles,
  gridCellToScreenForFrame,
  getLogicalViewportScale,
} from "./game-logic.js";
import { GRID } from "./grid-contract.js";
import {
  NON_WALKABLE_TERRAIN_FRAMES,
  PARTIAL_TERRAIN_COLLIDERS,
} from "./terrain-collision-config.js";
import { createPlayer, loadPlayerAtlases } from "./player.js";
import {
  createProjectileRenderer,
  loadArrowAtlas,
} from "./projectile-renderer.js";
import { createPauseController } from "./pause-controller.js";
import { PARTICLE_FX_CLASS_BY_KEY } from "./particle-fx/index.js";
import { createParticleFxPreviewLayout } from "./particle-fx/preview-layout.js";
import { createCoordinatesUi } from "./ui/coordinates-ui.js";
import { createSettingsUi } from "./ui/settings-ui.js";
import {
  DEBUG_SETTING_KEYS,
  settingsStore,
} from "./settings-store.js";

const SCREEN_WIDTH = GRID.widthPx;
const SCREEN_HEIGHT = GRID.heightPx;
const TILE_SIZE = GRID.tileSizePx;
const TERRAIN_FRAME_COUNT = 54;
const TERRAIN_COLUMNS = 9;
const WATER_FOAM_FRAME_SIZE = 192;
const WATER_FOAM_FRAME_COUNT = 16;
const WATER_FOAM_FRAME_DURATION_MS = 100;
const EMPTY_TERRAIN_FRAMES = new Set([
  4, 13, 22, 31, 37, 38, 40, 46, 47, 49,
]);

const canvas = document.querySelector("#renderCanvas");
const debugCanvas = document.querySelector("#debugCanvas");
const debugContext = debugCanvas.getContext("2d");
const errorOutput = document.querySelector("#error");
const gameUi = document.querySelector("#gameUi");
const coordinatesUi = createCoordinatesUi();

async function start() {
  if (!navigator.gpu) {
    throw new Error("This Babylon Lite demo requires a browser with WebGPU enabled.");
  }

  const engine = await createEngine(canvas);
  const animationManager = createSpriteAnimationManager();
  const [terrainAtlas, archerAtlas, arrowAtlas, waterFoamAtlas] = await Promise.all([
    loadSpriteAtlas(engine, "./assets/terrain/Tilemap_color3.png", {
      gridSize: [TILE_SIZE, TILE_SIZE],
      sampling: "nearest",
    }),
    loadPlayerAtlases(engine),
    loadArrowAtlas(engine),
    loadSpriteAtlas(engine, "./assets/terrain/Water Foam.png", {
      gridSize: [WATER_FOAM_FRAME_SIZE, WATER_FOAM_FRAME_SIZE],
      sampling: "nearest",
    }),
  ]);

  const terrainTiles = createTerrainReviewTiles(
    TERRAIN_FRAME_COUNT,
    TERRAIN_COLUMNS,
    TILE_SIZE,
    SCREEN_HEIGHT,
    NON_WALKABLE_TERRAIN_FRAMES,
    EMPTY_TERRAIN_FRAMES,
    PARTIAL_TERRAIN_COLLIDERS,
  );
  const obstacleColliders = terrainTiles
    .filter(({ collider }) => collider !== null)
    .map(({ collider }) => collider);

  const terrainLayer = createSprite2DLayer(terrainAtlas, {
    capacity: TERRAIN_FRAME_COUNT,
    order: 0,
    pivot: [0, 0],
  });

  for (const tile of terrainTiles) {
    if (!tile.valid) {
      continue;
    }

    addSprite2D(terrainLayer, {
      positionPx: [tile.screenPosition.x, tile.screenPosition.y],
      sizePx: [TILE_SIZE, TILE_SIZE],
      frame: tile.frame,
    });
  }

  const projectiles = createProjectileRenderer({
    atlas: arrowAtlas,
    bounds: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
    obstacles: obstacleColliders,
  });
  const player = createPlayer({
    atlases: archerAtlas,
    bounds: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
    obstacles: obstacleColliders,
    initialPosition: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 },
    onShoot: (position, direction) => projectiles.shoot(position, direction),
  });

  // Temporary preview layer: keep animated terrain isolated until the final
  // terrain-layering strategy is decided.
  const animatedTerrainLayer = createSprite2DLayer(waterFoamAtlas, {
    capacity: 1,
    order: 2,
    pivot: [0, 0],
  });
  const waterFoamPosition = gridCellToScreenForFrame(
    { x: 0, y: 0 },
    TILE_SIZE,
    WATER_FOAM_FRAME_SIZE,
    SCREEN_HEIGHT,
  );
  const waterFoam = addSprite2D(animatedTerrainLayer, {
    positionPx: [waterFoamPosition.x, waterFoamPosition.y],
    sizePx: [WATER_FOAM_FRAME_SIZE, WATER_FOAM_FRAME_SIZE],
    frame: 0,
  });

  const particleFxLayout = createParticleFxPreviewLayout(
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
  );
  const particleEffects = await Promise.all(
    particleFxLayout.map(({ key, position, order }) => (
      PARTICLE_FX_CLASS_BY_KEY[key].create({
        engine,
        animationManager,
        position,
        order,
      })
    )),
  );

  const renderer = createSpriteRenderer(engine, {
    layers: [
      terrainLayer,
      ...player.layers,
      projectiles.layer,
      animatedTerrainLayer,
      ...particleEffects.map((effect) => effect.layer),
    ],
    clearValue: { r: 0.25, g: 0.48, b: 0.22, a: 1 },
  });
  registerSpriteRenderer(renderer);

  player.playAnimation(animationManager);
  playSprite2DAnimation(
    animationManager,
    waterFoam,
    0,
    WATER_FOAM_FRAME_COUNT - 1,
    true,
    WATER_FOAM_FRAME_DURATION_MS,
  );
  for (const effect of particleEffects) {
    effect.play();
  }
  globalThis.particleFxPreview = Object.freeze({
    effects: Object.freeze([...particleEffects]),
  });

  let previousTime = performance.now();
  let showColliders = settingsStore.get(DEBUG_SETTING_KEYS.showColliders);
  const unsubscribeColliders = settingsStore.subscribe(
    DEBUG_SETTING_KEYS.showColliders,
    (value) => {
      showColliders = value;
      if (!value) {
        debugContext.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      }
    },
  );
  const pauseController = createPauseController({
    onPause: () => player.setInputEnabled(false),
    onResume: () => {
      player.setInputEnabled(true);
      previousTime = performance.now();
    },
  });
  createSettingsUi({ host: gameUi, pauseController });

  function update(currentTime) {
    const deltaSeconds = Math.min((currentTime - previousTime) / 1000, 0.05);
    previousTime = currentTime;
    const activeDelta = pauseController.getDelta(deltaSeconds);

    const viewportScale = getLogicalViewportScale(
      canvas.width,
      canvas.height,
      SCREEN_WIDTH,
      SCREEN_HEIGHT,
    );
    terrainLayer.view.zoom = viewportScale;
    for (const layer of player.layers) {
      layer.view.zoom = viewportScale;
    }
    projectiles.layer.view.zoom = viewportScale;
    animatedTerrainLayer.view.zoom = viewportScale;
    for (const effect of particleEffects) {
      effect.layer.view.zoom = viewportScale;
    }

    updateSpriteAnimationManager(animationManager, activeDelta * 1000);
    if (activeDelta > 0) {
      const { position } = player.update(activeDelta);
      projectiles.update(activeDelta);
      const gridPosition = player.getGridPosition(TILE_SIZE);
      coordinatesUi.update(position, gridPosition);
    }
    drawDiagnostics(terrainTiles, player.getCollider(), projectiles.getColliders(), showColliders);

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
  window.addEventListener("pagehide", () => {
    unsubscribeColliders();
    for (const effect of particleEffects) {
      effect.stop();
    }
    player.dispose();
    projectiles.dispose();
  }, { once: true });
  await startEngine(engine);
}

function worldAabbToScreen(aabb) {
  return {
    x: aabb.x,
    y: SCREEN_HEIGHT - aabb.y - aabb.height,
    width: aabb.width,
    height: aabb.height,
  };
}

function drawAabb(aabb, fillStyle, strokeStyle) {
  const screenAabb = worldAabbToScreen(aabb);
  debugContext.fillStyle = fillStyle;
  debugContext.fillRect(
    screenAabb.x,
    screenAabb.y,
    screenAabb.width,
    screenAabb.height,
  );
  debugContext.strokeStyle = strokeStyle;
  debugContext.lineWidth = 2;
  debugContext.strokeRect(
    screenAabb.x + 1,
    screenAabb.y + 1,
    screenAabb.width - 2,
    screenAabb.height - 2,
  );
}

function drawPolygon(polygon, fillStyle, strokeStyle) {
  const screenPoints = polygon.points.map((point) => ({
    x: point.x,
    y: SCREEN_HEIGHT - point.y,
  }));
  debugContext.beginPath();
  debugContext.moveTo(screenPoints[0].x, screenPoints[0].y);
  for (const point of screenPoints.slice(1)) {
    debugContext.lineTo(point.x, point.y);
  }
  debugContext.closePath();
  debugContext.fillStyle = fillStyle;
  debugContext.fill();
  debugContext.strokeStyle = strokeStyle;
  debugContext.lineWidth = 2;
  debugContext.stroke();
}

function drawTerrainCollider(collider) {
  if (collider.type === "polygon") {
    drawPolygon(collider, "rgb(255 44 72 / 24%)", "#ff2c48");
    return;
  }

  drawAabb(collider, "rgb(255 44 72 / 24%)", "#ff2c48");
}

function drawCircle(circle, fillStyle, strokeStyle) {
  debugContext.beginPath();
  debugContext.arc(
    circle.x,
    SCREEN_HEIGHT - circle.y,
    circle.radius,
    0,
    Math.PI * 2,
  );
  debugContext.fillStyle = fillStyle;
  debugContext.fill();
  debugContext.strokeStyle = strokeStyle;
  debugContext.lineWidth = 2;
  debugContext.stroke();
}

function drawCharacterCollider(collider) {
  if (collider.type === "circle") {
    drawCircle(collider, "rgb(36 228 255 / 20%)", "#24e4ff");
    return;
  }

  drawAabb(collider, "rgb(36 228 255 / 20%)", "#24e4ff");
}

function drawDiagnostics(terrainTiles, characterCollider, projectileColliders, enabled) {
  debugContext.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  if (!enabled) {
    return;
  }
  debugContext.font = "700 14px system-ui, sans-serif";
  debugContext.textBaseline = "top";

  for (const tile of terrainTiles) {
    if (tile.collider) {
      drawTerrainCollider(tile.collider);
    }

    const label = String(tile.frame);
    const labelWidth = debugContext.measureText(label).width + 8;
    debugContext.fillStyle = "rgb(5 10 18 / 78%)";
    debugContext.fillRect(
      tile.screenPosition.x + 3,
      tile.screenPosition.y + 3,
      labelWidth,
      20,
    );
    debugContext.fillStyle = tile.valid ? "#ffffff" : "#8f969f";
    debugContext.fillText(
      label,
      tile.screenPosition.x + 7,
      tile.screenPosition.y + 5,
    );
  }

  drawCharacterCollider(characterCollider);
  for (const { collider } of projectileColliders) {
    drawAabb(collider, "rgb(255 220 64 / 38%)", "#ffe066");
  }
}

start().catch((error) => {
  console.error(error);
  errorOutput.textContent = error instanceof Error ? error.message : String(error);
});
