export const SpawnerType = Object.freeze({
  PLAYER: "player",
  SHEEP: "sheep",
  ENEMY: "enemy",
});

export const SpawnerCharacter = Object.freeze({
  PLAYER: "player",
  SHEEP: "sheep",
  GOBLIN: "goblin",
  WARRIOR: "warrior",
});

const SPAWNER_DEFAULTS = Object.freeze({
  PLAYER: Object.freeze({
    type: SpawnerType.PLAYER,
    character: SpawnerCharacter.PLAYER,
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: true,
  }),
  SHEEP: Object.freeze({
    type: SpawnerType.SHEEP,
    character: SpawnerCharacter.SHEEP,
    minimumCount: 2,
    maximumCount: 2,
    guaranteeInitialPopulation: false,
  }),
  GOBLIN: Object.freeze({
    type: SpawnerType.ENEMY,
    character: SpawnerCharacter.GOBLIN,
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: false,
  }),
  WARRIOR: Object.freeze({
    type: SpawnerType.ENEMY,
    character: SpawnerCharacter.WARRIOR,
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: true,
  }),
});

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
    return {
      ...defaults,
      position: {
        x: (spawner.gameCell.x + 0.5) * tileSize,
        y: (spawner.gameCell.y + 0.5) * tileSize,
      },
      gameCell: { ...spawner.gameCell },
    };
  });
}
