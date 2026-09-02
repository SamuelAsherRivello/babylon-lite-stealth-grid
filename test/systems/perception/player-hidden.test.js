import test from "node:test";
import assert from "node:assert/strict";
import { getPlayerHidingBush, isPlayerHidden, stepHiddenOpacity } from "../../../src/systems/perception/player-hidden.js";
import { PerceptionTargetState } from "../../../src/systems/perception/character-perception.js";

const bush = (collider, isAlive = true) => ({ isAlive, getCombatCollider: () => collider });

test("player hiding uses living bush combat-collider overlap and any overlapping bush", () => {
  const player = { x: 10, y: 10, width: 10, height: 10 };
  assert.equal(isPlayerHidden(player, [bush({ x: 100, y: 100, width: 10, height: 10 }), bush({ x: 12, y: 12, width: 10, height: 10 })]), true);
  assert.equal(isPlayerHidden(player, [bush({ x: 12, y: 12, width: 10, height: 10 }, false)]), false);
});

test("player hiding identifies the living overlapping bush for render depth", () => {
  const player = { x: 10, y: 10, width: 10, height: 10 };
  const hidingBush = bush({ x: 12, y: 12, width: 10, height: 10 });
  assert.equal(getPlayerHidingBush(player, [bush({ x: 100, y: 100, width: 10, height: 10 }), hidingBush]), hidingBush);
  assert.equal(getPlayerHidingBush(player, [bush({ x: 12, y: 12, width: 10, height: 10 }, false)]), null);
});

test("hidden opacity animates from one to point six over 0.2 seconds in both directions", () => {
  assert.ok(Math.abs(stepHiddenOpacity(1, true, 0.1, 0.2) - 0.8) < 1e-9);
  assert.ok(Math.abs(stepHiddenOpacity(1, true, 0.2, 0.2) - 0.6) < 1e-9);
  assert.ok(Math.abs(stepHiddenOpacity(0.6, false, 0.1, 0.2) - 0.8) < 1e-9);
  assert.equal(stepHiddenOpacity(0.6, false, 0.2, 0.2), 1);
});

test("bush depth selection requires overlap and the same grid cell", () => {
  const player = { x: 60, y: 60, width: 16, height: 16 };
  const cell = { x: 1, y: 1 };
  const adjacent = { ...bush(player), cell: { x: 0, y: 1 } };
  const adjacentRow = { ...bush(player), cell: { x: 1, y: 0 } };
  const sameCell = { ...bush(player), cell };
  const separated = { ...bush({ x: 90, y: 90, width: 8, height: 8 }), cell };
  assert.equal(getPlayerHidingBush(player, [adjacent], cell), null);
  assert.equal(getPlayerHidingBush(player, [adjacentRow], cell), null);
  assert.equal(getPlayerHidingBush(player, [separated], cell), null);
  assert.equal(getPlayerHidingBush(player, [adjacent, sameCell], cell), sameCell);
  assert.equal(getPlayerHidingBush(player, [{ ...sameCell, isAlive: false }], cell), null);
  assert.equal(getPlayerHidingBush(player, [bush(player)], cell), null);
  assert.equal(isPlayerHidden(player, [adjacent]), true);
});

test("perception target state distinguishes default from hidden", () => {
  assert.equal(PerceptionTargetState.Default, "default");
  assert.equal(PerceptionTargetState.Hidden, "hidden");
});
