import assert from "node:assert/strict";
import test from "node:test";

import { createLevelTerrainTiles } from "../src/tiled-terrain.js";

test("Tiled rectangle collision becomes the existing full-cell world collider", () => {
  const [tile] = createLevelTerrainTiles([{
    frame: 42,
    gameCell: { x: 2, y: 3 },
    collisionShapes: [{ type: "rectangle", x: 0, y: 0, width: 1, height: 1 }],
  }], 64, 1024, new Set());

  assert.deepEqual(tile.collider, { x: 128, y: 192, width: 64, height: 64 });
  assert.equal(tile.blocked, true);
});

test("Tiled polygon collision becomes the existing bottom-left world triangle", () => {
  const [tile] = createLevelTerrainTiles([{
    frame: 48,
    gameCell: { x: 3, y: 10 },
    collisionShapes: [{
      type: "polygon",
      points: [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: 0 }],
    }],
  }], 64, 1024, new Set());

  assert.deepEqual(tile.collider, {
    type: "polygon",
    points: [{ x: 192, y: 704 }, { x: 256, y: 640 }, { x: 192, y: 640 }],
  });
  assert.equal(tile.blocked, true);
});

test("a tile without Tiled collision geometry remains walkable", () => {
  const [tile] = createLevelTerrainTiles([{
    frame: 36,
    gameCell: { x: 0, y: 0 },
  }], 64, 1024, new Set());

  assert.equal(tile.collider, null);
  assert.equal(tile.blocked, false);
});
