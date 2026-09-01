import assert from "node:assert/strict";
import test from "node:test";

import {
  createCharacterDefinition,
  getCharacterArtTransform,
  getCharacterCombatCollider,
  getCharacterMovementCollider,
  getGridCellCenter,
} from "../../src/characters/character-contract.js";

const definition = createCharacterDefinition({
  id: "goblin",
  frame: { width: 192, height: 192 },
  movementCollider: { radius: 24 },
});

test("movement collider is centered on the logical grid-center position", () => {
  const position = getGridCellCenter({ x: 1, y: 1 }, 64);
  assert.deepEqual(position, { x: 96, y: 96 });
  assert.deepEqual(getCharacterMovementCollider(position, definition), {
    type: "circle", x: 96, y: 96, radius: 24,
  });
});

test("combat collider is one grid cell centered on the logical position", () => {
  assert.deepEqual(getCharacterCombatCollider({ x: 96, y: 96 }, 64), {
    x: 64, y: 64, width: 64, height: 64,
  });
});

test("default art transform bottom-aligns artwork to the occupied cell", () => {
  const transform = getCharacterArtTransform({ x: 96, y: 96 }, definition, 1024);
  assert.deepEqual(transform.positionPx, [96, 928]);
  assert.deepEqual(transform.sizePx, [192, 192]);
  assert.deepEqual(transform.pivot, [0.5, 5 / 6]);
});

test("art offset changes visuals without changing logical collider geometry", () => {
  const offsetDefinition = createCharacterDefinition({
    id: "offset", frame: { width: 192, height: 192 },
    artOffset: { x: 4, y: -8 }, movementCollider: { radius: 18 },
  });
  assert.deepEqual(getCharacterArtTransform({ x: 96, y: 96 }, offsetDefinition, 1024).positionPx, [100, 920]);
  assert.deepEqual(getCharacterMovementCollider({ x: 96, y: 96 }, offsetDefinition), { type: "circle", x: 96, y: 96, radius: 18 });
});

test("invalid movement geometry is rejected", () => {
  assert.throws(() => createCharacterDefinition({
    id: "invalid", frame: { width: 192, height: 192 }, movementCollider: { radius: 0 },
  }), /radius must be positive/);
});
