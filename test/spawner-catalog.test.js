import test from "node:test";
import assert from "node:assert/strict";

import {
  SpawnerCharacter,
  SpawnerType,
  createInitialSpawnerConfigs,
} from "../src/spawner-catalog.js";

test("initial spawner catalog preserves current positions and population ranges", () => {
  const configs = createInitialSpawnerConfigs({
    screenWidth: 576,
    screenHeight: 1024,
    tileSize: 64,
  });

  assert.deepEqual(configs, [
    {
      type: SpawnerType.PLAYER,
      character: SpawnerCharacter.PLAYER,
      position: { x: 224, y: 512 },
      minimumCount: 1,
      maximumCount: 1,
      guaranteeInitialPopulation: true,
    },
    {
      type: SpawnerType.SHEEP,
      character: SpawnerCharacter.SHEEP,
      position: { x: 414.71999999999997, y: 286.72 },
      minimumCount: 2,
      maximumCount: 2,
      guaranteeInitialPopulation: false,
    },
    {
      type: SpawnerType.ENEMY,
      character: SpawnerCharacter.GOBLIN,
      position: { x: 161.28000000000003, y: 358.4 },
      minimumCount: 1,
      maximumCount: 1,
      guaranteeInitialPopulation: false,
    },
  ]);
  assert.equal("checkIntervalSeconds" in configs[0], false);
});

test("authored Warrior spawner keeps grid 05,09 and population one", () => {
  const configs = createInitialSpawnerConfigs({
    screenWidth: 576,
    screenHeight: 1024,
    tileSize: 64,
    authoredSpawners: [{
      type: "enemy",
      character: "warrior",
      gameCell: { x: 5, y: 9 },
      minimumCount: 1,
      maximumCount: 1,
      guaranteeInitialPopulation: true,
    }],
  });
  assert.deepEqual(configs.at(-1), {
    type: SpawnerType.ENEMY,
    character: SpawnerCharacter.WARRIOR,
    position: { x: 352, y: 608 },
    gameCell: { x: 5, y: 9 },
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: true,
  });
});

test("catalog rejects invalid dimensions", () => {
  assert.throws(
    () => createInitialSpawnerConfigs({ screenWidth: 0, screenHeight: 1024, tileSize: 64 }),
    /screenWidth/,
  );
});
