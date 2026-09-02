import test from "node:test";
import assert from "node:assert/strict";
import { createCharacterLockupWatchdog } from "../../src/gameplay/character-lockup-watchdog.js";
import { separateOverlappingCharacterColliders } from "../../src/gameplay/game-logic.js";

function record(label, x) {
  const intents = [];
  return { combat: { label, isAlive: true }, actor: {
    intents,
    getPosition: () => ({ x, y: 100 }),
    getMovementCollider: () => ({ type: "circle", x, y: 100, radius: 24 }),
    setMovementIntent: (intent) => intents.push(intent),
  } };
}

test("watchdog detects stalled overlapping enemies and commands separation", () => {
  const first = record("enemy-a", 100);
  const second = record("enemy-b", 110);
  const watchdog = createCharacterLockupWatchdog({ stallSeconds: 0.2 });
  assert.equal(watchdog.inspect([first, second], 0.1), null);
  const result = watchdog.inspect([first, second], 0.1);
  assert.deepEqual(result.labels, ["enemy-a", "enemy-b"]);
  assert.deepEqual(result.direction, { x: -1, y: 0 });
});

test("two converging enemy movement colliders stay separated across repeated frames", () => {
  const positions = [{ x: 100, y: 100 }, { x: 180, y: 100 }];
  const records = positions.map((position) => ({
    combat: { isAlive: true },
    actor: {
      getPosition: () => position,
      getMovementCollider: () => ({ type: "circle", x: position.x, y: position.y, radius: 24 }),
      setPosition: (next) => Object.assign(position, next),
    },
  }));
  for (let frame = 0; frame < 30; frame += 1) {
    positions[0].x += 3;
    positions[1].x -= 3;
    separateOverlappingCharacterColliders(records);
    assert.ok(Math.hypot(positions[0].x - positions[1].x, positions[0].y - positions[1].y) >= 48);
  }
  assert.ok(positions[0].x < positions[1].x);
});
