import test from "node:test";
import assert from "node:assert/strict";
import { createCharacterLockupWatchdog } from "../../src/gameplay/character-lockup-watchdog.js";

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
  assert.deepEqual(first.actor.intents.at(-1), { x: -1, y: 0 });
  assert.deepEqual(second.actor.intents.at(-1), { x: 0, y: 0 });
});
