import assert from "node:assert/strict";
import test from "node:test";
import { gridCellToWorldCenter } from "../../src/gameplay/world-viewport.js";

test("grid cell center uses logical tile coordinates", () => {
  assert.deepEqual(gridCellToWorldCenter({ x: 2, y: 5 }, 64), { x: 160, y: 352 });
});
