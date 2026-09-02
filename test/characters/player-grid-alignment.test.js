import test from "node:test";
import assert from "node:assert/strict";

import { createGridAlignedMovementController } from "../../src/gameplay/game-logic.js";

const CHARACTER = {
  frame: { width: 0, height: 0 },
  pivot: { x: 0, y: 0 },
  collider: { type: "circle", x: 0, y: 0, radius: 1 },
};
const BOUNDS = { width: 192, height: 192 };

function createController() {
  return createGridAlignedMovementController(CHARACTER, 64);
}

test("vertical movement reaches its column center in 0.2 seconds", () => {
  const controller = createController();
  const first = controller.move(
    { x: 10, y: 10 },
    { x: 0, y: 1 },
    21,
    0.1,
    BOUNDS,
    [],
  );
  const second = controller.move(first, { x: 0, y: 1 }, 21, 0.1, BOUNDS, []);

  assert.deepEqual(first, { x: 21, y: 31 });
  assert.deepEqual(second, { x: 32, y: 52 });
});

test("enemy cardinal movement uses the same one-axis quantization contract", () => {
  const controller = createController();
  const vertical = controller.move({ x: 10, y: 10 }, { x: 0, y: 1 }, 21, 0.1, BOUNDS, []);
  assert.equal(vertical.x, 21);
  const horizontal = controller.move(vertical, { x: 1, y: 0 }, 21, 0.1, BOUNDS, []);
  assert.equal(horizontal.y, 31.5);
  assert.equal(horizontal.x, 42);
});

test("horizontal movement reaches its row center without changing requested travel", () => {
  const controller = createController();
  const result = controller.move(
    { x: 70, y: 74 },
    { x: -1, y: 0 },
    21,
    0.2,
    BOUNDS,
    [],
  );

  assert.deepEqual(result, { x: 49, y: 96 });
});

test("already-centered cardinal movement has no orthogonal displacement", () => {
  const controller = createController();
  assert.deepEqual(
    controller.move({ x: 32, y: 32 }, { x: 0, y: 1 }, 10, 0.1, BOUNDS, []),
    { x: 32, y: 42 },
  );
});

test("zero, diagonal, and axis-changing input cancel or replace correction immediately", () => {
  const controller = createController();
  const cardinal = controller.move(
    { x: 10, y: 10 },
    { x: 0, y: 1 },
    10,
    0.05,
    BOUNDS,
    [],
  );
  const stopped = controller.move(cardinal, { x: 0, y: 0 }, 10, 0.05, BOUNDS, []);
  const diagonal = controller.move(stopped, { x: 1, y: 1 }, 10, 0.05, BOUNDS, []);
  const horizontal = controller.move(diagonal, { x: 1, y: 0 }, 10, 0.2, BOUNDS, []);

  assert.deepEqual(cardinal, { x: 15.5, y: 20 });
  assert.deepEqual(stopped, cardinal);
  assert.deepEqual(diagonal, { x: 25.5, y: 30 });
  assert.deepEqual(horizontal, { x: 35.5, y: 32 });
});

test("near-cardinal noise is replaced by correction while an intentional diagonal is not", () => {
  const controller = createController();
  const assisted = controller.move(
    { x: 10, y: 10 },
    { x: 0.05, y: 0.5 },
    20,
    0.1,
    BOUNDS,
    [],
  );
  controller.reset();
  const diagonal = controller.move(
    { x: 10, y: 10 },
    { x: 0.051, y: 0.5 },
    20,
    0.1,
    BOUNDS,
    [],
  );

  assert.deepEqual(assisted, { x: 21, y: 20 });
  assert.deepEqual(diagonal, { x: 11.02, y: 20 });
});

test("blocked correction preserves main-axis travel and retries when clear", () => {
  const controller = createController();
  const blocker = { x: 20, y: 0, width: 4, height: 192 };
  const blocked = controller.move(
    { x: 10, y: 10 },
    { x: 0, y: 1 },
    20,
    0.1,
    BOUNDS,
    [blocker],
  );
  const clear = controller.move(blocked, { x: 0, y: 1 }, 20, 0.1, BOUNDS, []);

  assert.deepEqual(blocked, { x: 10, y: 30 });
  assert.deepEqual(clear, { x: 21, y: 50 });
});

test("alignment preserves dynamic collider blocking beyond playfield bounds", () => {
  const controller = createController();
  const bounded = controller.move(
    { x: 1, y: 32 },
    { x: 0, y: 1 },
    20,
    0.2,
    { width: 20, height: 192 },
    [],
  );
  controller.reset();
  const dynamicBlocked = controller.move(
    { x: 10, y: 10 },
    { x: 0, y: 1 },
    20,
    0.1,
    BOUNDS,
    [{ type: "circle", x: 21, y: 30, radius: 2 }],
  );

  assert.deepEqual(bounded, { x: 32, y: 52 });
  assert.deepEqual(dynamicBlocked, { x: 10, y: 30 });
});

test("reset suspends an old correction and fresh input targets the post-knockback cell", () => {
  const controller = createController();
  controller.move({ x: 10, y: 10 }, { x: 0, y: 1 }, 10, 0.05, BOUNDS, []);
  controller.reset();
  const afterKnockback = controller.move(
    { x: 70, y: 20 },
    { x: 0, y: 1 },
    10,
    0.2,
    BOUNDS,
    [],
  );

  assert.deepEqual(afterKnockback, { x: 96, y: 30 });
});
