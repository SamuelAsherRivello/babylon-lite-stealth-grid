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

test("perception target state distinguishes default from hidden", () => {
  assert.equal(PerceptionTargetState.Default, "default");
  assert.equal(PerceptionTargetState.Hidden, "hidden");
});
