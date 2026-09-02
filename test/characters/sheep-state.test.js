import test from "node:test";
import assert from "node:assert/strict";

import {
  CharacterType,
  SheepState,
  chebyshevDistance,
  createFearProfile,
  createSheepStateMachine,
  findNearestThreat,
} from "../../src/characters/npc/sheep/sheep-state.js";

const player = (x, y) => ({ type: CharacterType.PLAYER, cell: { x, y } });
const enemy = (x, y) => ({ type: CharacterType.ENEMY, cell: { x, y } });

test("fear profile validates character types and distance", () => {
  const profile = createFearProfile({
    scareDistanceCells: 3,
    frighteningTypes: [CharacterType.PLAYER, CharacterType.ENEMY],
  });
  assert.equal(profile.scareDistanceCells, 3);
  assert.deepEqual([...profile.frighteningTypes], ["player", "enemy"]);
  assert.throws(() => createFearProfile({ scareDistanceCells: -1 }));
  assert.throws(() => createFearProfile({ frighteningTypes: ["dragon"] }));
});

test("Chebyshev distance includes horizontal, vertical, and diagonal boundaries", () => {
  assert.equal(chebyshevDistance({ x: 2, y: 2 }, { x: 5, y: 2 }), 3);
  assert.equal(chebyshevDistance({ x: 2, y: 2 }, { x: 2, y: 5 }), 3);
  assert.equal(chebyshevDistance({ x: 2, y: 2 }, { x: 5, y: 5 }), 3);
  assert.equal(chebyshevDistance({ x: 2, y: 2 }, { x: 6, y: 5 }), 4);
});

test("nearest threat filters disabled types and keeps stable tie order", () => {
  const profile = createFearProfile({
    scareDistanceCells: 3,
    frighteningTypes: [CharacterType.PLAYER],
  });
  const first = player(3, 1);
  const tied = player(1, 3);
  assert.equal(
    findNearestThreat({ x: 1, y: 1 }, [enemy(1, 1), first, tied], profile),
    first,
  );
  assert.equal(findNearestThreat({ x: 1, y: 1 }, [player(5, 1)], profile), null);
});

test("sheep transitions through post-flee cooldown and retains its threat while running", () => {
  const machine = createSheepStateMachine();
  const threat = player(3, 3);

  assert.equal(machine.state, SheepState.IDLE);
  assert.deepEqual(machine.updateFear({ x: 0, y: 0 }, [threat]), {
    changed: true,
    state: SheepState.BOUNCING,
    threat,
  });
  assert.equal(machine.threat, threat);
  assert.deepEqual(machine.updateFear({ x: 0, y: 0 }, []), {
    changed: false,
    state: SheepState.BOUNCING,
  });
  assert.deepEqual(machine.completeBouncing(true), {
    changed: true,
    state: SheepState.RUNNING,
  });
  assert.deepEqual(machine.completeRunning(), {
    changed: true,
    state: SheepState.COOLDOWN,
  });
  machine.updateCooldown(0.5);
  assert.equal(machine.state, SheepState.COOLDOWN);
  machine.updateCooldown(0.5);
  assert.equal(machine.state, SheepState.IDLE);
  assert.equal(machine.threat, null);
});

test("no-route bounce returns idle and can immediately evaluate fear again", () => {
  const machine = createSheepStateMachine();
  const threat = player(1, 0);
  machine.updateFear({ x: 0, y: 0 }, [threat]);

  assert.deepEqual(machine.completeBouncing(false), {
    changed: true,
    state: SheepState.IDLE,
  });
  assert.equal(
    machine.updateFear({ x: 0, y: 0 }, [threat]).state,
    SheepState.BOUNCING,
  );
});

test("contact bounce cancels threat context and retains separation intent", () => {
  const machine = createSheepStateMachine();
  machine.updateFear({ x: 0, y: 0 }, [player(1, 0)]);

  assert.deepEqual(machine.beginContact({ partnerId: "sheep-2", direction: { x: -1, y: 0 } }), {
    changed: true,
    state: SheepState.BOUNCING,
  });
  assert.equal(machine.threat, null);
  assert.deepEqual(machine.separationIntent, {
    partnerId: "sheep-2",
    direction: { x: -1, y: 0 },
  });
  assert.equal(machine.bounceReason, "contact");
});

test("contact bounce completes into running only when a separation route exists", () => {
  const machine = createSheepStateMachine();
  machine.beginContact({ partnerId: "sheep-2", direction: { x: 1, y: 0 } });
  assert.deepEqual(machine.completeBouncing(true), {
    changed: true,
    state: SheepState.RUNNING,
  });
  machine.completeRunning();
  assert.equal(machine.separationIntent, null);
});
