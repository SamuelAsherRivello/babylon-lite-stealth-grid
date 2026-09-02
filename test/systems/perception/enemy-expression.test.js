import test from "node:test";
import assert from "node:assert/strict";
import { getEnemyExpression } from "../../../src/systems/perception/enemy-expression.js";

test("enemy expressions map each perception state to one icon and flash", () => {
  assert.deepEqual(getEnemyExpression("NONE"), { icon: null, flash: null });
  assert.deepEqual(getEnemyExpression("SUSPICIOUS"), { icon: "?", flash: "white" });
  assert.deepEqual(getEnemyExpression("INVESTIGATING"), { icon: "i", flash: "yellow" });
  assert.deepEqual(getEnemyExpression("ALERT"), { icon: "!", flash: "red" });
});
