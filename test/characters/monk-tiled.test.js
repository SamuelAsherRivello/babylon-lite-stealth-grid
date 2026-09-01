import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTiledMap } from "../../plugins/tiled-babylon-lite/index.js";

test("Tiled loader accepts a Monk enemy spawner", () => {
  const map = {
    type: "map", orientation: "orthogonal", width: 9, height: 16,
    tilewidth: 64, tileheight: 64,
    tilesets: [{ firstgid: 1, source: "spawners.tsj" }],
    layers: [{ type: "tilelayer", name: "World Origin", data: [1, ...Array(143).fill(0)] },
      { type: "objectgroup", name: "Spawners", objects: [
      { id: 1, gid: 1, x: 32, y: 1024, width: 64, height: 64, name: "Player", properties: [{ name: "type", value: "PLAYER" }] },
      { id: 2, gid: 5, x: 32, y: 128, width: 64, height: 64, name: "Monk", properties: [{ name: "type", value: "MONK" }] },
      { id: 3, gid: 4, x: 512, y: 64, width: 64, height: 64, name: "Goal" },
    ] }],
  };
  const tileset = { tiles: [
    { id: 0, class: "Spawner", properties: [{ name: "type", value: "PLAYER" }, { name: "spawnMode", value: "nearby" }, { name: "spawnMaxDistance", value: 0 }] },
    { id: 3, class: "GoalSpawner" },
    { id: 4, class: "Spawner", properties: [{ name: "type", value: "MONK" }, { name: "spawnMode", value: "nearby" }, { name: "spawnMaxDistance", value: 0 }] },
  ] };
  const result = normalizeTiledMap(map, new Map([["spawners.tsj", tileset]]));
  assert.equal(result.spawners[1].type, "MONK");
  assert.deepEqual(result.spawners[1].gameCell, { x: 0, y: -1 });
});
