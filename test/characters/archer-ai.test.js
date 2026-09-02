import test from "node:test";
import assert from "node:assert/strict";
import { ARCHER_ATTACK_RANGE, ARCHER_FACING_RANGE, chooseArcherAction } from "../../src/characters/enemies/archer/archer-ai.js";

test('stale ranged detection cannot override concealment, but explicit alert tracking can', () => {
  const player = { position: { x: 128, y: 0 }, isAlive: true, detected: true, hidden: true };
  assert.equal(chooseArcherAction({ x: 0, y: 0 }, player).state, 'ready');
  assert.equal(chooseArcherAction({ x: 0, y: 0 }, { ...player, targetable: true }).state, 'shooting');
  assert.equal(chooseArcherAction({ x: 0, y: 0 }, { ...player, targetable: false }).state, 'ready');
});

test("archer uses total 2D distance and starts a nearby shot", () => {
  const position = { x: 0, y: 0 };
  const player = { position: { x: 3 * 64, y: Math.sqrt(7) * 64 }, isAlive: true, detected: true };
  assert.ok(ARCHER_ATTACK_RANGE ** 2 >= (player.position.x ** 2 + player.position.y ** 2));
  assert.equal(chooseArcherAction(position, player).state, "shooting");
});

test("archer faces within five units but retains direction outside it", () => {
  const player = { position: { x: ARCHER_FACING_RANGE, y: 0 }, isAlive: true, detected: true };
  assert.equal(chooseArcherAction({ x: 0, y: 0 }, player).facing, 1);
  assert.equal(chooseArcherAction({ x: 0, y: 0 }, { position: { x: ARCHER_FACING_RANGE + 1, y: 0 }, isAlive: true, detected: true }).facing, 0);
});

test("archer neither faces nor shoots an undetected player", () => {
  const player = { position: { x: 2 * 64, y: 0 }, isAlive: true, detected: false };
  const action = chooseArcherAction({ x: 0, y: 0 }, player);
  assert.equal(action.state, "ready");
  assert.equal(action.facing, 0);
  assert.equal(action.target, null);
});

test("archer shoots a player only after perception marks that player detected", () => {
  const player = { position: { x: 2 * 64, y: 0 }, isAlive: true, detected: true };
  assert.equal(chooseArcherAction({ x: 0, y: 0 }, player).state, "shooting");
});
