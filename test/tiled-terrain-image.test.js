import assert from "node:assert/strict";
import test from "node:test";

import { normalizeTiledMap } from "../plugins/tiled-babylon-lite/index.js";

test("terrain normalization skips object-only tilesets instead of producing undefined images", () => {
  const map = {
    type: "map", orientation: "orthogonal", infinite: false,
    width: 2, height: 1, tilewidth: 64, tileheight: 64,
    tilesets: [
      { firstgid: 1, source: "terrain.tsj" },
      { firstgid: 100, source: "objects.tsj" },
      { firstgid: 200, source: "spawners.tsj" },
    ],
    layers: [
      { name: "World Origin", type: "tilelayer", data: [1, 0] },
      { name: "Background", type: "tilelayer", data: [100, 1] },
      { name: "Spawners", type: "objectgroup", objects: [{ id: 1, gid: 200, x: 0, y: 64 }] },
    ],
  };
  const externalTilesets = new Map([
    ["terrain.tsj", { image: "terrain.png", tilewidth: 64, tileheight: 64 }],
    ["objects.tsj", { tiles: [{ id: 0, image: "object.png" }], tilewidth: 64, tileheight: 64 }],
    ["spawners.tsj", { tiles: [{ id: 0, class: "Spawner", properties: [{ name: "type", value: "PLAYER" }] }], tilewidth: 64, tileheight: 64 }],
  ]);
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (message) => warnings.push(message);
  try {
    const level = normalizeTiledMap(map, externalTilesets);
    assert.deepEqual(level.layers[0].tiles.map(({ image }) => image), ["terrain.png"]);
    assert.match(warnings[0], /terrain tile 100.*Background.*objects\.tsj.*no terrain atlas image/);
  } finally {
    console.warn = originalWarn;
  }
});
