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

import { gridCellToScreenForFrame, collidersOverlap, getOtherCharacterColliders, separateOverlappingCharacterColliders } from "./gameplay/game-logic.js";
import { createGameStateMachine, GameState } from "./gameplay/game-state.js";
import { gridCellToWorldCenter } from "./gameplay/world-viewport.js";
import { GAME_VIEWPORT, formatViewportDiagnostics, logicalPointFromClient, measureGameViewport, renderViewportQaMarkers } from "./gameplay/game-viewport.js";
import {
  collectTiledLayerTiles,
  formatLevelCellLabel,
  loadTiledMap,
} from "../plugins/tiled-babylon-lite/index.js";
import { GRID } from "./systems/environment/grid-contract.js";
import { getCharacterGridCell, getCharacterLayerOrder } from "./characters/character-spatial.js";
import { getYSortedLayerOrder } from "./systems/environment/render-depth.js";
import { createLevelTerrainTiles } from "../plugins/tiled-babylon-lite/index.js";
import {
  PLAYER_FRAME,
  PLAYER_MOVEMENT_COLLIDER,
  PLAYER_PIVOT,
  createPlayer,
  loadPlayerAtlases,
} from "./characters/player/player.js";
import {
  GOBLIN_FRAME,
  GOBLIN_MOVEMENT_COLLIDER,
  GOBLIN_PIVOT,
  createGoblin,
  loadGoblinAtlases,
} from "./characters/enemies/goblin/goblin.js";
import { createGoblinBehaviorController } from "./characters/enemies/goblin/goblin-behavior-controller.js";
import { createEnemyPatrolController } from "./characters/enemies/enemy-patrol-controller.js";
import { createCharacterLockupWatchdog } from "./gameplay/character-lockup-watchdog.js";
import { ARCHER_FRAME, ARCHER_MOVEMENT_COLLIDER, ARCHER_PIVOT, createArcher, loadArcherAtlases } from "./characters/enemies/archer/archer.js";
import { createGridWalkability } from "./characters/npc/sheep/sheep-navigation.js";
import {
  WARRIOR_FRAME,
  WARRIOR_MOVEMENT_COLLIDER,
  WARRIOR_PIVOT,
  createWarrior,
  loadWarriorAtlases,
} from "./characters/enemies/warrior/warrior.js";
import {
  createWarriorDemoController,
} from "./characters/enemies/warrior/warrior-demo-controller.js";
import { LANCER_FRAME, LANCER_MOVEMENT_COLLIDER, LANCER_PIVOT, createLancer, loadLancerAtlases } from "./characters/enemies/lancer/lancer.js";
import {
  MONK_FRAME, MONK_MOVEMENT_COLLIDER, MONK_PIVOT, createMonk, loadMonkAtlases,
} from "./characters/enemies/monk/monk.js";
import {
  SHEEP_FRAME_SIZE,
  SHEEP_MOVEMENT_COLLIDER,
  SHEEP_PIVOT,
  createSheep,
  loadSheepAtlases,
} from "./characters/npc/sheep/sheep.js";
import { CharacterType } from "./characters/npc/sheep/sheep-state.js";
import { createSheepContactCoordinator } from "./characters/npc/sheep/sheep-flock.js";
import { createCharacterPerception } from "./systems/perception/character-perception.js";
import { createEnemyPerceptionReaction } from "./systems/perception/enemy-perception-reaction.js";
import { getDebugExpressionState, getEnemyExpression } from "./systems/perception/enemy-expression.js";
import { EnemyState } from "./characters/enemies/enemy-state.js";
import {
  createProjectileRenderer,
  loadArrowAtlas,
} from "./systems/objects/projectile-renderer.js";
import { resolveProjectileHit } from "./systems/objects/projectile-combat.js";
import { createPauseController } from "./ui/pause-controller.js";
import {
  applyAnimatedTilePreviewSetting,
  applyParticleFxPreviewSetting,
} from "./runtime-settings/runtime-preview-settings.js";
import { Fire03ParticleEffect, PARTICLE_FX_CLASS_BY_KEY } from "./particle-fx/index.js";
import { createParticleFxPreviewLayout } from "./particle-fx/preview-layout.js";
import { loadEditorConfig } from "./editor-config/editor-config.js";
import { createCoordinatesUi } from "./ui/coordinates-ui.js";
import { createReleaseMetadataUi } from "./ui/release-metadata-ui.js";
import { createSettingsUi } from "./ui/settings-ui.js";
import { createLevelCompleteUi } from "./ui/level-complete-ui.js";
import { createGoal } from "./systems/goals/goal.js";
import { createViewportSafeArea } from "./ui/viewport-safe-area.js";
import {
  RUNTIME_DEBUG_SETTING_KEYS,
  runtimeSettingsStore,
} from "./runtime-settings/runtime-settings-store.js";
import {
  GAME_DEPTH,
  TILE_MAP_SUB_Z,
} from "./systems/environment/render-depth.js";
import { createSpawner } from "./systems/spawners/spawner.js";
import { createGoldStone } from "./systems/objects/gold-stone.js";
import { chooseNineGridDestinations, createGoldPickup } from "./systems/objects/gold-pickup.js";
import { createPickupSystem } from "./systems/objects/pickup-system.js";
import {
  SpawnerCharacter,
  SpawnerType,
  createInitialSpawnerConfigs,
} from "./systems/spawners/spawner-catalog.js";
import { createSpawnerMarker } from "./systems/spawners/spawner-marker.js";
import {
  createReactiveDecoration,
  getCenteredEffectPosition,
} from "./systems/environment/decorations/reactive-decoration.js";
import {
  createCharacterCenterDrawCommands,
  createCharacterColliderDrawCommands,
  createActivePerceptionMarkerCommands,
  createPerceptionDrawCommands,
  TERRAIN_COLLIDER_STYLE,
} from "./ui/collider-diagnostics.js";

