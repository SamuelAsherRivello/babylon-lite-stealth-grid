import {
  addSpriteRendererLayer,
  addSprite2D,
  createEngine,
  createSprite2DLayer,
  createSpriteAnimationManager,
  createSpriteRenderer,
  loadSpriteAtlas,
  playSprite2DAnimation,
  registerSpriteRenderer,
  removeSpriteRendererLayer,
  startEngine,
  updateSpriteAnimationManager,
} from "@babylonjs/lite";

import {
  gridCellToScreenForFrame,
  getLogicalViewportScale,
  collidersOverlap,
} from "./game-logic.js";
import {
  collectTiledLayerTiles,
  formatLevelCellLabel,
  loadTiledMap,
} from "../plugins/tiled-babylon-lite/index.js";
import { GRID } from "./grid-contract.js";
import { createLevelTerrainTiles } from "./tiled-terrain.js";
import {
  PLAYER_FRAME,
  createPlayer,
  loadPlayerAtlases,
} from "./player.js";
import {
  GOBLIN_FRAME,
  createGoblin,
  loadGoblinAtlases,
} from "./enemies/goblin/goblin.js";
import {
  createGoblinDemoController,
} from "./enemies/goblin/goblin-demo-controller.js";
import {
  WARRIOR_FRAME,
  createWarrior,
  loadWarriorAtlases,
} from "./enemies/warrior/warrior.js";
import {
  createWarriorDemoController,
} from "./enemies/warrior/warrior-demo-controller.js";
import {
  SHEEP_FRAME_SIZE,
  createSheep,
  loadSheepAtlases,
} from "./npc/sheep/sheep.js";
import { CharacterType } from "./npc/sheep/sheep-state.js";
import { EnemyState } from "./enemies/enemy-state.js";
import {
  createProjectileRenderer,
  loadArrowAtlas,
} from "./projectile-renderer.js";
import { createPauseController } from "./pause-controller.js";
import {
  applyAnimatedTilePreviewSetting,
  applyParticleFxPreviewSetting,
} from "./preview-settings.js";
import { PARTICLE_FX_CLASS_BY_KEY } from "./particle-fx/index.js";
import { createParticleFxPreviewLayout } from "./particle-fx/preview-layout.js";
import { loadReleaseMetadata } from "./release-metadata.js";
import { createCoordinatesUi } from "./ui/coordinates-ui.js";
import { createReleaseMetadataUi } from "./ui/release-metadata-ui.js";
import { createSettingsUi } from "./ui/settings-ui.js";
import { createViewportSafeArea } from "./ui/viewport-safe-area.js";
import {
  DEBUG_SETTING_KEYS,
  settingsStore,
} from "./settings-store.js";
import {
  GAME_DEPTH,
  TILE_MAP_SUB_Z,
  getYSortedLayerOrder,
} from "./render-depth.js";
import { createSpawner } from "./spawner.js";
import {
  SpawnerCharacter,
  SpawnerType,
  createInitialSpawnerConfigs,
} from "./spawner-catalog.js";
import { createSpawnerMarker } from "./spawner-marker.js";
import { createReactiveDecoration } from "./decorations/reactive-decoration.js";

const SCREEN_WIDTH = GRID.widthPx;
const SCREEN_HEIGHT = GRID.heightPx;
const TILE_SIZE = GRID.tileSizePx;
const WATER_FOAM_FRAME_SIZE = 192;
const WATER_FOAM_FRAME_COUNT = 16;
const WATER_FOAM_FRAME_DURATION_MS = 100;
const DEATH_ANIMATION_DURATION_SECONDS = 0.25;
const DAMAGE_FLASH_DURATION_SECONDS = 0.4;
const DEATH_ROTATION_DEGREES = 20;
const MAX_HEALTH = 100;
const KNOCKBACK_DURATION_SECONDS = 0.2;
const KNOCKBACK_SPEED_PIXELS_PER_SECOND = 14.4;
const DEGREES_TO_RADIANS = Math.PI / 180;
const EMPTY_TERRAIN_FRAMES = new Set([
  4, 13, 22, 31, 37, 38, 40, 46, 47, 49,
]);

