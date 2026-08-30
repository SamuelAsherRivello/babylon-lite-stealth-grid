import test from "node:test";
import assert from "node:assert/strict";

import {
  getMovementVector,
  moveWithinBounds,
  worldToScreen,
} from "../src/game-logic.js";

test("W and ArrowUp move in positive world Y", () => {
  assert.deepEqual(getMovementVector(new Set(["KeyW"])), { x: 0, y: 1 });
  assert.deepEqual(getMovementVector(new Set(["ArrowUp"])), { x: 0, y: 1 });
});

test("D and ArrowRight move in positive world X", () => {
  assert.deepEqual(getMovementVector(new Set(["KeyD"])), { x: 1, y: 0 });
  assert.deepEqual(getMovementVector(new Set(["ArrowRight"])), { x: 1, y: 0 });
});

test("diagonal movement is normalized", () => {
  const movement = getMovementVector(new Set(["KeyW", "KeyD"]));
  assert.ok(Math.abs(Math.hypot(movement.x, movement.y) - 1) < 1e-10);
  assert.ok(movement.x > 0);
  assert.ok(movement.y > 0);
});

test("quadrant-I world coordinates convert to screen coordinates with Y inverted", () => {
  assert.deepEqual(worldToScreen({ x: 3, y: 2 }, 64, 640), {
    x: 192,
    y: 512,
  });
});

test("movement remains inside positive level bounds", () => {
  assert.deepEqual(
    moveWithinBounds({ x: 0, y: 0 }, { x: -1, y: -1 }, 10, 4, 4),
    { x: 0, y: 0 },
  );
});
