import test from "node:test";
import assert from "node:assert/strict";

import {
  WarriorState,
  createWarriorStateMachine,
  selectWarriorAction,
} from "../../src/characters/enemies/warrior/warrior-state.js";

test("warrior transitions between locomotion and guard", () => {
  const machine = createWarriorStateMachine();
  assert.equal(machine.state, WarriorState.IDLE);
  assert.equal(machine.updateLocomotion({ x: 1, y: 0 }).state, "walking");
  assert.equal(machine.setGuarding(true).state, "guard");
  assert.equal(machine.movementLocked, true);
  assert.equal(machine.setGuarding(false, { x: 1, y: 0 }).state, "walking");
});

test("warrior attacks are distinct, atomic, and recover locomotion", () => {
  const machine = createWarriorStateMachine();
  assert.equal(machine.startAttack("attack-2").state, "attack-2");
  assert.equal(machine.startAttack("attack-1").changed, false);
  assert.equal(machine.movementLocked, true);
  assert.equal(machine.completeAttack({ x: 0, y: 0 }).state, "idle");
});

test("warrior actions preserve or update horizontal facing", () => {
  assert.deepEqual(selectWarriorAction("attack-1", { x: -1, y: 2 }), {
    name: "attack-1",
    facing: -1,
    flipX: true,
  });
  assert.deepEqual(selectWarriorAction("guard", { x: 0, y: 1 }, -1), {
    name: "guard",
    facing: -1,
    flipX: true,
  });
});
