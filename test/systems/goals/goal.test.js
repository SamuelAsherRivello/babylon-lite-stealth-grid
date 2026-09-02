import test from "node:test";
import assert from "node:assert/strict";
import { createGoal } from "../../../src/systems/goals/goal.js";
import { collidersOverlap } from "../../../src/gameplay/game-logic.js";
import { GRID } from "../../../src/systems/environment/grid-contract.js";

test("goal completion requires overlap with the centered inner half of its cell", () => {
  const documentRef = {
    createElement: () => ({ style: {}, setAttribute() {}, append() {}, remove() {} }),
  };
  const size = GRID.tileSizePx;
  const position = { x: size * 2.5, y: size * 3.5 };
  const goal = createGoal({ host: { append() {} }, position,
    screenWidth: GRID.widthPx, screenHeight: GRID.heightPx, documentRef });

  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const outerContact = { x: position.x + dx * size * 0.4 - 1,
      y: position.y + dy * size * 0.4 - 1, width: 2, height: 2 };
    assert.equal(collidersOverlap(outerContact, goal.combatCollider), false,
      `outer cell contact (${dx}, ${dy}) must not complete the level`);
  }
  assert.deepEqual(goal.combatCollider, {
    x: position.x - size * 0.25, y: position.y - size * 0.25,
    width: size * 0.5, height: size * 0.5,
  });
  assert.equal(collidersOverlap({ x: position.x - 1, y: position.y - 1,
    width: 2, height: 2 }, goal.combatCollider), true);
});
