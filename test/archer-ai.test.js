import test from "node:test";
import assert from "node:assert/strict";
import { ARCHER_ATTACK_RANGE, ARCHER_FACING_RANGE, chooseArcherAction } from "../src/characters/enemies/archer/archer-ai.js";

test("archer uses total 2D distance and starts a nearby shot", () => {
  const position = { x: 0, y: 0 };
  const player = { position: { x: 3 * 64, y: Math.sqrt(7) * 64 }, isAlive: true };
  assert.ok(ARCHER_ATTACK_RANGE ** 2 >= (player.position.x ** 2 + player.position.y ** 2));
  assert.equal(chooseArcherAction(position, player).state, "shooting");
});

test("archer faces within five units but retains direction outside it", () => {
  const player = { position: { x: ARCHER_FACING_RANGE, y: 0 }, isAlive: true };
  assert.equal(chooseArcherAction({ x: 0, y: 0 }, player).facing, 1);
  assert.equal(chooseArcherAction({ x: 0, y: 0 }, { position: { x: ARCHER_FACING_RANGE + 1, y: 0 }, isAlive: true }).facing, 0);
});
