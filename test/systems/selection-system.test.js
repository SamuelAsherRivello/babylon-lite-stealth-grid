import test from "node:test";
import assert from "node:assert/strict";
import { createSelectionSystem, gridSpotFromLogicalPoint } from "../../src/systems/selection/selection-system.js";
import { GRID } from "../../src/systems/environment/grid-contract.js";

test("quantizes logical top-left input into bottom-left-origin grid coordinates", () => {
  assert.deepEqual(gridSpotFromLogicalPoint({ x: 130, y: 65 }, GRID), { x: 2, y: 14 });
});

test("selection toggles the same grid spot and switches to another spot", () => {
  const selection = createSelectionSystem(GRID);
  assert.deepEqual(selection.toggleGridSpot({ x: 2, y: 3 }), { x: 2, y: 3 });
  assert.deepEqual(selection.toggleGridSpot({ x: 2, y: 3 }), null);
  assert.deepEqual(selection.toggleGridSpot({ x: 4, y: 5 }), { x: 4, y: 5 });
  assert.equal(selection.toggleGridSpot({ x: -1, y: 5 }), null);
});
