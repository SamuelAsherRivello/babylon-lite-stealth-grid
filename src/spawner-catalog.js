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

  const defaults = [
    {
      type: SpawnerType.PLAYER,
      character: SpawnerCharacter.PLAYER,
      position: { x: screenWidth / 2 - tileSize, y: screenHeight / 2 },
      minimumCount: 1,
      maximumCount: 1,
      guaranteeInitialPopulation: true,
    },
    {
      type: SpawnerType.SHEEP,
      character: SpawnerCharacter.SHEEP,
      position: { x: screenWidth * 0.72, y: screenHeight * (1 - 0.72) },
      minimumCount: 2,
      maximumCount: 2,
      guaranteeInitialPopulation: false,
    },
    {
      type: SpawnerType.ENEMY,
      character: SpawnerCharacter.GOBLIN,
      position: { x: screenWidth * 0.28, y: screenHeight * 0.35 },
      minimumCount: 1,
      maximumCount: 1,
      guaranteeInitialPopulation: false,
    },
  ];
  return [
    ...defaults,
    ...authoredSpawners.map((spawner) => ({
      type: spawner.type,
      character: spawner.character,
      position: {
        x: (spawner.gameCell.x + 0.5) * tileSize,
        y: (spawner.gameCell.y + 0.5) * tileSize,
      },
      gameCell: { ...spawner.gameCell },
      minimumCount: spawner.minimumCount,
      maximumCount: spawner.maximumCount,
      guaranteeInitialPopulation: spawner.guaranteeInitialPopulation,
    })),
  ];
}
