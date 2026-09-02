import test from "node:test";
import assert from "node:assert/strict";
import { createEnemyPatrolController } from "../../src/characters/enemies/enemy-patrol-controller.js";

function fakeActor() {
  const intents = [];
  let position = { x: 0, y: 0 };
  return {
    intents,
    getPosition() { return { ...position }; },
    moveTo(nextPosition) { position = { ...nextPosition }; },
    setMovementIntent(intent) { intents.push({ ...intent }); },
  };
}

test("enemy patrol controller holds a random idle, then a random patrol", () => {
  const actor = fakeActor();
  const controller = createEnemyPatrolController(actor, {
    random: () => 0.5,
    idleRange: [2, 4],
    patrolRange: [3, 5],
  });

  assert.equal(controller.mode, "idle");
  assert.deepEqual(actor.intents.at(-1), { x: 0, y: 0 });
  controller.update(3);
  assert.equal(controller.mode, "patrolling");
  assert.notDeepEqual(actor.intents.at(-1), { x: 0, y: 0 });
  controller.update(4);
  assert.equal(controller.mode, "idle");
  assert.deepEqual(actor.intents.at(-1), { x: 0, y: 0 });
});

test("enemy patrol controller clamps invalid random values and supports configured directions", () => {
  const actor = fakeActor();
  const controller = createEnemyPatrolController(actor, {
    random: () => 2,
    idleRange: [1, 1],
    patrolRange: [1, 1],
    directions: [{ x: 0, y: -1 }],
  });
  controller.update(1);
  assert.deepEqual(actor.intents.at(-1), { x: 0, y: -1 });
});

test("enemy patrol controller chooses a different direction after movement is blocked", () => {
  const actor = fakeActor();
  const controller = createEnemyPatrolController(actor, {
    random: () => 0,
    idleRange: [0, 0],
    patrolRange: [10, 10],
    directions: [{ x: 1, y: 0 }, { x: 0, y: 1 }],
  });

  controller.update(0);
  assert.deepEqual(actor.intents.at(-1), { x: 1, y: 0 });
  controller.update(0.016);
  assert.deepEqual(actor.intents.at(-1), { x: 0, y: 1 });
});
