import test from "node:test";
import assert from "node:assert/strict";
import { getPlayerHidingBush, isPlayerHidden, stepHiddenOpacity, canEnemyTargetPlayer, getOccupiedBushBlockers } from "../../../src/systems/perception/player-hidden.js";
import { createEnemyPerceptionReaction } from '../../../src/systems/perception/enemy-perception-reaction.js';
import { PerceptionTargetState } from "../../../src/systems/perception/character-perception.js";

const bush = (collider, isAlive = true) => ({ isAlive, getCombatCollider: () => collider });

test('occupied bush blockers include partial overlaps, exclude empty and dead bushes, and expire on exit', () => {
  const player = { x: 122, y: 90, width: 16, height: 16 };
  const bushes = [
    { ...bush({ x: 128, y: 64, width: 64, height: 64 }), id: 'occupied', cell: { x: 2, y: 1 } },
    { ...bush({ x: 192, y: 64, width: 64, height: 64 }), id: 'empty', cell: { x: 3, y: 1 } },
    { ...bush(player, false), id: 'dead', cell: { x: 1, y: 1 } },
  ];
  const blocked = getOccupiedBushBlockers(player, bushes, 64);
  assert.deepEqual(blocked.map(value => value.id), ['occupied']);
  assert.deepEqual(blocked[0].collider, { x: 128, y: 64, width: 64, height: 64 });
  assert.deepEqual(getOccupiedBushBlockers(player, bushes, 64, true), []);
  assert.deepEqual(getOccupiedBushBlockers({ ...player, x: 0 }, bushes, 64), []);
  assert.deepEqual(getOccupiedBushBlockers(null, bushes, 64), []);
});

test('hidden tracking belongs only to the enemy with visual confirmation and survives pause, not expiry', () => {
  const a = createEnemyPerceptionReaction({ random: () => 0 });
  const b = createEnemyPerceptionReaction({ profile: { audioCanAlert: true }, random: () => 0 });
  const player = { hidden: true, isAlive: true };
  a.acceptDetection({ type: 'visual', strength: 1, cell: { x: 2, y: 1 } });
  b.acceptDetection({ type: 'audio', strength: 1, cell: { x: 2, y: 1 } });
  assert.equal(canEnemyTargetPlayer(player, a), true);
  assert.equal(canEnemyTargetPlayer(player, b), false);
  a.update(0);
  assert.equal(a.getSnapshot().remainingSeconds, 3);
  a.update(3);
  assert.equal(canEnemyTargetPlayer(player, a), false);
  assert.equal(canEnemyTargetPlayer({ ...player, hidden: false }, a), true);
  a.acceptDetection({ type: 'visual', strength: 1, cell: { x: 3, y: 1 } });
  assert.equal(canEnemyTargetPlayer(player, a), true);
  a.reset();
  assert.equal(canEnemyTargetPlayer(player, a), false);
});

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