const SCREEN_WIDTH = GAME_VIEWPORT.referenceResolution.width;
const SCREEN_HEIGHT = GAME_VIEWPORT.referenceResolution.height;
const TILE_SIZE = GAME_VIEWPORT.referenceGridSize.width;
const WATER_FOAM_FRAME_SIZE = 192;
const WATER_FOAM_FRAME_COUNT = 16;
const WATER_FOAM_FRAME_DURATION_MS = 100;
const SPAWN_ANIMATION_DURATION_SECONDS = 0.25;
const DEATH_ANIMATION_DURATION_SECONDS = 0.25;
const DAMAGE_FLASH_DURATION_SECONDS = 0.6;
const DEATH_ROTATION_DEGREES = 20;
const MAX_HEALTH = 100;
const KNOCKBACK_DURATION_SECONDS = 0.2;
const KNOCKBACK_SPEED_PIXELS_PER_SECOND = 17.28;
const ENEMY_EXPRESSION_FADE_SECONDS = 0.25;
const ENEMY_EXPRESSION_INSTANCE_FADE_SECONDS = ENEMY_EXPRESSION_FADE_SECONDS / 2;
const EMOTIONAL_JUMP_DURATION_SECONDS = 0.096;
const EMOTIONAL_JUMP_HEIGHT_PIXELS = 8;
const ENEMY_EXPRESSION_ICON_OFFSET_Y_PIXELS = -90;
const ENEMY_EXPRESSION_ICON_OFFSET_Y_BY_CHARACTER = Object.freeze({
  [SpawnerCharacter.GOBLIN]: -80,
  [SpawnerCharacter.ARCHER]: -80,
  [SpawnerCharacter.WARRIOR]: -80,
});
const ENEMY_EXPRESSION_MIN_SCALE = 0.3;
const ENEMY_EXPRESSION_GRID_OFFSET = TILE_SIZE;
const DEGREES_TO_RADIANS = Math.PI / 180;
const EMPTY_TERRAIN_FRAMES = new Set([
  4, 13, 22, 31, 37, 38, 40, 46, 47, 49,
]);

const canvas = document.querySelector("#renderCanvas");
const debugCanvas = document.querySelector("#debugCanvas");
const debugContext = debugCanvas.getContext("2d");
const errorOutput = document.querySelector("#error");
  const gameUi = document.querySelector("#gameUi");
  const domBody = document.querySelector("#dom-body");
  const domScreen = document.querySelector(".dom-screen");
const uiLayer = document.querySelector("#uiLayer");
const gameFrame = document.querySelector(".game-frame");
const viewportSafeArea = createViewportSafeArea({ element: uiLayer, frameElement: gameFrame });
const coordinatesUi = createCoordinatesUi();
let latestGameViewport = null;
let showCropMarks = false;

function refreshGameViewportDiagnostics() {
  latestGameViewport = measureGameViewport(GAME_VIEWPORT);
  canvas.dataset.viewport = formatViewportDiagnostics(latestGameViewport);
  debugCanvas.dataset.viewport = formatViewportDiagnostics(latestGameViewport);
  if (GAME_VIEWPORT.qaDiagnostics) {
    console.info(`[viewport-qa] ${formatViewportDiagnostics(latestGameViewport)}`);
    renderViewportQaMarkers(latestGameViewport, showCropMarks);
  }
  return latestGameViewport;
}

const viewportResizeObserver = new ResizeObserver(refreshGameViewportDiagnostics);
viewportResizeObserver.observe(gameFrame);
window.addEventListener("resize", refreshGameViewportDiagnostics);

