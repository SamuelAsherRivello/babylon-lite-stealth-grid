export const SpawnerType = Object.freeze({
  PLAYER: "player",
  SHEEP: "sheep",
  ENEMY: "enemy",
  OBJECT: "object",
});

export const SpawnerCharacter = Object.freeze({
  PLAYER: "player",
  SHEEP: "sheep",
  GOBLIN: "goblin",
  WARRIOR: "warrior",
  ARCHER: "archer",
  LANCER: "lancer",
  MONK: "monk",
});

export const SpawnMode = Object.freeze({
  NEARBY: "nearby",
  ANYWHERE_WALKABLE: "anywhere-walkable",
});

const SPAWNER_DEFAULTS = Object.freeze({
  PLAYER: Object.freeze({
    type: SpawnerType.PLAYER,
    character: SpawnerCharacter.PLAYER,
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: true,
    spawnMode: SpawnMode.NEARBY,
    spawnMaxDistance: 0,
  }),
  SHEEP: Object.freeze({
    type: SpawnerType.SHEEP,
    character: SpawnerCharacter.SHEEP,
    minimumCount: 2,
    maximumCount: 2,
    guaranteeInitialPopulation: false,
    spawnMode: SpawnMode.NEARBY,
    spawnMaxDistance: 3,
  }),
  GOBLIN: Object.freeze({
    type: SpawnerType.ENEMY,
    character: SpawnerCharacter.GOBLIN,
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: true,
    spawnMode: SpawnMode.NEARBY,
    spawnMaxDistance: 0,
  }),
  WARRIOR: Object.freeze({
    type: SpawnerType.ENEMY,
    character: SpawnerCharacter.WARRIOR,
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: true,
    spawnMode: SpawnMode.NEARBY,
    spawnMaxDistance: 0,
  }),
  ARCHER: Object.freeze({
    type: SpawnerType.ENEMY,
    character: SpawnerCharacter.ARCHER,
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: true,
    spawnMode: SpawnMode.NEARBY,
    spawnMaxDistance: 0,
  }),
  MONK: Object.freeze({
    type: SpawnerType.ENEMY, character: SpawnerCharacter.MONK, minimumCount: 1,
    maximumCount: 1, guaranteeInitialPopulation: true, spawnMode: SpawnMode.NEARBY,
    spawnMaxDistance: 0,
  }),
  LANCER: Object.freeze({
    type: SpawnerType.ENEMY,
    character: SpawnerCharacter.LANCER,
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: true,
    spawnMode: SpawnMode.NEARBY,
    spawnMaxDistance: 0,
  }),
});

const PLAYER_SPAWN_BOTTOM_OFFSET_Y = 192 * (1 - 0.78);

function requirePositive(name, value) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive number`);
  }
}

export function createInitialSpawnerConfigs({
  screenWidth,
  screenHeight,
  tileSize,
  authoredSpawners = [],
}) {
  requirePositive("screenWidth", screenWidth);
  requirePositive("screenHeight", screenHeight);
  requirePositive("tileSize", tileSize);

  return authoredSpawners.map((spawner) => {
    const defaults = SPAWNER_DEFAULTS[spawner.type];
    if (!defaults) {
      throw new Error(`Unsupported spawner type: ${spawner.type}`);
    }
    const cellCenterPosition = {
      x: (spawner.gameCell.x + 0.5) * tileSize,
      y: (spawner.gameCell.y + 0.5) * tileSize,
    };
    return {
      ...defaults,
      position: {
        x: cellCenterPosition.x,
        y: cellCenterPosition.y,
      },
      gameCell: { ...spawner.gameCell },
      ...(spawner.spawnMode ? { spawnMode: spawner.spawnMode } : {}),
      ...(Number.isInteger(spawner.spawnMaxDistance)
        ? { spawnMaxDistance: spawner.spawnMaxDistance } : {}),
    };
  });
}
