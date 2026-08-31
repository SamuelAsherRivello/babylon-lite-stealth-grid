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
  PLAYER_MOVEMENT_COLLIDER,
  PLAYER_PIVOT,
  createPlayer,
  loadPlayerAtlases,
} from "./player.js";
import {
  GOBLIN_FRAME,
  GOBLIN_MOVEMENT_COLLIDER,
  GOBLIN_PIVOT,
  createGoblin,
  loadGoblinAtlases,
} from "./enemies/goblin/goblin.js";
import { createGoblinBehaviorController } from "./enemies/goblin/goblin-behavior-controller.js";
import { createGridWalkability } from "./npc/sheep/sheep-navigation.js";
import {
  WARRIOR_FRAME,
  WARRIOR_MOVEMENT_COLLIDER,
  WARRIOR_PIVOT,
  createWarrior,
  loadWarriorAtlases,
} from "./enemies/warrior/warrior.js";
import {
  createWarriorDemoController,
} from "./enemies/warrior/warrior-demo-controller.js";
import {
  SHEEP_FRAME_SIZE,
  SHEEP_MOVEMENT_COLLIDER,
  SHEEP_PIVOT,
  createSheep,
  loadSheepAtlases,
} from "./npc/sheep/sheep.js";
import { CharacterType } from "./npc/sheep/sheep-state.js";
import { createSheepContactCoordinator } from "./npc/sheep/sheep-flock.js";
import { EnemyState } from "./enemies/enemy-state.js";
import {
  createProjectileRenderer,
  loadArrowAtlas,
} from "./projectile-renderer.js";
import { resolveProjectileHit } from "./projectile-combat.js";
import { createPauseController } from "./pause-controller.js";
import {
  applyAnimatedTilePreviewSetting,
  applyParticleFxPreviewSetting,
} from "./preview-settings.js";
import { Fire03ParticleEffect, PARTICLE_FX_CLASS_BY_KEY } from "./particle-fx/index.js";
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
import {
  createReactiveDecoration,
  getCenteredEffectPosition,
} from "./decorations/reactive-decoration.js";
import { createCharacterColliderDrawCommands } from "./collider-diagnostics.js";

