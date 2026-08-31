import test from "node:test";
import assert from "node:assert/strict";

import {
  CardinalDirection,
  createCardinalDirectionMemory,
  getCardinalDirectionForCode,
  isCardinalDirection,
  resolveCardinalDirection,
} from "../src/cardinal-direction.js";

test("cardinal direction defaults right and remembers every direction", () => {
  assert.deepEqual(resolveCardinalDirection({ x: 0, y: 0 }), { x: 1, y: 0 });
  for (const direction of Object.values(CardinalDirection)) {
    assert.deepEqual(resolveCardinalDirection({ x: 0, y: 0 }, direction), direction);
    assert.equal(isCardinalDirection(direction), true);
  }
});

test("direction memory records actual taps but ignores repeats and releases", () => {
  const memory = createCardinalDirectionMemory();
  assert.deepEqual(memory.rememberCode("ArrowUp"), CardinalDirection.UP);
  assert.deepEqual(memory.rememberCode("ArrowLeft", true), CardinalDirection.UP);
  assert.deepEqual(memory.rememberMovement({ x: 0, y: 0 }), CardinalDirection.UP);
  assert.deepEqual(memory.resolve({ x: 0, y: 0 }), CardinalDirection.UP);
});

test("direction memory follows dominant virtual movement and retains it through reset", () => {
  const memory = createCardinalDirectionMemory(CardinalDirection.LEFT);
  assert.deepEqual(memory.rememberMovement({ x: 0.2, y: -0.8 }), CardinalDirection.DOWN);
  assert.deepEqual(memory.rememberMovement({ x: 0, y: 0 }), CardinalDirection.DOWN);
  assert.deepEqual(memory.resolve({ x: 0, y: 0 }), CardinalDirection.DOWN);
});

test("greatest magnitude chooses one cardinal axis", () => {
  assert.deepEqual(resolveCardinalDirection({ x: -0.8, y: 0.2 }), { x: -1, y: 0 });
  assert.deepEqual(resolveCardinalDirection({ x: 0.2, y: -0.8 }), { x: 0, y: -1 });
});

test("equal magnitudes use the most recent applicable direction", () => {
  assert.deepEqual(
    resolveCardinalDirection({ x: 1, y: 1 }, CardinalDirection.UP),
    CardinalDirection.UP,
  );
  assert.deepEqual(
    resolveCardinalDirection({ x: -1, y: 1 }, CardinalDirection.LEFT),
    CardinalDirection.LEFT,
  );
});

test("opposite inputs resolve to the remembered direction after cancellation", () => {
  assert.deepEqual(
    resolveCardinalDirection({ x: 0, y: 0 }, CardinalDirection.DOWN),
    CardinalDirection.DOWN,
  );
});

test("keyboard and arrow codes map to four cardinal directions", () => {
  assert.deepEqual(getCardinalDirectionForCode("KeyW"), CardinalDirection.UP);
  assert.deepEqual(getCardinalDirectionForCode("ArrowDown"), CardinalDirection.DOWN);
  assert.deepEqual(getCardinalDirectionForCode("KeyA"), CardinalDirection.LEFT);
  assert.deepEqual(getCardinalDirectionForCode("ArrowRight"), CardinalDirection.RIGHT);
  assert.equal(getCardinalDirectionForCode("KeyV"), null);
});

test("resolver never returns a diagonal or fractional direction", () => {
  assert.equal(isCardinalDirection({ x: 0.5, y: 0.5 }), false);
  for (const movement of [
    { x: 0.4, y: 0.9 },
    { x: -1, y: -1 },
    { x: 0, y: 0 },
  ]) {
    const direction = resolveCardinalDirection(movement, CardinalDirection.DOWN);
    assert.equal(isCardinalDirection(direction), true);
  }
});