function createCombatActorState({
  label,
  getCombatCollider,
  setVisualTransform,
  onDeathStart,
  onDeathProgress,
  onSpawnProgress,
  onHitFlashStart,
  onKnockback,
}) {
  let health = MAX_HEALTH;
  let isDying = false;
  let isDead = false;
  // A sprite must have a valid visible transform before its first renderer
  // update.  Initializing at zero size/opacity can leave Lite's saved sprite
  // size at zero, making the actor permanently invisible.
  let spawnElapsedSeconds = SPAWN_ANIMATION_DURATION_SECONDS;
  let deathElapsedSeconds = 0;
  let deathRotation = 0;
  let hitFlashRemainingSeconds = 0;

  if (onSpawnProgress) {
    onSpawnProgress(1);
  }

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
    beginSpawn() {
      spawnElapsedSeconds = 0;
      if (onSpawnProgress) {
        onSpawnProgress(0);
      }
    },
    updateSpawn(deltaSeconds) {
      if (spawnElapsedSeconds >= SPAWN_ANIMATION_DURATION_SECONDS) {
        return;
      }

      spawnElapsedSeconds = Math.min(
        SPAWN_ANIMATION_DURATION_SECONDS,
        spawnElapsedSeconds + Math.max(0, deltaSeconds),
      );
      const progress = spawnElapsedSeconds / SPAWN_ANIMATION_DURATION_SECONDS;
      if (onSpawnProgress) {
        onSpawnProgress(progress);
      }
    },
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

function setCharacterSpawnProgress(actor, size, progress) {
  actor.setVisualTransform({
    sizePx: [size * Math.max(progress, 0.001), size * Math.max(progress, 0.001)],
  });
  for (const layer of actor.layers) {
    layer.opacity = progress;
  }
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

  const engine = await createEngine(canvas, {
    // All world coordinates are authored in the 576x1024 logical space.
    // Do not let DPR enlarge Babylon's projection space; CSS scales this
    // single logical surface as one unit with the debug and DOM layers.
    maxDevicePixelRatio: 1,
  });
  // Babylon Lite's automatic surface observer otherwise replaces the logical
  // render size with the CSS size on every engine frame. Keep the render
  // surface fixed; CSS scales the complete canvas as the viewport root.
  engine._w = GAME_VIEWPORT.referenceResolution.width;
  engine._h = GAME_VIEWPORT.referenceResolution.height;
  refreshGameViewportDiagnostics();
  const animationManager = createSpriteAnimationManager();
  const level = await loadTiledMap(`${import.meta.env.BASE_URL}levels/tiled/maps/Level01.tmj`);
  const terrainImages = new Set(collectTiledLayerTiles(level).map(({ image }) => image));
  const [
    terrainAtlasEntries,
    archerAtlas,
    archerEnemyAtlases,
    arrowAtlas,
    waterFoamAtlas,
    sheepAtlases,
    goblinAtlases,
    warriorAtlases,
    lancerAtlases,
    monkAtlases,
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
    loadArcherAtlases(engine),
    loadArrowAtlas(engine),
    loadSpriteAtlas(engine, "./assets/terrain/Water Foam.png", {
      gridSize: [WATER_FOAM_FRAME_SIZE, WATER_FOAM_FRAME_SIZE],
      sampling: "nearest",
    }),
    loadSheepAtlases(engine),
    loadGoblinAtlases(engine),
    loadWarriorAtlases(engine),
    loadLancerAtlases(engine),
    loadMonkAtlases(engine),
    loadEditorConfig(import.meta.env.BASE_URL),
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
  const goldStoneImages = new Set(level.goldStones.flatMap(({ goldStone }) => goldStone.variantImages ?? [goldStone.image]));
  const goldPickupImages = [
    `${import.meta.env.BASE_URL}assets/terrain/resources/gold/gold-pickup-1.png`,
    `${import.meta.env.BASE_URL}assets/terrain/resources/gold/gold-pickup-2.png`,
  ];
  const goldStoneAtlases = new Map(await Promise.all([...goldStoneImages].map(async (image) => [image, await loadSpriteAtlas(engine, image, { gridSize: [128, 128], sampling: "nearest" })])));
  const goldPickupAtlases = new Map(await Promise.all(goldPickupImages.map(async (image) => [image, await loadSpriteAtlas(engine, image, { gridSize: [64, 64], sampling: "nearest" })])));
  const pickupSystem = createPickupSystem();
  const goldPickupDefinition = {
    create: ({ position, index }) => {
      const image = goldPickupImages[Math.floor(Math.random() * goldPickupImages.length)];
      const pickup = createGoldPickup({ object: { id: `gold-${index}` }, atlas: goldPickupAtlases.get(image), startPosition: position.start, destination: position.destination, screenHeight: SCREEN_HEIGHT });
      pickup.destination = position.cell;
      return pickup;
    },
  };
  for (const spawner of level.goldPickupSpawners ?? []) {
    const position = gridCellToWorldCenter(spawner.gameCell, TILE_SIZE);
    const pickup = pickupSystem.spawn(goldPickupDefinition, { start: position, cell: spawner.gameCell, destination: position });
    console.log(`Gold pickup spawned: spawner=${spawner.id} tiledCell=(${spawner.tiledCell.x},${spawner.tiledCell.y}) gameCell=(${spawner.gameCell.x},${spawner.gameCell.y}) position=(${position.x},${position.y}) pickup=${pickup?.id}`);
    pickup?.update(0.35);
  }
  const goldStoneObjects = level.goldStones.map((object) => {
    const image = object.goldStone.variantImages[Math.floor(Math.random() * object.goldStone.variantImages.length)];
    return createGoldStone({ object: { ...object, goldStone: { ...object.goldStone, image } }, atlas: goldStoneAtlases.get(image), animationManager, screenHeight: SCREEN_HEIGHT, onDeathComplete: (position) => {
      const origin = { x: Math.floor(position.x / TILE_SIZE), y: Math.floor(position.y / TILE_SIZE) };
      const destinations = chooseNineGridDestinations(origin, Math.random() < 0.5 ? 2 : 3, (cell) => cell.x >= 0 && cell.x < GRID.columns && cell.y >= 0 && cell.y < GRID.rows && !pickupSystem.pickups.some((pickup) => pickup.destination?.x === cell.x && pickup.destination?.y === cell.y));
      for (const cell of destinations) {
        pickupSystem.spawn(goldPickupDefinition, { start: position, cell, destination: { x: (cell.x + 0.5) * TILE_SIZE, y: (cell.y + 0.5) * TILE_SIZE } });
      }
    } });
  });
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
  const characterPerception = createCharacterPerception();

  function attachActor(record) {
    if (renderer) {
      for (const layer of record.actor.layers) {
        addSpriteRendererLayer(renderer, layer);
      }
      record.actor.playAnimation(animationManager);
    }
    if (!record.expressionInstances) {
      record.expressionInstances = [];
    }
    if (record.expressionState === undefined) {
      record.expressionState = "NONE";
    }
    if (record.expressionJumpOffset === undefined) {
      record.expressionJumpOffset = 0;
    }
    if (record.expression === undefined) {
      record.expression = getEnemyExpression("NONE");
    }
    // Initial actors are attached before the renderer is created. Spawn state
    // must still begin there, so every actor gets the same reveal animation.
    record.combat.beginSpawn();
    if (record.type === SpawnerType.ENEMY && !record.reaction) {
      record.reaction = createEnemyPerceptionReaction({
        onFace: () => record.actor.setMovementIntent?.({ x: 0, y: 0 }),
        onMoveTo: (cell) => {
          const current = record.actor.getGridPosition(TILE_SIZE);
          const dx = cell.x - current.x;
          const dy = cell.y - current.y;
          record.actor.setMovementIntent?.(Math.abs(dx) >= Math.abs(dy)
            ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
        },
      });
    }
    if ([SpawnerType.PLAYER, SpawnerType.ENEMY].includes(record.type)) {
      characterPerception.register({
        id: record.combat.label,
        type: record.type === SpawnerType.PLAYER ? "player" : "enemy",
        isAlive: record.combat.isAlive,
        cell: record.actor.getGridPosition(TILE_SIZE),
        facing: record.actor.getFacing?.() ?? "right",
        onDetection: (event) => record.reaction?.acceptDetection(event),
      });
    }
    return record;
  }

  function disposeActorRecord(record) {
    characterPerception.unregister(record.combat.label);
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
      onDropItem: (item, startPosition, movement) => {
        if (item !== "gold") return;
        const direction = movement.x !== 0 || movement.y !== 0
          ? movement
          : { x: 1, y: 0 };
        const length = Math.hypot(direction.x, direction.y) || 1;
        const destination = {
          x: Math.max(0, Math.min(GRID.columns - 1, Math.floor(startPosition.x / TILE_SIZE + direction.x / length))) + 0.5,
          y: Math.max(0, Math.min(GRID.rows - 1, Math.floor(startPosition.y / TILE_SIZE + direction.y / length))) + 0.5,
        };
        pickupSystem.spawn(goldPickupDefinition, {
          start: startPosition,
          cell: { x: destination.x - 0.5, y: destination.y - 0.5 },
          destination: { x: destination.x * TILE_SIZE, y: destination.y * TILE_SIZE },
        });
      },
    });
    const combat = createCombatActorState({
      label: `player-${nextActorId++}`,
      getCombatCollider: () => actor.getCombatCollider(),
      setVisualTransform: (transform) => actor.setVisualTransform(transform),
      onSpawnProgress: (progress) => setCharacterSpawnProgress(
        actor,
        PLAYER_FRAME.width,
        progress,
      ),
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
      onSpawnProgress: (progress) => setCharacterSpawnProgress(
        actor,
        SHEEP_FRAME_SIZE,
        progress,
      ),
      onDeathProgress: (value) => actor.setVisualTransform({
        sizePx: [SHEEP_FRAME_SIZE * value, SHEEP_FRAME_SIZE * value],
      }),
      onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }),
      onKnockback: (direction, options) => actor.applyKnockback(direction, options),
    });
    return attachActor({ type: SpawnerType.SHEEP, actor, combat });
  }

  function createArcherRecord(position) {
    const ownerId = `archer-${nextActorId++}`;
    const actor = createArcher({ atlases: archerEnemyAtlases, initialPosition: position, bounds: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }, obstacles: obstacleColliders, onShoot: (spawnPosition, target, options) => { const dx = target.x - spawnPosition.x; const dy = target.y - spawnPosition.y; const length = Math.hypot(dx, dy) || 1; return projectiles.shoot(spawnPosition, options.initialVelocityDirection ?? { x: dx / length, y: dy / length }, ownerId, { target, speedMultiplier: 0.5, initialVelocityMultiplier: 2, collisionEnabled: false, rotationEnabled: false, ...options }); } });
    const combat = createCombatActorState({ label: ownerId, getCombatCollider: () => actor.getCombatCollider(), setVisualTransform: (transform) => actor.setVisualTransform(transform), onSpawnProgress: (progress) => setCharacterSpawnProgress(actor, ARCHER_FRAME.width, progress), onDeathProgress: (value) => actor.setVisualTransform({ sizePx: [ARCHER_FRAME.width * value, ARCHER_FRAME.height * value] }), onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }), onKnockback: () => {} });
    return attachActor({ type: SpawnerType.ENEMY, character: SpawnerCharacter.ARCHER, actor, combat, controller: createEnemyPatrolController(actor) });
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
      onSpawnProgress: (progress) => setCharacterSpawnProgress(
        actor,
        GOBLIN_FRAME.width,
        progress,
      ),
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
      spawnCell: getCharacterGridCell(actor.getMovementCollider(), TILE_SIZE),
      isWalkable,
      bushChance: 0.25,
      idleRange: [3, 5],
      prioritizeBushes: false,
      getWorld: () => ({
        characters: [
          ...getRecordsByType(SpawnerType.PLAYER),
          ...getRecordsByType(SpawnerType.SHEEP),
        ].filter(({ combat: targetCombat }) => targetCombat.isAlive).map((target) => ({
          id: target.combat.label,
          isAlive: target.combat.isAlive,
          position: target.actor.getPosition(),
          cell: getCharacterGridCell(target.actor.getMovementCollider(), TILE_SIZE),
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
      onSpawnProgress: (progress) => setCharacterSpawnProgress(
        actor,
        WARRIOR_FRAME.width,
        progress,
      ),
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
      controller: createEnemyPatrolController(actor),
    });
  }

  function createLancerRecord(position) {
    const actor = createLancer({ atlases: lancerAtlases, initialPosition: position, bounds: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }, obstacles: obstacleColliders });
    const combat = createCombatActorState({ label: `lancer-${nextActorId++}`, getCombatCollider: () => actor.getCombatCollider(), setVisualTransform: (transform) => actor.setVisualTransform(transform), onSpawnProgress: (progress) => setCharacterSpawnProgress(actor, LANCER_FRAME.width, progress), onDeathProgress: (value) => actor.setVisualTransform({ sizePx: [LANCER_FRAME.width * value, LANCER_FRAME.height * value] }), onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }), onKnockback: (direction, options) => actor.applyKnockback(direction, options) });
    return attachActor({ type: SpawnerType.ENEMY, character: SpawnerCharacter.LANCER, actor, combat, controller: createEnemyPatrolController(actor) });
  }

  function createMonkRecord(position) {
    const actor = createMonk({ atlases: monkAtlases, initialPosition: position, bounds: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }, obstacles: obstacleColliders });
    const combat = createCombatActorState({ label: `monk-${nextActorId++}`, getCombatCollider: () => actor.getCombatCollider(), setVisualTransform: (transform) => actor.setVisualTransform(transform), onSpawnProgress: (progress) => setCharacterSpawnProgress(actor, MONK_FRAME.width, progress), onDeathProgress: (value) => actor.setVisualTransform({ sizePx: [MONK_FRAME.width * value, MONK_FRAME.height * value] }), onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }), onKnockback: () => {} });
    return attachActor({ type: SpawnerType.ENEMY, character: SpawnerCharacter.MONK, actor, combat, controller: createEnemyPatrolController(actor) });
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
    [SpawnerCharacter.ARCHER]: { atlas: archerEnemyAtlases.idle, frameSize: ARCHER_FRAME },
    [SpawnerCharacter.LANCER]: { atlas: lancerAtlases.idle, frameSize: LANCER_FRAME },
    [SpawnerCharacter.MONK]: { atlas: monkAtlases.idle, frameSize: MONK_FRAME },
  };
  const actorFactories = {
    [SpawnerCharacter.PLAYER]: createPlayerRecord,
    [SpawnerCharacter.SHEEP]: createSheepRecord,
    [SpawnerCharacter.GOBLIN]: createGoblinRecord,
    [SpawnerCharacter.WARRIOR]: createWarriorRecord,
    [SpawnerCharacter.ARCHER]: createArcherRecord,
    [SpawnerCharacter.LANCER]: createLancerRecord,
    [SpawnerCharacter.MONK]: createMonkRecord,
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
    [SpawnerCharacter.ARCHER]: { frame: ARCHER_FRAME, pivot: ARCHER_PIVOT, collider: ARCHER_MOVEMENT_COLLIDER },
    [SpawnerCharacter.LANCER]: { frame: LANCER_FRAME, pivot: LANCER_PIVOT, collider: LANCER_MOVEMENT_COLLIDER },
    [SpawnerCharacter.MONK]: { frame: MONK_FRAME, pivot: MONK_PIVOT, collider: MONK_MOVEMENT_COLLIDER },
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
    minimumCount: config.character === SpawnerCharacter.SHEEP ? 1 : config.minimumCount,
    maximumCount: config.character === SpawnerCharacter.SHEEP ? 1 : config.maximumCount,
    tileSize: TILE_SIZE,
    spawnMaxDistance: [SpawnerCharacter.PLAYER, SpawnerCharacter.SHEEP, SpawnerCharacter.GOBLIN, SpawnerCharacter.WARRIOR, SpawnerCharacter.ARCHER, SpawnerCharacter.MONK]
      .includes(config.character) ? 0 : 1,
    isWalkable: (_position, cell) => spawnWalkability[config.character](cell,
      spawners.flatMap((otherSpawner) => otherSpawner.actors
        .map((record) => ({ collider: record.actor.getMovementCollider() }))),
    ),
    getWalkableCells: () => Array.from({ length: GRID.rows }, (_, y) => y)
      .flatMap((y) => Array.from({ length: GRID.columns }, (_, x) => ({ x, y }))),
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
  globalThis.characterPerceptionDebug = Object.freeze({ snapshot: () => characterPerception.getSnapshot() });
  const handlePerceptionDebugKey = (event) => {
    const state = getDebugExpressionState(event.key);
    if (!state) return;
    for (const record of getRecordsByType(SpawnerType.ENEMY)) {
      if (record.combat.isAlive) {
        record.reaction?.forceState(state);
        record.expressionFlashRemaining = state === "SUSPICIOUS" ? 0.25
          : state === "INVESTIGATING" ? 0.25 : state === "ALERT" ? 0.25 : 0;
        record.expressionFlashColor = state === "SUSPICIOUS" ? [1.8, 1.8, 1.8, 1]
          : state === "INVESTIGATING" ? [1.8, 1.8, 0.3, 1]
          : state === "ALERT" ? [1.8, 0.3, 0.3, 1] : null;
      }
    }
  };
  window.addEventListener("keydown", handlePerceptionDebugKey);
  const getBushBurningSnapshot = () => ({
      bushes: reactiveDecorations.map((decoration) => ({
        id: decoration.id,
        health: decoration.health,
        isAlive: decoration.isAlive,
        isDying: decoration.isDying,
        isDead: decoration.isDead,
        firePlaying: decoration.firePlaying,
        cell: decoration.cell,
      })),
      goblins: getRecordsByType(SpawnerType.ENEMY)
        .filter(({ character }) => character === SpawnerCharacter.GOBLIN)
        .map(({ actor, combat, controller }) => ({
          id: combat.label,
          mode: controller.mode,
          cell: getCharacterGridCell(actor.getMovementCollider(), TILE_SIZE),
        })),
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
      ...goldStoneObjects.map((object) => object.layer),
      ...pickupSystem.pickups.map((pickup) => pickup.layer),
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
  pickupSystem.setRenderer({ add: (layer) => addSpriteRendererLayer(renderer, layer), remove: (layer) => removeSpriteRendererLayer(renderer, layer) });

  const handleGoldPickupClick = (event) => {
    const viewport = latestGameViewport ?? refreshGameViewportDiagnostics();
    const point = logicalPointFromClient({ x: event.clientX, y: event.clientY }, viewport);
    const x = point.x;
    const y = SCREEN_HEIGHT - point.y;
    for (const pickup of pickupSystem.pickups) {
      const collider = pickup.getCombatCollider();
      if (collider && x >= collider.x && x <= collider.x + collider.width
        && y >= collider.y && y <= collider.y + collider.height) {
        pickup.collect();
        break;
      }
    }
  };
  canvas.addEventListener("pointerup", handleGoldPickupClick);

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
    runtimeSettingsStore.get(RUNTIME_DEBUG_SETTING_KEYS.showParticleFxPreview),
  );
  setAnimatedTilePreview(
    runtimeSettingsStore.get(RUNTIME_DEBUG_SETTING_KEYS.showAnimatedTilePreview),
  );
  const unsubscribeParticleFxPreview = runtimeSettingsStore.subscribe(
    RUNTIME_DEBUG_SETTING_KEYS.showParticleFxPreview,
    setParticleFxPreview,
  );
  const unsubscribeAnimatedTilePreview = runtimeSettingsStore.subscribe(
    RUNTIME_DEBUG_SETTING_KEYS.showAnimatedTilePreview,
    setAnimatedTilePreview,
  );
  globalThis.particleFxPreview = Object.freeze({
    effects: Object.freeze([...particleEffects]),
  });

  let previousTime = performance.now();
  let showColliders = runtimeSettingsStore.get(RUNTIME_DEBUG_SETTING_KEYS.showColliders);
  coordinatesUi.setVisible(showColliders);
  for (const marker of spawnerMarkers) {
    marker.setVisible(showColliders);
  }
  const unsubscribeColliders = runtimeSettingsStore.subscribe(
    RUNTIME_DEBUG_SETTING_KEYS.showColliders,
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
  createSettingsUi({ host: gameUi, modalHost: domBody, screenLayer: domScreen, pauseController });
  showCropMarks = runtimeSettingsStore.get(RUNTIME_DEBUG_SETTING_KEYS.showCropMarks);
  if (latestGameViewport) renderViewportQaMarkers(latestGameViewport, showCropMarks);
  const unsubscribeCropMarks = runtimeSettingsStore.subscribe(
    RUNTIME_DEBUG_SETTING_KEYS.showCropMarks,
    (value) => {
      showCropMarks = value;
      if (latestGameViewport) renderViewportQaMarkers(latestGameViewport, value);
    },
  );
  createReleaseMetadataUi({ host: gameUi, metadata: releaseMetadata });
  const goal = createGoal({ host: gameUi, artworkUrl: "./assets/goals/Goal.png", position: { x: (level.goals[0].gameCell.x + 0.5) * TILE_SIZE, y: (level.goals[0].gameCell.y + 0.5) * TILE_SIZE }, screenWidth: SCREEN_WIDTH, screenHeight: SCREEN_HEIGHT });
  const levelCompleteUi = createLevelCompleteUi({ host: domBody, onContinue: () => window.location.reload() });
  const gameStateMachine = createGameStateMachine();
  const characterLockupWatchdog = createCharacterLockupWatchdog();

  function update(currentTime) {
    const deltaSeconds = Math.min((currentTime - previousTime) / 1000, 0.05);
    previousTime = currentTime;
    const activeDelta = pauseController.getDelta(deltaSeconds);
    if (gameStateMachine.state === GameState.LEVEL_START) {
      gameStateMachine.assetsLoaded();
    }

    updateSpriteAnimationManager(animationManager, activeDelta * 1000);
    if (activeDelta > 0) {
      const nextTouchPairs = new Set();
      for (const spawner of spawners) {
        for (const record of spawner.actors) {
          record.combat.updateSpawn(activeDelta);
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
      const characterRecords = [
        ...(playerRecord ? [playerRecord] : []),
        ...sheepRecords,
        ...enemyRecords,
      ];
      const lockup = characterLockupWatchdog.inspect(characterRecords, activeDelta);
      if (lockup) console.warn("Character lockup detected; separating", lockup.labels);
      separateOverlappingCharacterColliders([
        ...characterRecords,
      ]);
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
      for (const record of [playerRecord, ...enemyRecords]) {
        if (record) characterPerception.updateActor(record.combat.label, {
          isAlive: record.combat.isAlive,
          cell: record.actor.getGridPosition(TILE_SIZE),
          heading: record.actor.getHeading?.() ?? "right",
        });
      }
      for (const record of enemyRecords) record.reaction?.update(activeDelta);
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
          ...getOtherCharacterColliders(
            enemyRecords,
            record.combat.label,
            CharacterType.ENEMY,
          ),
        ], record.character === SpawnerCharacter.WARRIOR ? projectileState : [], playerSnapshot);
      }
      characterPerception.update(activeDelta);
      for (const record of enemyRecords) {
        record.reaction?.update(activeDelta);
        if (!record.expressionInstances) {
          record.expressionInstances = [];
        }
        const reactionSnapshot = record.reaction?.getSnapshot();
        const nextState = reactionSnapshot?.state ?? "NONE";
        const nextExpression = getEnemyExpression(nextState);
        if (record.expressionState !== nextState) {
          for (const instance of record.expressionInstances) {
            if (instance.phase !== "out") {
              instance.phase = "out";
            }
          }
          if (nextExpression.icon) {
            record.expressionInstances.push({
              icon: nextExpression.icon,
              flash: nextExpression.flash,
              opacity: 0,
              phase: "in",
            });
          }
          if (nextExpression.flash) {
            record.expressionFlashRemaining = ENEMY_EXPRESSION_FADE_SECONDS;
            record.expressionFlashColor = nextExpression.flash === "white" ? [1.8, 1.8, 1.8, 1]
              : nextExpression.flash === "yellow" ? [1.8, 1.8, 0.3, 1]
              : [1.8, 0.6, 0.6, 1];
          }
          record.expressionState = nextState;
        }

        const step = activeDelta / ENEMY_EXPRESSION_INSTANCE_FADE_SECONDS;
        for (const instance of record.expressionInstances) {
          if (instance.phase === "in") {
            instance.opacity = Math.min(1, instance.opacity + step);
            if (instance.opacity >= 1 - 1e-6) {
              instance.phase = "steady";
              instance.opacity = 1;
            }
          } else if (instance.phase === "out") {
            instance.opacity = Math.max(0, instance.opacity - step);
          }
        }

        record.expressionInstances = record.expressionInstances.filter((instance) => {
          if (instance.phase !== "out" || instance.opacity > 0.0001) {
            return true;
          }
          return false;
        });
        const visible = record.expressionInstances.find((instance) => instance.opacity > 0);
        record.expression = visible
          ? {
              ...getEnemyExpression(record.expressionState),
              icon: visible.icon,
              flash: visible.flash,
              opacity: visible.opacity,
            }
          : getEnemyExpression("NONE");
        if (record.expressionFlashRemaining > 0) {
          const expressionElapsedSeconds = ENEMY_EXPRESSION_FADE_SECONDS - record.expressionFlashRemaining;
          const jumpElapsedSeconds = Math.min(expressionElapsedSeconds, EMOTIONAL_JUMP_DURATION_SECONDS);
          const jumpProgress = jumpElapsedSeconds / EMOTIONAL_JUMP_DURATION_SECONDS;
          if (jumpElapsedSeconds >= EMOTIONAL_JUMP_DURATION_SECONDS) {
            record.actor.setArtYOffset?.(0);
            record.expressionJumpOffset = 0;
          } else {
            const bounceProgress = jumpProgress < 0.5 ? jumpProgress * 2 : (1 - jumpProgress) * 2;
            const jumpOffset = -EMOTIONAL_JUMP_HEIGHT_PIXELS * (1 - ((1 - bounceProgress) ** 2));
            record.actor.setArtYOffset?.(jumpOffset);
            record.expressionJumpOffset = jumpOffset;
          }
          record.actor.setVisualTransform({ color: record.expressionFlashColor });
          record.expressionFlashRemaining = Math.max(0, record.expressionFlashRemaining - activeDelta);
          if (record.expressionFlashRemaining === 0) {
            record.actor.setVisualTransform({ color: [1, 1, 1, 1] });
            record.actor.setArtYOffset?.(0);
            record.expressionJumpOffset = 0;
          }
        } else {
          record.expressionJumpOffset = 0;
        }
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
      for (const object of goldStoneObjects) object.update(activeDelta);
      pickupSystem.update(activeDelta, playerCombatCollider);

      projectiles.update(activeDelta);
      const projectilesToRemove = [];
      for (const { id, collider, direction, ownerId } of projectiles.getColliders()) {
        let hit = false;
        for (const target of [...sheepCombatColliders, ...enemyCombatColliders, ...goldStoneObjects.map((object) => ({ record: { type: "object", combat: object }, collider: object.getCombatCollider() }))]) {
          if (!target.record.combat.isAlive || !target.collider || target.record.combat.label === ownerId) {
            continue;
          }
          if (collidersOverlap(collider, target.collider)) {
            const result = target.record.type === "object"
              ? (target.record.combat.applyDamage(1), projectiles.markHit(id), "damaged")
              : resolveProjectileHit(
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
        if (gameStateMachine.state === GameState.LEVEL_PLAYING && playerRecord.combat.isAlive
          && playerCombatCollider && collidersOverlap(playerCombatCollider, goal.combatCollider)) {
          gameStateMachine.goalReached();
          playerRecord.actor.setInputEnabled(false);
          pauseController.pause();
          levelCompleteUi.show();
        }
      }
    }
    const diagnosticCharacters = [
      ...spawnerByType.get(SpawnerType.PLAYER).actors,
      ...getRecordsByType(SpawnerType.SHEEP),
    ...getRecordsByType(SpawnerType.ENEMY),
    ].filter(({ combat }) => combat.isAlive).map((record) => ({
      actor: record.actor,
      combat: record.combat,
      movementCollider: record.actor.getMovementCollider(),
      character: record.character,
      reaction: record.reaction,
      expression: record.reaction ? (record.expression ?? getEnemyExpression("NONE")) : null,
      expressionInstances: record.expressionInstances ?? [],
    })).filter(({ combat }) => combat.isAlive).map((record) => ({
      combatCollider: record.combat.getCombatCollider(),
      movementCollider: record.movementCollider,
      character: record.character,
      expressionJumpOffset: record.expressionJumpOffset,
      expression: record.expression,
      expressionInstances: record.expressionInstances,
      perception: record.actor.getPerceptionSnapshot?.() ?? null,
    }));
    diagnosticCharacters.push(...reactiveDecorations
      .filter((decoration) => !decoration.isDead)
      .map((decoration) => {
        const combatCollider = decoration.getCombatCollider();
        if (!combatCollider) return null;
        const centerX = combatCollider.x + combatCollider.width / 2;
        const centerY = combatCollider.y + combatCollider.height / 2;
        const gridCollider = {
          x: Math.floor(centerX / TILE_SIZE) * TILE_SIZE,
          y: Math.floor(centerY / TILE_SIZE) * TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE,
        };
        return {
        combatCollider: gridCollider,
        centerCollider: gridCollider,
        // The bush sensor is a non-blocking trigger, not a walkability
        // collider. Keep it out of the green movement-collider diagnostics.
        movementCollider: null,
        };
      }).filter(Boolean));
    diagnosticCharacters.push(...goldStoneObjects
      .filter((object) => !object.isDead)
      .map((object) => ({
        combatCollider: object.getCombatCollider(),
        movementCollider: null,
      })));
    diagnosticCharacters.push(...pickupSystem.pickups
      .filter((pickup) => !pickup.isDead)
      .map((pickup) => ({
        combatCollider: pickup.getCombatCollider(),
        centerCollider: pickup.getCombatCollider(),
        movementCollider: null,
      })));
    drawDiagnostics(
      terrainTiles,
      diagnosticCharacters,
      projectiles.getColliders(),
      showColliders,
      characterPerception.getSnapshot(),
      pickupSystem.pickups,
    );
    canvas.dataset.bushDebug = JSON.stringify(getBushBurningSnapshot());

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
  window.addEventListener("pagehide", () => {
    canvas.removeEventListener("pointerup", handleGoldPickupClick);
    window.removeEventListener("keydown", handlePerceptionDebugKey);
    viewportSafeArea.dispose();
    viewportResizeObserver.disconnect();
    window.removeEventListener("resize", refreshGameViewportDiagnostics);
    unsubscribeCropMarks();
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
    for (const object of goldStoneObjects) object.dispose();
    goal.dispose();
    levelCompleteUi.dispose();
    pickupSystem.dispose();
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

function drawAabb(aabb, fillStyle, strokeStyle, lineWidth = 2) {
  const screenAabb = worldAabbToScreen(aabb);
  debugContext.fillStyle = fillStyle;
  debugContext.fillRect(
    screenAabb.x,
    screenAabb.y,
    screenAabb.width,
    screenAabb.height,
  );
  debugContext.strokeStyle = strokeStyle;
  debugContext.lineWidth = lineWidth;
  debugContext.strokeRect(
    screenAabb.x + 1,
    screenAabb.y + 1,
    screenAabb.width - 2,
    screenAabb.height - 2,
  );
}

function drawPolygon(polygon, fillStyle, strokeStyle, lineWidth = 2) {
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
  debugContext.lineWidth = lineWidth;
  debugContext.stroke();
}

function drawTerrainCollider(collider) {
  if (collider.type === "polygon") {
    drawPolygon(collider, TERRAIN_COLLIDER_STYLE.fillStyle, TERRAIN_COLLIDER_STYLE.strokeStyle, TERRAIN_COLLIDER_STYLE.lineWidth);
    return;
  }

  drawAabb(collider, TERRAIN_COLLIDER_STYLE.fillStyle, TERRAIN_COLLIDER_STYLE.strokeStyle, TERRAIN_COLLIDER_STYLE.lineWidth);
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
  perceptionSnapshot = [],
  goldPickups = [],
) {
  debugContext.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  for (const character of diagnosticCharacters) {
    if (!character.movementCollider || !Array.isArray(character.expressionInstances)) continue;
    const collider = character.movementCollider;
    const centerX = collider.type === "circle"
      ? collider.x
      : (collider.x ?? 0) + (collider.width ?? 0) / 2;
    const centerY = collider.type === "circle"
      ? collider.y
      : (collider.y ?? 0) + (collider.height ?? 0) / 2;
    const iconX = centerX;
    const iconOffsetY = ENEMY_EXPRESSION_ICON_OFFSET_Y_BY_CHARACTER[character.character]
      ?? ENEMY_EXPRESSION_ICON_OFFSET_Y_PIXELS;
    const iconY = SCREEN_HEIGHT - centerY + iconOffsetY + (character.expressionJumpOffset ?? 0);
    debugContext.font = "700 28px system-ui, sans-serif";
    debugContext.textAlign = "center";
    debugContext.textBaseline = "middle";
    for (const instance of character.expressionInstances) {
      if (!instance.icon) {
        continue;
      }
      const iconOpacity = Math.max(0, Math.min(1, instance.opacity ?? 0));
      if (iconOpacity <= 0) {
        continue;
      }
      debugContext.globalAlpha = iconOpacity;
      const iconScale = ENEMY_EXPRESSION_MIN_SCALE + (1 - ENEMY_EXPRESSION_MIN_SCALE) * iconOpacity;
      debugContext.save();
      debugContext.translate(iconX, iconY);
      debugContext.scale(iconScale, iconScale);
      debugContext.translate(-iconX, -iconY);
      debugContext.shadowColor = "rgb(0 0 0 / 70%)";
      debugContext.shadowBlur = 4;
      debugContext.shadowOffsetY = 2;
      debugContext.fillStyle = "#a8a8a8";
      debugContext.beginPath();
      debugContext.arc(iconX, iconY, 18, 0, Math.PI * 2);
      debugContext.fill();
      debugContext.strokeStyle = "#4a4a4a";
      debugContext.lineWidth = 2;
      debugContext.stroke();
      debugContext.fillStyle = instance.flash === "red" ? "#ff6b6b"
        : instance.flash === "yellow" ? "#ffe066" : "#ffffff";
      debugContext.fillText(instance.icon, iconX, iconY + 1);
      debugContext.shadowColor = "transparent";
      debugContext.shadowBlur = 0;
      debugContext.shadowOffsetY = 0;
      debugContext.restore();
      debugContext.globalAlpha = 1;
    }
  }
  if (!enabled) {
    return;
  }
  drawGridLines();
  debugContext.font = "700 8px system-ui, sans-serif";
  debugContext.textBaseline = "middle";

  for (const tile of terrainTiles) {
    for (const collider of tile.colliders) {
      drawTerrainCollider(collider);
    }

    const label = formatLevelCellLabel(tile.gameCell);
    const labelWidth = debugContext.measureText(label).width + 8;
    const labelX = tile.screenPosition.x + TILE_SIZE - labelWidth;
    const labelY = tile.screenPosition.y + 8;
    debugContext.fillStyle = "rgb(5 10 18 / 78%)";
    debugContext.fillRect(
      labelX,
      labelY - 8,
      labelWidth,
      16,
    );
    debugContext.fillStyle = tile.valid ? "#ffffff" : "#8f969f";
    debugContext.textAlign = "center";
    debugContext.fillText(
      label,
      labelX + labelWidth / 2,
      labelY,
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
  for (const center of createCharacterCenterDrawCommands(diagnosticCharacters)) {
    drawCharacterCenterMarker(center);
  }
  for (const command of createPerceptionDrawCommands(perceptionSnapshot, TILE_SIZE, performance.now())) {
    debugContext.beginPath();
    const points = command.points.map((point) => ({ x: point.x, y: SCREEN_HEIGHT - point.y }));
    debugContext.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) debugContext.lineTo(point.x, point.y);
    debugContext.closePath();
    debugContext.fillStyle = command.active && command.blinking
      ? command.style.blinkFillStyle
      : command.style.fillStyle;
    debugContext.fill();
  }
  for (const marker of createActivePerceptionMarkerCommands(perceptionSnapshot, TILE_SIZE)) {
    const screenY = SCREEN_HEIGHT - marker.y;
    const halfSize = marker.style.size / 2;
    debugContext.beginPath();
    debugContext.moveTo(marker.x - halfSize, screenY - halfSize);
    debugContext.lineTo(marker.x + halfSize, screenY + halfSize);
    debugContext.moveTo(marker.x + halfSize, screenY - halfSize);
    debugContext.lineTo(marker.x - halfSize, screenY + halfSize);
    debugContext.strokeStyle = marker.style.strokeStyle;
    debugContext.lineWidth = marker.style.lineWidth;
    debugContext.stroke();
  }
  for (const { collider } of projectileColliders) {
    drawAabb(collider, "rgb(255 220 64 / 38%)", "#ffe066");
  }
}

function drawCharacterCenterMarker(center) {
  const screenY = SCREEN_HEIGHT - center.y;
  const size = 2.5;
  debugContext.beginPath();
  debugContext.moveTo(center.x - size, screenY - size);
  debugContext.lineTo(center.x + size, screenY + size);
  debugContext.moveTo(center.x + size, screenY - size);
  debugContext.lineTo(center.x - size, screenY + size);
  debugContext.strokeStyle = "#000000";
  debugContext.lineWidth = 2;
  debugContext.stroke();
}

function formatStartupError(error) {
  const detail = error instanceof Error ? error.message : String(error);

  if (/source image could not be decoded|decode/i.test(detail)) {
    return [
      "The game could not load one of its image assets because its image URL may be broken or the file is not a valid image.",
      "Refresh the page. If the problem continues, make sure the app is running through Vite and check the browser console for the broken URL or failed asset path.",
      `Details: ${detail}`,
    ].join(" ");
  }

  if (/WebGPU enabled/i.test(detail)) {
    return `${detail} Enable WebGPU in a supported browser, then refresh the page.`;
  }

  return `The game could not start. Refresh the page and check the browser console for more details. Details: ${detail}`;
}

start().catch((error) => {
  console.error(error);
  errorOutput.textContent = formatStartupError(error);
});