const canvas = document.querySelector("#renderCanvas");
const debugCanvas = document.querySelector("#debugCanvas");
const debugContext = debugCanvas.getContext("2d");
const errorOutput = document.querySelector("#error");
const gameUi = document.querySelector("#gameUi");
const uiLayer = document.querySelector("#uiLayer");
const gameFrame = document.querySelector(".game-frame");
const viewportSafeArea = createViewportSafeArea({ element: uiLayer, frameElement: gameFrame });
const coordinatesUi = createCoordinatesUi();

function createCombatActorState({
  label,
  getCollider,
  setVisualTransform,
  onDeathStart,
  onDeathProgress,
  onHitFlashStart,
  onKnockback,
}) {
  let health = MAX_HEALTH;
  let isDying = false;
  let isDead = false;
  let deathElapsedSeconds = 0;
  let deathRotation = 0;
  let hitFlashRemainingSeconds = 0;

  function startDeath() {
    if (isDying || isDead) {
      return;
    }
    isDying = true;
    deathElapsedSeconds = 0;
    deathRotation = (Math.random() < 0.5 ? -1 : 1) * DEATH_ROTATION_DEGREES;
    if (onDeathStart) {
      onDeathStart();
    }
  }

  function startHitFlash() {
    hitFlashRemainingSeconds = DAMAGE_FLASH_DURATION_SECONDS;
  }

  function getColliderForCombat() {
    if (!isDying && !isDead) {
      return getCollider();
    }
    return null;
  }

  return {
    label,
    get health() {
      return health;
    },
    get isAlive() {
      return !isDying && !isDead;
    },
    get isDying() {
      return isDying;
    },
    get isDead() {
      return isDead;
    },
    getCollider: getColliderForCombat,
    setVisualTransform,
    applyDamage(amount, hitDirection = { x: 1, y: 0 }) {
      if (!this.isAlive || amount <= 0) {
        return;
      }

      health -= amount;
      if (onKnockback && hitDirection) {
        onKnockback(hitDirection, {
          duration: KNOCKBACK_DURATION_SECONDS,
          speed: KNOCKBACK_SPEED_PIXELS_PER_SECOND,
        });
      }
      if (health <= 0) {
        startDeath();
        return;
      }
      if (onHitFlashStart) {
        onHitFlashStart();
      }
      startHitFlash();
    },
    updateDamageFlash(deltaSeconds) {
      if (hitFlashRemainingSeconds <= 0) {
        return;
      }

      const progress = Math.max(
        0,
        hitFlashRemainingSeconds / DAMAGE_FLASH_DURATION_SECONDS,
      );
      const whiteBoost = 0.6 * progress;
      hitFlashRemainingSeconds -= Math.max(0, deltaSeconds);
      setVisualTransform({
        color: [1 + whiteBoost, 1 + whiteBoost, 1 + whiteBoost, 1],
      });
      if (hitFlashRemainingSeconds <= 0) {
        setVisualTransform({
          color: [1, 1, 1, 1],
        });
      }
    },
    updateDeath(deltaSeconds) {
      if (!isDying) {
        this.updateDamageFlash(deltaSeconds);
        return;
      }

      deathElapsedSeconds += Math.max(0, deltaSeconds);
      const progress = Math.min(
        1,
        deathElapsedSeconds / DEATH_ANIMATION_DURATION_SECONDS,
      );
      const value = 1 - progress;
      if (onDeathProgress) {
        onDeathProgress(value);
      }
      const rotation = (deathRotation * DEGREES_TO_RADIANS) * progress;
      setVisualTransform({
        scaleX: value,
        scaleY: value,
        alpha: value,
        rotation,
      });

      if (progress >= 1) {
        isDying = false;
        isDead = true;
      }
    },
  };
}

function makeTouchKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function makeDirection(from, to) {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const distance = Math.hypot(deltaX, deltaY) || 1;
  return {
    x: deltaX / distance,
    y: deltaY / distance,
  };
}

async function start() {
  if (!navigator.gpu) {
    throw new Error("This Babylon Lite demo requires a browser with WebGPU enabled.");
  }

  const engine = await createEngine(canvas);
  const animationManager = createSpriteAnimationManager();
  const [
    level,
    terrainAtlas,
    archerAtlas,
    arrowAtlas,
    waterFoamAtlas,
    sheepAtlases,
    goblinAtlases,
    warriorAtlases,
    releaseMetadata,
  ] = await Promise.all([
    loadTiledMap(`${import.meta.env.BASE_URL}levels/tiled/maps/Level01.tmj`),
    loadSpriteAtlas(engine, "./assets/terrain/tilesets/Tilemap_color3.png", {
      gridSize: [TILE_SIZE, TILE_SIZE],
      sampling: "nearest",
    }),
    loadPlayerAtlases(engine),
    loadArrowAtlas(engine),
    loadSpriteAtlas(engine, "./assets/terrain/Water Foam.png", {
      gridSize: [WATER_FOAM_FRAME_SIZE, WATER_FOAM_FRAME_SIZE],
      sampling: "nearest",
    }),
    loadSheepAtlases(engine),
    loadGoblinAtlases(engine),
    loadWarriorAtlases(engine),
    loadReleaseMetadata(import.meta.env.BASE_URL),
  ]);

  const terrainTiles = createLevelTerrainTiles(
    collectTiledLayerTiles(level),
    TILE_SIZE,
    SCREEN_HEIGHT,
    EMPTY_TERRAIN_FRAMES,
  );
  const obstacleColliders = terrainTiles
    .filter(({ collider }) => collider !== null)
    .map(({ collider }) => collider);
  const decorationDescriptorsByImage = new Map(
    level.reactiveDecorations.map(({ decoration }) => [decoration.image, decoration]),
  );
  const decorationAtlasByImage = new Map(await Promise.all(
    [...decorationDescriptorsByImage].map(async ([image, descriptor]) => [
      image,
      await loadSpriteAtlas(engine, image, {
        gridSize: [descriptor.frameSize.width, descriptor.frameSize.height],
        sampling: "nearest",
      }),
    ]),
  ));
  const reactiveDecorations = level.reactiveDecorations.map((object) => (
    createReactiveDecoration({
      object,
      atlas: decorationAtlasByImage.get(object.decoration.image),
      animationManager,
      screenHeight: SCREEN_HEIGHT,
    })
  ));

  const terrainLayer = createSprite2DLayer(terrainAtlas, {
    capacity: terrainTiles.length,
    order: TILE_MAP_SUB_Z.ground,
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
  let renderer = null;
  let nextActorId = 1;

  function attachActor(record) {
    if (renderer) {
      for (const layer of record.actor.layers) {
        addSpriteRendererLayer(renderer, layer);
      }
      record.actor.playAnimation(animationManager);
    }
    return record;
  }

  function disposeActorRecord(record) {
    if (renderer) {
      for (const layer of record.actor.layers) {
        removeSpriteRendererLayer(renderer, layer);
      }
    }
    record.actor.dispose();
  }

  function createPlayerRecord(position) {
    const actor = createPlayer({
      atlases: archerAtlas,
      bounds: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
      obstacles: obstacleColliders,
      initialPosition: position,
      onShoot: (spawnPosition, direction) => projectiles.shoot(spawnPosition, direction),
    });
    const combat = createCombatActorState({
      label: `player-${nextActorId++}`,
      getCollider: () => actor.getCollider(),
      setVisualTransform: (transform) => actor.setVisualTransform(transform),
      onDeathProgress: (value) => actor.setVisualTransform({
        sizePx: [PLAYER_FRAME.width * value, PLAYER_FRAME.height * value],
      }),
      onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }),
      onKnockback: (direction, options) => actor.applyKnockback(direction, options),
      onDeathStart: () => actor.setInputEnabled(false),
    });
    return attachActor({ type: SpawnerType.PLAYER, actor, combat });
  }

  function createSheepRecord(position) {
    const actor = createSheep({
      atlases: sheepAtlases,
      initialPosition: position,
      bounds: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
      obstacles: obstacleColliders,
      grid: GRID,
      scareDistanceCells: 3,
      frighteningTypes: [CharacterType.PLAYER],
      minimumFleeDistanceCells: 1,
      maximumFleeDistanceCells: 3,
    });
    const combat = createCombatActorState({
      label: `sheep-${nextActorId++}`,
      getCollider: () => actor.getCollider().collider,
      setVisualTransform: (transform) => actor.setVisualTransform(transform),
      onDeathProgress: (value) => actor.setVisualTransform({
        sizePx: [SHEEP_FRAME_SIZE * value, SHEEP_FRAME_SIZE * value],
      }),
      onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }),
      onKnockback: (direction, options) => actor.applyKnockback(direction, options),
    });
    return attachActor({ type: SpawnerType.SHEEP, actor, combat });
  }

  function createGoblinRecord(position) {
    const actor = createGoblin({
      atlases: goblinAtlases,
      initialPosition: position,
      bounds: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
      obstacles: obstacleColliders,
    });
    const combat = createCombatActorState({
      label: `goblin-${nextActorId++}`,
      getCollider: () => actor.getCollider(),
      setVisualTransform: (transform) => actor.setVisualTransform(transform),
      onDeathProgress: (value) => actor.setVisualTransform({
        sizePx: [GOBLIN_FRAME.width * value, GOBLIN_FRAME.height * value],
      }),
      onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }),
      onKnockback: (direction, options) => actor.applyKnockback(direction, options),
    });
    return attachActor({
      type: SpawnerType.ENEMY,
      actor,
      combat,
      controller: createGoblinDemoController(actor),
    });
  }

  function createWarriorRecord(position) {
    const actor = createWarrior({
      atlases: warriorAtlases,
      initialPosition: position,
      bounds: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
      obstacles: obstacleColliders,
    });
    const combat = createCombatActorState({
      label: `warrior-${nextActorId++}`,
      getCollider: () => actor.getCollider(),
      setVisualTransform: (transform) => actor.setVisualTransform(transform),
      onDeathProgress: (value) => actor.setVisualTransform({
        sizePx: [WARRIOR_FRAME.width * value, WARRIOR_FRAME.height * value],
      }),
      onHitFlashStart: () => actor.setVisualTransform({
        color: [1.6, 1.6, 1.6, 1],
      }),
      onKnockback: (direction, options) => {
        actor.applyKnockback(direction, options);
      },
    });
    return attachActor({
      type: SpawnerType.ENEMY,
      character: SpawnerCharacter.WARRIOR,
      actor,
      combat,
      controller: createWarriorDemoController(actor),
    });
  }

  const spawnerConfigs = createInitialSpawnerConfigs({
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    tileSize: TILE_SIZE,
    authoredSpawners: level.spawners,
  });
  const markerDefinitions = {
    [SpawnerCharacter.PLAYER]: {
      atlas: archerAtlas.idle,
      frameSize: PLAYER_FRAME,
    },
    [SpawnerCharacter.SHEEP]: {
      atlas: sheepAtlases.idle,
      frameSize: { width: SHEEP_FRAME_SIZE, height: SHEEP_FRAME_SIZE },
    },
    [SpawnerCharacter.GOBLIN]: {
      atlas: goblinAtlases.idle,
      frameSize: GOBLIN_FRAME,
    },
    [SpawnerCharacter.WARRIOR]: {
      atlas: warriorAtlases.idle,
      frameSize: WARRIOR_FRAME,
    },
  };
  const actorFactories = {
    [SpawnerCharacter.PLAYER]: createPlayerRecord,
    [SpawnerCharacter.SHEEP]: createSheepRecord,
    [SpawnerCharacter.GOBLIN]: createGoblinRecord,
    [SpawnerCharacter.WARRIOR]: createWarriorRecord,
  };
  const spawnerMarkers = spawnerConfigs.map((config) => createSpawnerMarker({
    ...markerDefinitions[config.character],
    worldPosition: config.position,
    boundsHeight: SCREEN_HEIGHT,
    gridSize: TILE_SIZE,
  }));
  const spawners = spawnerConfigs.map((config) => createSpawner({
    ...config,
    createActor: actorFactories[config.character],
    disposeActor: disposeActorRecord,
  }));
  for (const spawner of spawners) {
    spawner.initialize();
  }
  const spawnerByType = new Map(spawners.map((spawner) => [spawner.config.type, spawner]));
  const getRecordsByType = (type) => spawners
    .filter((spawner) => spawner.config.type === type)
    .flatMap((spawner) => spawner.actors);
  let activeTouchPairs = new Set();

  // Temporary preview layer: keep animated terrain isolated until the final
  // terrain-layering strategy is decided.
  const animatedTerrainLayer = createSprite2DLayer(waterFoamAtlas, {
    capacity: 1,
    order: TILE_MAP_SUB_Z.animatedWaterFoam,
    pivot: [0, 0],
    visible: false,
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
        order: GAME_DEPTH.effects + order,
        visible: false,
      })
    )),
  );

  renderer = createSpriteRenderer(engine, {
    layers: [
      terrainLayer,
      ...reactiveDecorations.map((decoration) => decoration.layer),
      ...spawnerMarkers.map((marker) => marker.layer),
      ...spawners.flatMap((spawner) => (
        spawner.actors.flatMap((record) => record.actor.layers)
      )),
      projectiles.layer,
      animatedTerrainLayer,
      ...particleEffects.map((effect) => effect.layer),
    ],
    clearValue: { r: 0.25, g: 0.48, b: 0.22, a: 1 },
  });
  registerSpriteRenderer(renderer);

  for (const spawner of spawners) {
    for (const record of spawner.actors) {
      record.actor.playAnimation(animationManager);
    }
  }
  const waterFoamAnimation = playSprite2DAnimation(
    animationManager,
    waterFoam,
    0,
    WATER_FOAM_FRAME_COUNT - 1,
    true,
    WATER_FOAM_FRAME_DURATION_MS,
  );
  const setParticleFxPreview = (enabled) => {
    applyParticleFxPreviewSetting(particleEffects, enabled);
  };
  const setAnimatedTilePreview = (enabled) => {
    applyAnimatedTilePreviewSetting(
      animatedTerrainLayer,
      waterFoamAnimation,
      enabled,
      undefined,
      {
        from: 0,
        to: WATER_FOAM_FRAME_COUNT - 1,
        loop: true,
        frameDurationMs: WATER_FOAM_FRAME_DURATION_MS,
      },
    );
  };
  setParticleFxPreview(
    settingsStore.get(DEBUG_SETTING_KEYS.showParticleFxPreview),
  );
  setAnimatedTilePreview(
    settingsStore.get(DEBUG_SETTING_KEYS.showAnimatedTilePreview),
  );
  const unsubscribeParticleFxPreview = settingsStore.subscribe(
    DEBUG_SETTING_KEYS.showParticleFxPreview,
    setParticleFxPreview,
  );
  const unsubscribeAnimatedTilePreview = settingsStore.subscribe(
    DEBUG_SETTING_KEYS.showAnimatedTilePreview,
    setAnimatedTilePreview,
  );
  globalThis.particleFxPreview = Object.freeze({
    effects: Object.freeze([...particleEffects]),
  });

  let previousTime = performance.now();
  let showColliders = settingsStore.get(DEBUG_SETTING_KEYS.showColliders);
  for (const marker of spawnerMarkers) {
    marker.setVisible(showColliders);
  }
  const unsubscribeColliders = settingsStore.subscribe(
    DEBUG_SETTING_KEYS.showColliders,
    (value) => {
      showColliders = value;
      for (const marker of spawnerMarkers) {
        marker.setVisible(value);
      }
      if (!value) {
        debugContext.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      }
    },
  );
  const pauseController = createPauseController({
    onPause: () => {
      spawnerByType.get(SpawnerType.PLAYER).actors[0]?.actor.setInputEnabled(false);
    },
    onResume: () => {
      spawnerByType.get(SpawnerType.PLAYER).actors[0]?.actor.setInputEnabled(true);
      previousTime = performance.now();
    },
  });
  createSettingsUi({ host: gameUi, pauseController });
  createReleaseMetadataUi({ host: gameUi, metadata: releaseMetadata });

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
    for (const decoration of reactiveDecorations) {
      decoration.layer.view.zoom = viewportScale;
    }
    for (const spawner of spawners) {
      for (const record of spawner.actors) {
        const ySortedOrder = getYSortedLayerOrder(
          record.actor.getPosition().y,
          SCREEN_HEIGHT,
        );
        for (const layer of record.actor.layers) {
          layer.view.zoom = viewportScale;
          layer.order = ySortedOrder;
        }
      }
    }
    for (const marker of spawnerMarkers) {
      marker.setViewportScale(viewportScale);
    }
    projectiles.layer.view.zoom = viewportScale;
    animatedTerrainLayer.view.zoom = viewportScale;
    for (const effect of particleEffects) {
      effect.layer.view.zoom = viewportScale;
    }

    updateSpriteAnimationManager(animationManager, activeDelta * 1000);
    if (activeDelta > 0) {
      const nextTouchPairs = new Set();
      for (const spawner of spawners) {
        for (const record of spawner.actors) {
          record.combat.updateDeath(activeDelta);
          if (record.combat.isDead) {
            spawner.remove(record);
          }
        }
        spawner.update(activeDelta);
      }

      const playerRecord = spawnerByType.get(SpawnerType.PLAYER).actors[0] ?? null;
      const sheepRecords = getRecordsByType(SpawnerType.SHEEP);
      const enemyRecords = getRecordsByType(SpawnerType.ENEMY);
      const playerCollider = playerRecord?.combat.getCollider() ?? null;
      const sheepColliders = sheepRecords.map((record) => ({
        record,
        collider: record.combat.getCollider(),
      }));
      const enemyColliders = enemyRecords.map((record) => ({
        record,
        collider: record.combat.getCollider(),
      }));

      let playerMovement = { x: 0, y: 0 };
      if (playerRecord?.combat.isAlive) {
        const dynamicColliders = [
          ...sheepColliders.filter(({ collider }) => collider)
            .map(({ collider }) => ({ type: "npc", collider })),
          ...enemyColliders.filter(({ collider }) => collider)
            .map(({ collider }) => ({ type: CharacterType.ENEMY, collider })),
        ];
        playerMovement = playerRecord.actor.update(activeDelta, dynamicColliders).movement;
      }

      const playerSnapshot = playerRecord
        ? {
            type: CharacterType.PLAYER,
            position: playerRecord.actor.getPosition(),
            cell: playerRecord.actor.getGridPosition(TILE_SIZE),
          }
        : null;
      const sheepDynamicColliders = playerRecord?.combat.isAlive && playerCollider
        ? [{ type: CharacterType.PLAYER, collider: playerCollider }]
        : [];
      const projectileState = projectiles.getColliders();
      for (const record of sheepRecords) {
        if (record.combat.isAlive) {
          record.actor.update(
            activeDelta,
            playerRecord?.combat.isAlive && playerSnapshot ? [playerSnapshot] : [],
            [...sheepDynamicColliders, ...projectileState],
          );
        }
      }

      for (const record of enemyRecords) {
        if (!record.combat.isAlive) {
          continue;
        }
        record.controller.update(activeDelta);
        record.actor.update(activeDelta, [
          ...(playerRecord?.combat.isAlive && playerCollider
            ? [{ type: CharacterType.PLAYER, collider: playerCollider }]
            : []),
          ...sheepColliders.filter(({ collider }) => collider)
            .map(({ collider }) => ({ type: "npc", collider })),
        ]);
      }

      const reactiveCharacters = [
        ...(playerRecord?.combat.isAlive && playerRecord.combat.getCollider()
          ? [{
              id: playerRecord.combat.label,
              type: CharacterType.PLAYER,
              collider: playerRecord.combat.getCollider(),
            }]
          : []),
        ...sheepRecords.filter(({ combat }) => combat.isAlive).map((record) => ({
          id: record.combat.label,
          type: "npc",
          collider: record.combat.getCollider(),
        })).filter(({ collider }) => collider),
        ...enemyRecords.filter(({ combat }) => combat.isAlive).map((record) => ({
          id: record.combat.label,
          type: CharacterType.ENEMY,
          collider: record.combat.getCollider(),
        })).filter(({ collider }) => collider),
      ];
      for (const decoration of reactiveDecorations) {
        decoration.update(reactiveCharacters);
      }

      projectiles.update(activeDelta);
      const projectilesToRemove = [];
      for (const { id, collider, direction } of projectiles.getColliders()) {
        let hit = false;
        for (const target of [...sheepColliders, ...enemyColliders]) {
          if (!target.record.combat.isAlive || !target.collider) {
            continue;
          }
          if (collidersOverlap(collider, target.collider)) {
            target.record.combat.applyDamage(
              target.record.type === SpawnerType.SHEEP ? 100 : 50,
              direction,
            );
            projectiles.markHit(id);
            projectilesToRemove.push(id);
            hit = true;
            break;
          }
        }
        if (hit) {
          continue;
        }
      }
      if (projectilesToRemove.length > 0) {
        projectiles.removeProjectiles(projectilesToRemove);
      }

      if (playerRecord?.combat.isAlive && playerCollider) {
        for (const { record, collider } of enemyColliders) {
          if (!record.combat.isAlive || !collider) {
            continue;
          }
          const touching = collidersOverlap(playerCollider, collider);
          if (
            touching
            && (
              record.actor.state === EnemyState.ATTACKING
              || record.actor.isAttacking
            )
          ) {
            const pair = makeTouchKey(record.combat.label, playerRecord.combat.label);
            nextTouchPairs.add(pair);
            if (!activeTouchPairs.has(pair)) {
              playerRecord.combat.applyDamage(
                25,
                makeDirection(record.actor.getPosition(), playerRecord.actor.getPosition()),
              );
            }
          }
          if (touching && (playerMovement.x !== 0 || playerMovement.y !== 0)) {
            const pair = makeTouchKey(playerRecord.combat.label, record.combat.label);
            nextTouchPairs.add(pair);
            if (!activeTouchPairs.has(pair)) {
              record.combat.applyDamage(
                25,
                makeDirection(playerRecord.actor.getPosition(), record.actor.getPosition()),
              );
            }
          }
        }
      }

      for (const enemyTarget of enemyColliders) {
        if (!enemyTarget.record.combat.isAlive || !enemyTarget.collider) {
          continue;
        }
        for (const sheepTarget of sheepColliders) {
          if (
            !sheepTarget.record.combat.isAlive
            || !sheepTarget.collider
            || !collidersOverlap(enemyTarget.collider, sheepTarget.collider)
          ) {
            continue;
          }
          const pair = makeTouchKey(
            enemyTarget.record.combat.label,
            sheepTarget.record.combat.label,
          );
          nextTouchPairs.add(pair);
          if (!activeTouchPairs.has(pair)) {
            sheepTarget.record.combat.applyDamage(
              100,
              makeDirection(
                enemyTarget.record.actor.getPosition(),
                sheepTarget.record.actor.getPosition(),
              ),
            );
          }
        }
      }

      activeTouchPairs = nextTouchPairs;
      if (playerSnapshot) {
        coordinatesUi.update(playerSnapshot.position, playerSnapshot.cell);
      }
    }
    const diagnosticPlayer = spawnerByType.get(SpawnerType.PLAYER).actors[0] ?? null;
    drawDiagnostics(
      terrainTiles,
      diagnosticPlayer?.combat.getCollider() ?? null,
      getRecordsByType(SpawnerType.SHEEP)
        .map((record) => record.combat.getCollider()).filter(Boolean),
      getRecordsByType(SpawnerType.ENEMY)
        .map((record) => record.combat.getCollider()).filter(Boolean),
      projectiles.getColliders(),
      showColliders,
    );

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
  window.addEventListener("pagehide", () => {
    viewportSafeArea.dispose();
    unsubscribeColliders();
    unsubscribeParticleFxPreview();
    unsubscribeAnimatedTilePreview();
    applyParticleFxPreviewSetting(particleEffects, false);
    applyAnimatedTilePreviewSetting(
      animatedTerrainLayer,
      waterFoamAnimation,
      false,
    );
    for (const spawner of spawners) {
      spawner.dispose();
    }
    for (const decoration of reactiveDecorations) {
      decoration.dispose();
    }
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

function drawCharacterCollider(
  collider,
  fillStyle = "rgb(36 228 255 / 20%)",
  strokeStyle = "#24e4ff",
) {
  if (!collider) {
    return;
  }
  if (collider.type === "circle") {
    drawCircle(collider, fillStyle, strokeStyle);
    return;
  }

  drawAabb(collider, fillStyle, strokeStyle);
}

function drawGridLines() {
  debugContext.beginPath();
  for (let x = 0; x <= SCREEN_WIDTH; x += TILE_SIZE) {
    debugContext.moveTo(x + 0.5, 0);
    debugContext.lineTo(x + 0.5, SCREEN_HEIGHT);
  }
  for (let y = 0; y <= SCREEN_HEIGHT; y += TILE_SIZE) {
    debugContext.moveTo(0, y + 0.5);
    debugContext.lineTo(SCREEN_WIDTH, y + 0.5);
  }
  debugContext.strokeStyle = "rgb(80 86 92 / 48%)";
  debugContext.lineWidth = 1;
  debugContext.stroke();
}

function drawDiagnostics(
  terrainTiles,
  characterCollider,
  sheepColliders,
  goblinColliders,
  projectileColliders,
  enabled,
) {
  debugContext.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  if (!enabled) {
    return;
  }
  drawGridLines();
  debugContext.font = "700 7px system-ui, sans-serif";
  debugContext.textBaseline = "top";

  for (const tile of terrainTiles) {
    if (tile.collider) {
      drawTerrainCollider(tile.collider);
    }

    const label = formatLevelCellLabel(tile.gameCell);
    const labelWidth = debugContext.measureText(label).width + 5;
    const labelX = tile.screenPosition.x + TILE_SIZE - labelWidth - 3;
    debugContext.fillStyle = "rgb(5 10 18 / 78%)";
    debugContext.fillRect(
      labelX,
      tile.screenPosition.y + 3,
      labelWidth,
      11,
    );
    debugContext.fillStyle = tile.valid ? "#ffffff" : "#8f969f";
    debugContext.fillText(
      label,
      labelX + 2.5,
      tile.screenPosition.y + 4,
    );
  }

  drawCharacterCollider(characterCollider);
  for (const sheepCollider of sheepColliders) {
    drawCharacterCollider(
      sheepCollider,
      "rgb(255 220 64 / 24%)",
      "#ffe066",
    );
  }
  for (const goblinCollider of goblinColliders) {
    drawCharacterCollider(
      goblinCollider,
      "rgb(255 86 86 / 24%)",
      "#ff5656",
    );
  }
  for (const { collider } of projectileColliders) {
    drawAabb(collider, "rgb(255 220 64 / 38%)", "#ffe066");
  }
}

start().catch((error) => {
  console.error(error);
  errorOutput.textContent = error instanceof Error ? error.message : String(error);
});
