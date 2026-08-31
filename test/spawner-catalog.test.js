import test from "node:test";
import assert from "node:assert/strict";

import {
  SpawnerCharacter,
  SpawnerType,
  createInitialSpawnerConfigs,
} from "../src/spawner-catalog.js";

test("spawner catalog derives Babylon defaults from authored types and cells", () => {
  const configs = createInitialSpawnerConfigs({
    screenWidth: 576,
    screenHeight: 1024,
    tileSize: 64,
    authoredSpawners: [
      { type: "PLAYER", gameCell: { x: 3, y: 7 } },
      { type: "SHEEP", gameCell: { x: 6, y: 4 } },
      { type: "GOBLIN", gameCell: { x: 2, y: 5 } },
      { type: "WARRIOR", gameCell: { x: 5, y: 9 } },
    ],
  });

  assert.deepEqual(configs, [
    {
      type: SpawnerType.PLAYER,
      character: SpawnerCharacter.PLAYER,
      position: { x: 224, y: 480 },
      gameCell: { x: 3, y: 7 },
      minimumCount: 1,
      maximumCount: 1,
      guaranteeInitialPopulation: true,
    },
    {
      type: SpawnerType.SHEEP,
      character: SpawnerCharacter.SHEEP,
      position: { x: 416, y: 288 },
      gameCell: { x: 6, y: 4 },
      minimumCount: 2,
      maximumCount: 2,
      guaranteeInitialPopulation: false,
    },
    {
      type: SpawnerType.ENEMY,
      character: SpawnerCharacter.GOBLIN,
      position: { x: 160, y: 352 },
      gameCell: { x: 2, y: 5 },
      minimumCount: 1,
      maximumCount: 1,
      guaranteeInitialPopulation: false,
    },
    {
      type: SpawnerType.ENEMY,
      character: SpawnerCharacter.WARRIOR,
      position: { x: 352, y: 608 },
      gameCell: { x: 5, y: 9 },
      minimumCount: 1,
      maximumCount: 1,
      guaranteeInitialPopulation: true,
    },
  ]);
  assert.equal("checkIntervalSeconds" in configs[0], false);
});

test("optional non-player types can be omitted without fallback placements", () => {
  const configs = createInitialSpawnerConfigs({
    screenWidth: 576,
    screenHeight: 1024,
    tileSize: 64,
    authoredSpawners: [{ type: "PLAYER", gameCell: { x: 1, y: 2 } }],
  });
  assert.deepEqual(configs, [{
    type: SpawnerType.PLAYER,
    character: SpawnerCharacter.PLAYER,
    position: { x: 96, y: 160 },
    gameCell: { x: 1, y: 2 },
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: true,
  }]);
});

test("catalog rejects invalid dimensions", () => {
  assert.throws(
    () => createInitialSpawnerConfigs({ screenWidth: 0, screenHeight: 1024, tileSize: 64 }),
    /screenWidth/,
  );
});
