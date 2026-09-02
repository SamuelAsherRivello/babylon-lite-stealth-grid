import test from "node:test";
import assert from "node:assert/strict";

import {
  GridSpot,
  getGridSpotCenter,
  getQuantizedGridCell,
} from "../../../src/systems/environment/grid-spot.js";

const GRID_64 = { width: 64, height: 64 };

test("initializes at the center of the assigned grid spot", () => {
  const spot = new GridSpot(getGridSpotCenter({ x: 2, y: 3 }, GRID_64), GRID_64);
  assert.deepEqual(spot.cell, { x: 2, y: 3 });
  assert.deepEqual(spot.cellCenter, { x: 160, y: 224 });
  assert.deepEqual(spot.getMarkerCommand(), { x: 160, y: 224 });
});

test("keeps an exact midpoint in the current cell and crosses one unit later", () => {
  const spot = new GridSpot({ x: 32, y: 32 }, GRID_64);
  assert.deepEqual(spot.update({ x: 64, y: 32 }).cell, { x: 0, y: 0 });
  assert.deepEqual(spot.update({ x: 65, y: 32 }).cell, { x: 1, y: 0 });
  assert.deepEqual(spot.update({ x: -1, y: 32 }).cell, { x: -1, y: 0 });
});

test("applies the same quantization independently on both axes", () => {
  assert.deepEqual(getQuantizedGridCell({ x: 65, y: 129 }, GRID_64), { x: 1, y: 2 });
  assert.deepEqual(getQuantizedGridCell({ x: 64, y: 128 }, GRID_64), { x: 0, y: 1 });
});

test("uses configured rectangular grid dimensions", () => {
  const grid = { width: 80, height: 40 };
  assert.deepEqual(getQuantizedGridCell({ x: 81, y: 41 }, grid), { x: 1, y: 1 });
  assert.deepEqual(getGridSpotCenter({ x: 1, y: 1 }, grid), { x: 120, y: 60 });
});

test("rejects invalid centers and cells", () => {
  assert.throws(() => new GridSpot({ x: Number.NaN, y: 0 }, GRID_64), /center.x must be finite/);
  assert.throws(() => getGridSpotCenter({ x: 1.5, y: 0 }, GRID_64), /coordinates must be integers/);
});
