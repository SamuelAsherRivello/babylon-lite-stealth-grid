import test from "node:test";
import assert from "node:assert/strict";

import {
  EnemyState,
  createEnemyStateMachine,
} from "../src/enemies/enemy-state.js";
import {
  selectGoblinAttackAnimation,
} from "../src/enemies/goblin/goblin-state.js";

test("enemy transitions between idle and walking from movement intent", () => {
  const machine = createEnemyStateMachine();

  assert.equal(machine.state, EnemyState.IDLE);
  assert.deepEqual(machine.updateLocomotion({ x: 1, y: 0 }), {
    changed: true,
    state: EnemyState.WALKING,
  });
  assert.deepEqual(machine.updateLocomotion({ x: 0, y: 0 }), {
    changed: true,
    state: EnemyState.IDLE,
  });
});

test("enemy attack locks movement, rejects re-entry, and recovers", () => {
  const machine = createEnemyStateMachine();

  assert.deepEqual(machine.startAttack(), {
    changed: true,
    state: EnemyState.ATTACKING,
  });
  assert.equal(machine.movementLocked, true);
  assert.deepEqual(machine.startAttack(), {
    changed: false,
    state: EnemyState.ATTACKING,
  });
  assert.deepEqual(machine.updateLocomotion({ x: 1, y: 0 }), {
    changed: false,
    state: EnemyState.ATTACKING,
  });
  assert.deepEqual(machine.completeAttack({ x: 0, y: -1 }), {
    changed: true,
    state: EnemyState.WALKING,
  });
});

test("goblin chooses vertical attacks by dominant axis", () => {
  assert.deepEqual(selectGoblinAttackAnimation({ x: 1, y: 2 }), {
    name: "attack-up",
    flipX: false,
    facing: 1,
  });
  assert.deepEqual(selectGoblinAttackAnimation({ x: 1, y: -2 }), {
    name: "attack-down",
    flipX: false,
    facing: 1,
  });
});

test("goblin mirrors horizontal attacks and preserves neutral facing", () => {
  assert.deepEqual(selectGoblinAttackAnimation({ x: -2, y: 1 }), {
    name: "attack-right",
    flipX: true,
    facing: -1,
  });
  assert.deepEqual(selectGoblinAttackAnimation({ x: 0, y: 0 }, -1), {
    name: "attack-right",
    flipX: true,
    facing: -1,
  });
});
