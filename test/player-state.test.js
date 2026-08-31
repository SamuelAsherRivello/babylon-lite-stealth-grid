import test from "node:test";
import assert from "node:assert/strict";

import {
  PlayerState,
  createPlayerStateMachine,
} from "../src/player-state.js";

test("PlayerState machine starts idle and transitions only when state changes", () => {
  const machine = createPlayerStateMachine();

  assert.equal(machine.state, PlayerState.IDLE);
  assert.deepEqual(machine.updateLocomotion({ x: 0, y: 0 }), {
    changed: false,
    state: PlayerState.IDLE,
  });
  assert.deepEqual(machine.updateLocomotion({ x: 0, y: 1 }), {
    changed: true,
    state: PlayerState.RUNNING,
  });
});

test("PlayerState shooting overrides locomotion until the sequence completes", () => {
  const machine = createPlayerStateMachine();
  machine.updateLocomotion({ x: -1, y: 0 });

  assert.equal(machine.facing, -1);
  assert.deepEqual(machine.startShooting(), {
    changed: true,
    state: PlayerState.SHOOTING,
  });
  assert.deepEqual(machine.startShooting(), {
    changed: false,
    state: PlayerState.SHOOTING,
  });
  assert.deepEqual(machine.updateLocomotion({ x: 1, y: 0 }), {
    changed: false,
    state: PlayerState.SHOOTING,
  });
  assert.equal(machine.facing, -1);

  assert.deepEqual(machine.completeShooting({ x: 1, y: 0 }), {
    changed: true,
    state: PlayerState.RUNNING,
  });
  assert.equal(machine.facing, 1);
});

test("PlayerState machine releases one shot at the configured frame", () => {
  const machine = createPlayerStateMachine();
  machine.startShooting();

  assert.equal(machine.releaseShot(4), false);
  assert.equal(machine.releaseShot(5), true);
  assert.equal(machine.releaseShot(6), false);
});