const SCREEN_WIDTH = GRID.widthPx;
const SCREEN_HEIGHT = GRID.heightPx;
const TILE_SIZE = GRID.tileSizePx;
const WATER_FOAM_FRAME_SIZE = 192;
const WATER_FOAM_FRAME_COUNT = 16;
const WATER_FOAM_FRAME_DURATION_MS = 100;
const DEATH_ANIMATION_DURATION_SECONDS = 0.25;
const DAMAGE_FLASH_DURATION_SECONDS = 0.6;
const DEATH_ROTATION_DEGREES = 20;
const MAX_HEALTH = 100;
const KNOCKBACK_DURATION_SECONDS = 0.2;
const KNOCKBACK_SPEED_PIXELS_PER_SECOND = 17.28;
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
  getCombatCollider,
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

  function getActiveCombatCollider() {
    if (!isDying && !isDead) {
      return getCombatCollider();
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
    getCombatCollider: getActiveCombatCollider,
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
  // Temporary deterministic setup for hands-on bush-burning QA.
  const temporaryBushQaMode = true;
  const verifyBushBurning = temporaryBushQaMode
    || new URLSearchParams(globalThis.location.search).has("verifyBushBurning");
  const animationManager = createSpriteAnimationManager();
  const level = await loadTiledMap(`${import.meta.env.BASE_URL}levels/tiled/maps/Level01.tmj`);
  const terrainImages = new Set(collectTiledLayerTiles(level).map(({ image }) => image));
  const [
    terrainAtlasEntries,
    archerAtlas,
    arrowAtlas,
    waterFoamAtlas,
    sheepAtlases,
    goblinAtlases,
    warriorAtlases,
    releaseMetadata,
  ] = await Promise.all([
    Promise.all([...terrainImages].map(async (image) => [
      image,
      await loadSpriteAtlas(engine, image, {
        gridSize: [TILE_SIZE, TILE_SIZE],
        sampling: "nearest",
      }),
    ])),
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
  const terrainAtlasByImage = new Map(terrainAtlasEntries);

  const terrainTiles = createLevelTerrainTiles(
    collectTiledLayerTiles(level),
    TILE_SIZE,
    SCREEN_HEIGHT,
    EMPTY_TERRAIN_FRAMES,
  );
  const obstacleColliders = terrainTiles.flatMap(({ colliders }) => colliders);
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
  const bushFireEffects = await Promise.all(level.reactiveDecorations.map((object) => (
    Fire03ParticleEffect.create({
      engine,
      animationManager,
      position: getCenteredEffectPosition({
        position: object.position,
        frameSize: object.decoration.frameSize,
        effectSize: {
          width: Fire03ParticleEffect.descriptor.displaySize[0],
          height: Fire03ParticleEffect.descriptor.displaySize[1],
        },
        screenHeight: SCREEN_HEIGHT,
      }),
      order: GAME_DEPTH.effects,
      visible: false,
    })
  )));
  const reactiveDecorations = level.reactiveDecorations.map((object, index) => (
    createReactiveDecoration({
      object,
      atlas: decorationAtlasByImage.get(object.decoration.image),
      animationManager,
      screenHeight: SCREEN_HEIGHT,
      tileSize: TILE_SIZE,
      fireEffect: bushFireEffects[index],
    })
  ));

  const terrainLayerByImage = new Map([...terrainAtlasByImage].map(([image, atlas]) => [
    image,
    createSprite2DLayer(atlas, {
      capacity: terrainTiles.filter((tile) => tile.image === image).length,
      order: TILE_MAP_SUB_Z.ground,
      pivot: [0, 0],
    }),
  ]));
  const terrainLayers = [...terrainLayerByImage.values()];

  for (const tile of terrainTiles) {
    if (!tile.valid) {
      continue;
    }

    addSprite2D(terrainLayerByImage.get(tile.image), {
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
  const sheepContactCoordinator = createSheepContactCoordinator();

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
      getCombatCollider: () => actor.getCombatCollider(),
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
      getCombatCollider: () => actor.getCombatCollider(),
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
      getCombatCollider: () => actor.getCombatCollider(),
      setVisualTransform: (transform) => actor.setVisualTransform(transform),
      onDeathProgress: (value) => actor.setVisualTransform({
        sizePx: [GOBLIN_FRAME.width * value, GOBLIN_FRAME.height * value],
      }),
      onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }),
      onKnockback: (direction, options) => actor.applyKnockback(direction, options),
    });
    const record = {
      type: SpawnerType.ENEMY,
      character: SpawnerCharacter.GOBLIN,
      actor,
      combat,
      controller: null,
    };
    const isWalkable = createGridWalkability({
      bounds: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
      character: { frame: GOBLIN_FRAME, pivot: GOBLIN_PIVOT, collider: GOBLIN_MOVEMENT_COLLIDER },
      grid: GRID,
      obstacles: obstacleColliders,
    });
    record.controller = createGoblinBehaviorController(actor, {
      grid: GRID,
      spawnCell: {
        x: Math.floor(actor.getMovementCollider().x / TILE_SIZE),
        y: Math.floor(actor.getMovementCollider().y / TILE_SIZE),
      },
      isWalkable,
      bushChance: verifyBushBurning ? 1 : 0.25,
      idleRange: verifyBushBurning ? [0, 0] : [3, 5],
      prioritizeBushes: verifyBushBurning,
      getWorld: () => ({
        characters: verifyBushBurning ? [] : [
          ...getRecordsByType(SpawnerType.PLAYER),
          ...getRecordsByType(SpawnerType.SHEEP),
        ].filter(({ combat: targetCombat }) => targetCombat.isAlive).map((target) => ({
          id: target.combat.label,
          isAlive: target.combat.isAlive,
          position: target.actor.getPosition(),
          cell: typeof target.actor.getGridPosition === "function"
            ? target.actor.getGridPosition(TILE_SIZE)
            : {
                x: Math.floor(target.actor.getPosition().x / TILE_SIZE),
                y: Math.floor(target.actor.getPosition().y / TILE_SIZE),
              },
        })),
        bushes: reactiveDecorations.filter((decoration) => !decoration.isDead)
          .map((decoration) => decoration.getSnapshot()),
      }),
    });
    return attachActor(record);
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
      getCombatCollider: () => actor.getCombatCollider(),
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
  const spawnCharacterShapes = {
    [SpawnerCharacter.PLAYER]: {
      frame: PLAYER_FRAME,
      pivot: PLAYER_PIVOT,
      collider: PLAYER_MOVEMENT_COLLIDER,
    },
    [SpawnerCharacter.SHEEP]: {
      frame: { width: SHEEP_FRAME_SIZE, height: SHEEP_FRAME_SIZE },
      pivot: SHEEP_PIVOT,
      collider: SHEEP_MOVEMENT_COLLIDER,
    },
    [SpawnerCharacter.GOBLIN]: {
      frame: GOBLIN_FRAME,
      pivot: GOBLIN_PIVOT,
      collider: GOBLIN_MOVEMENT_COLLIDER,
    },
    [SpawnerCharacter.WARRIOR]: {
      frame: WARRIOR_FRAME,
      pivot: WARRIOR_PIVOT,
      collider: WARRIOR_MOVEMENT_COLLIDER,
    },
  };
  const spawnWalkability = Object.fromEntries(Object.entries(spawnCharacterShapes)
    .map(([character, shape]) => [character, createGridWalkability({
      bounds: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
      character: shape,
      grid: GRID,
      obstacles: obstacleColliders,
    })]));
  const spawnerMarkers = spawnerConfigs.map((config) => createSpawnerMarker({
    ...markerDefinitions[config.character],
    worldPosition: config.position,
    boundsHeight: SCREEN_HEIGHT,
    gridSize: TILE_SIZE,
  }));
  const spawners = spawnerConfigs.map((config) => createSpawner({
    ...config,
    tileSize: TILE_SIZE,
    isWalkable: (_position, cell) => spawnWalkability[config.character](cell),
    getActorPosition: (record) => record.actor.getPosition(),
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
  const getBushBurningSnapshot = () => ({
      bushes: reactiveDecorations.map((decoration) => ({
        id: decoration.id,
        health: decoration.health,
        isAlive: decoration.isAlive,
        isDying: decoration.isDying,
        isDead: decoration.isDead,
        firePlaying: decoration.firePlaying,
      })),
      goblins: getRecordsByType(SpawnerType.ENEMY)
        .filter(({ character }) => character === SpawnerCharacter.GOBLIN)
        .map(({ combat, controller }) => ({ id: combat.label, mode: controller.mode })),
    });
  globalThis.bushBurningDebug = Object.freeze({ snapshot: getBushBurningSnapshot });
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
      ...terrainLayers,
      ...reactiveDecorations.map((decoration) => decoration.layer),
      ...bushFireEffects.map((effect) => effect.layer),
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
  coordinatesUi.setVisible(showColliders);
  for (const marker of spawnerMarkers) {
    marker.setVisible(showColliders);
  }
  const unsubscribeColliders = settingsStore.subscribe(
    DEBUG_SETTING_KEYS.showColliders,
    (value) => {
      showColliders = value;
      coordinatesUi.setVisible(value);
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
    for (const layer of terrainLayers) {
      layer.view.zoom = viewportScale;
    }
    for (const decoration of reactiveDecorations) {
      decoration.setViewportScale(viewportScale);
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
      const playerMovementCollider = playerRecord?.combat.isAlive
        ? playerRecord.actor.getMovementCollider()
        : null;
      const playerCombatCollider = playerRecord?.combat.getCombatCollider() ?? null;
      const sheepMovementColliders = sheepRecords.map((record) => ({
        record,
        collider: record.combat.isAlive ? record.actor.getMovementCollider() : null,
      }));
      const enemyMovementColliders = enemyRecords.map((record) => ({
        record,
        collider: record.combat.isAlive ? record.actor.getMovementCollider() : null,
      }));
      const sheepCombatColliders = sheepRecords.map((record) => ({
        record,
        collider: record.combat.getCombatCollider(),
      }));
      const enemyCombatColliders = enemyRecords.map((record) => ({
        record,
        collider: record.combat.getCombatCollider(),
      }));

      let playerMovement = { x: 0, y: 0 };
      if (playerRecord?.combat.isAlive) {
        const dynamicColliders = [
          ...sheepMovementColliders.filter(({ collider }) => collider)
            .map(({ collider }) => ({ type: "npc", collider })),
          ...enemyMovementColliders.filter(({ collider }) => collider)
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
      const sheepDynamicColliders = playerMovementCollider
        ? [{ type: CharacterType.PLAYER, collider: playerMovementCollider }]
        : [];
      const projectileState = projectiles.getColliders();
      const sheepSnapshots = sheepRecords.map((record) => ({
        id: record.combat.label,
        isAlive: record.combat.isAlive,
        position: record.actor.getPosition(),
        requestedPosition: record.actor.getRequestedPosition(activeDelta),
        collider: record.combat.isAlive ? record.actor.getMovementCollider() : null,
        contactPartnerId: record.actor.getContactPartnerId(),
      }));
      const sheepContactResult = sheepContactCoordinator.update(sheepSnapshots);
      const sheepRecordById = new Map(
        sheepRecords.map((record) => [record.combat.label, record]),
      );
      for (const [id, intent] of sheepContactResult.intents) {
        const record = sheepRecordById.get(id);
        const partner = sheepRecordById.get(intent.partnerId);
        if (record?.combat.isAlive && partner?.combat.isAlive) {
          record.actor.beginContact({
            ...intent,
            partnerCell: partner.actor.getGridCell(),
          });
        }
      }

      for (const currentRecord of sheepRecords) {
        const otherSheepColliders = sheepRecords
          .filter((record) => (
            record.combat.isAlive
            && record.combat.label !== currentRecord.combat.label
          ))
          .map((record) => ({
            type: "npc",
            id: record.combat.label,
            collider: record.actor.getMovementCollider(),
          }));
        if (currentRecord.combat.isAlive) {
          currentRecord.actor.update(
            activeDelta,
            playerRecord?.combat.isAlive && playerSnapshot ? [playerSnapshot] : [],
            [...sheepDynamicColliders, ...otherSheepColliders, ...projectileState],
          );
        }
      }

      for (const record of enemyRecords) {
        if (!record.combat.isAlive) {
          continue;
        }
        record.controller.update(activeDelta);
        record.actor.update(activeDelta, [
          ...(playerMovementCollider
            ? [{ type: CharacterType.PLAYER, collider: playerMovementCollider }]
            : []),
          ...sheepMovementColliders.filter(({ collider }) => collider)
            .map(({ collider }) => ({ type: "npc", collider })),
        ], record.character === SpawnerCharacter.WARRIOR ? projectileState : []);
      }

      const reactiveCharacters = [
        ...(playerMovementCollider
          ? [{
              id: playerRecord.combat.label,
              type: CharacterType.PLAYER,
              collider: playerRecord.actor.getMovementCollider(),
            }]
          : []),
        ...sheepRecords.filter(({ combat }) => combat.isAlive).map((record) => ({
          id: record.combat.label,
          type: "npc",
          collider: record.actor.getMovementCollider(),
        })).filter(({ collider }) => collider),
        ...enemyRecords.filter(({ combat }) => combat.isAlive).map((record) => ({
          id: record.combat.label,
          type: CharacterType.ENEMY,
          collider: record.actor.getMovementCollider(),
        })).filter(({ collider }) => collider),
      ];
      for (const decoration of reactiveDecorations) {
        decoration.update(reactiveCharacters, activeDelta);
      }

      projectiles.update(activeDelta);
      const projectilesToRemove = [];
      for (const { id, collider, direction } of projectiles.getColliders()) {
        let hit = false;
        for (const target of [...sheepCombatColliders, ...enemyCombatColliders]) {
          if (!target.record.combat.isAlive || !target.collider) {
            continue;
          }
          if (collidersOverlap(collider, target.collider)) {
            const result = resolveProjectileHit(
              projectiles,
              { id, direction },
              target.record,
            );
            if (result === "damaged") projectilesToRemove.push(id);
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

      if (playerRecord?.combat.isAlive && playerCombatCollider) {
        for (const { record, collider } of enemyCombatColliders) {
          if (!record.combat.isAlive || !collider) {
            continue;
          }
          const touching = collidersOverlap(playerCombatCollider, collider);
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

      for (const enemyTarget of enemyCombatColliders) {
        if (!enemyTarget.record.combat.isAlive || !enemyTarget.collider) {
          continue;
        }
        for (const sheepTarget of sheepCombatColliders) {
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
    const diagnosticCharacters = [
      ...spawnerByType.get(SpawnerType.PLAYER).actors,
      ...getRecordsByType(SpawnerType.SHEEP),
      ...getRecordsByType(SpawnerType.ENEMY),
    ].filter(({ combat }) => combat.isAlive).map(({ actor, combat }) => ({
      combatCollider: combat.getCombatCollider(),
      movementCollider: actor.getMovementCollider(),
    }));
    diagnosticCharacters.push(...reactiveDecorations
      .filter((decoration) => !decoration.isDead)
      .map((decoration) => ({
        combatCollider: decoration.getCombatCollider(),
        movementCollider: decoration.sensor,
      })));
    drawDiagnostics(
      terrainTiles,
      diagnosticCharacters,
      projectiles.getColliders(),
      showColliders,
    );
    canvas.dataset.bushDebug = JSON.stringify(getBushBurningSnapshot());

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
  diagnosticCharacters,
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
    for (const collider of tile.colliders) {
      drawTerrainCollider(collider);
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

  for (const { collider, style } of createCharacterColliderDrawCommands(
    diagnosticCharacters,
  )) {
    drawCharacterCollider(
      collider,
      style.fillStyle,
      style.strokeStyle,
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
