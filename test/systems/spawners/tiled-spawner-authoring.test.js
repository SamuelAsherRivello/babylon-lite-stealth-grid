import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { normalizeTiledMap } from "../../../plugins/tiled-babylon-lite/index.js";

const SPAWNER_TILESET_URL = new URL(
  "../../../public/levels/tiled/tilesets/SpawnerTypes.tsj",
  import.meta.url,
);

function makeMap(objects) {
  return {
    type: "map", orientation: "orthogonal", infinite: false,
    width: 9, height: 16, tilewidth: 64, tileheight: 64,
    tilesets: [{ firstgid: 1, source: "../tilesets/SpawnerTypes.tsj" }],
    layers: [
      { name: "World Origin", type: "tilelayer", data: [
        ...Array(135).fill(0), 1, ...Array(8).fill(0),
      ] },
      { name: "Spawners", type: "objectgroup", objects: [...objects, { id: 999, class: "GoalSpawner", x: 512, y: 64 }] },
    ],
  };
}

function makeTileset() {
  return {
    tilewidth: 64, tileheight: 64,
    tiles: [
      { id: 0, class: "Spawner", properties: [{ name: "type", value: "PLAYER" }] },
      { id: 1, class: "Spawner", properties: [{ name: "type", value: "SHEEP" }] },
      { id: 2, class: "Spawner", properties: [{ name: "type", value: "GOBLIN" }] },
    ],
  };
}

test("spawner palette contains Player, Sheep, Enemy, Monk, and Goal items", async () => {
  const tileset = JSON.parse(await readFile(SPAWNER_TILESET_URL, "utf8"));
  assert.equal(tileset.tiles.find(({ id }) => id === 3).class, "GoalSpawner");
  assert.equal(tileset.tiles.find(({ id }) => id === 4).properties.find(({ name }) => name === "type").value, "MONK");
  assert.deepEqual(tileset.tiles.filter(({ id }) => id < 3).sort((a, b) => a.id - b.id).map(({ id, name, properties }) => ({
    id,
    name,
    properties,
  })), [
    { id: 0, name: "Player Spawner", properties: [{ name: "type", type: "string", value: "PLAYER" }, { name: "spawnMode", type: "string", value: "nearby" }, { name: "spawnMaxDistance", type: "int", value: 0 }] },
      { id: 1, name: "Sheep Spawner", properties: [{ name: "type", type: "string", value: "SHEEP" }, { name: "spawnMode", type: "string", value: "nearby" }, { name: "spawnMaxDistance", type: "int", value: 3 }] },
      { id: 2, name: "Enemy Spawner", properties: [{ name: "type", type: "string", value: "GOBLIN" }, { name: "spawnMode", type: "string", value: "nearby" }, { name: "spawnMaxDistance", type: "int", value: 3 }] },
  ]);
});

test("runtime accepts the authored Lancer enemy spawner type", async () => {
  const source = await readFile(new URL("../../../plugins/tiled-babylon-lite/index.js", import.meta.url), "utf8");
  assert.match(source, /supportedTypes = new Set\(\[[^\]]*"LANCER"/s);
});

test("tile spawners normalize type defaults, Warrior override, and origin-relative cells", () => {
  const map = makeMap([
    { id: 1, name: "Player", gid: 1, x: 128, y: 896 },
    { id: 2, name: "Warrior", gid: 3, x: 384, y: 448,
      properties: [{ name: "type", type: "string", value: "WARRIOR" }] },
  ]);
  const level = normalizeTiledMap(map, new Map([
    ["../tilesets/SpawnerTypes.tsj", makeTileset()],
  ]));

  assert.deepEqual(level.spawners, [
    { id: 1, name: "Player", type: "PLAYER", spawnMode: "nearby", spawnMaxDistance: 0, gameCell: { x: 2, y: 2 } },
    { id: 2, name: "Warrior", type: "WARRIOR", spawnMode: "nearby", spawnMaxDistance: 3, gameCell: { x: 6, y: 9 } },
  ]);
});

test("off-grid tile spawners use the cell containing their bottom edge", () => {
  for (const y of [888.333333333333, 895.5, 896]) {
    const level = normalizeTiledMap(makeMap([
      { id: 1, name: "Player", gid: 1, x: 288.5, y, width: 37, height: 37 },
    ]), new Map([["../tilesets/SpawnerTypes.tsj", makeTileset()]]));

    assert.deepEqual(level.spawners[0].gameCell, { x: 4, y: 2 }, `bottom edge y=${y}`);
  }
});

test("level must contain exactly one Player Spawner", () => {
  const tileset = new Map([["../tilesets/SpawnerTypes.tsj", makeTileset()]]);
  assert.throws(
    () => normalizeTiledMap(makeMap([]), tileset),
    { message: "Invalid Level Format: Must contain 1 Player Spawner" },
  );
  assert.throws(
    () => normalizeTiledMap(makeMap([
      { id: 1, gid: 1, x: 64, y: 960 },
      { id: 2, gid: 1, x: 128, y: 960 },
    ]), tileset),
    { message: "Invalid Level Format: Must contain 1 Player Spawner" },
  );
});

test("unsupported spawner type reports the source object", () => {
  const map = makeMap([
    { id: 1, name: "Player", gid: 1, x: 64, y: 960 },
    { id: 7, name: "Unknown", gid: 3, x: 128, y: 896,
      properties: [{ name: "type", value: "DRAGON" }] },
  ]);
  assert.throws(
    () => normalizeTiledMap(map, new Map([["../tilesets/SpawnerTypes.tsj", makeTileset()]])),
    /Spawner object 7 \("Unknown"\) has unsupported type "DRAGON"/,
  );
});
