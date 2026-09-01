import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_WARRIOR_DEFENSE_CONFIG,
  createWarriorDefenseConfig,
  selectIncomingProjectile,
} from "../../src/characters/enemies/warrior/warrior-defense.js";

const warriorCollider = { x: 280, y: 280, width: 64, height: 96 };

function arrow(id, x, y, direction) {
  return {
    id,
    direction,
    collider: { x, y, width: 72, height: 20 },
  };
}

test("warrior defense defaults keep reaction timing and duration configurable", () => {
  assert.deepEqual(DEFAULT_WARRIOR_DEFENSE_CONFIG, {
    reactionLookaheadSeconds: 0.4,
    defenseDurationSeconds: 0.25,
  });
  assert.deepEqual(createWarriorDefenseConfig({
    reactionLookaheadSeconds: -1,
    defenseDurationSeconds: 0.5,
  }), {
    reactionLookaheadSeconds: 0,
    defenseDurationSeconds: 0.5,
  });
});

test("only a swept arrow trajectory that reaches the Warrior is eligible", () => {
  const attempted = new Set();
  const toward = arrow(1, 40, 310, { x: 1, y: 0 });
  const away = arrow(2, 200, 310, { x: -1, y: 0 });
  const passing = arrow(3, 40, 100, { x: 1, y: 0 });

  assert.equal(selectIncomingProjectile(
    [away, passing, toward], warriorCollider,
    -1, DEFAULT_WARRIOR_DEFENSE_CONFIG, attempted,
  )?.id, 1);
  assert.deepEqual([...attempted], [1]);
});

test("front-facing arrows always defend and rear arrows always pass through", () => {
  const attempted = new Set();
  const fromLeft = arrow(7, 40, 310, { x: 1, y: 0 });
  const fromRight = arrow(8, 500, 310, { x: -1, y: 0 });

  assert.equal(selectIncomingProjectile(
    [fromLeft], warriorCollider, -1, DEFAULT_WARRIOR_DEFENSE_CONFIG, attempted,
  )?.id, 7);
  assert.equal(selectIncomingProjectile(
    [fromRight], warriorCollider, -1, DEFAULT_WARRIOR_DEFENSE_CONFIG, attempted,
  ), null);

  assert.equal(selectIncomingProjectile(
    [fromRight], warriorCollider, 1, DEFAULT_WARRIOR_DEFENSE_CONFIG, new Set(),
  )?.id, 8);
});

test("vertical arrows cannot be front-facing for a horizontally facing Warrior", () => {
  const vertical = arrow(9, 300, 80, { x: 0, y: 1 });
  vertical.collider = { x: 300, y: 80, width: 20, height: 72 };

  assert.equal(selectIncomingProjectile(
    [vertical], warriorCollider, 1, DEFAULT_WARRIOR_DEFENSE_CONFIG, new Set(),
  ), null);
});
