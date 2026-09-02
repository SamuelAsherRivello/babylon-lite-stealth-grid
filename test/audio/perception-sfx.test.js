import test from "node:test";
import assert from "node:assert/strict";
import { createEnemyPerceptionReaction } from "../../src/systems/perception/enemy-perception-reaction.js";
import { playPerceptionSfx } from "../../src/audio/sfx.js";

test("perception sounds play on state entry at ascending pitches, not repeated detections", () => {
  const calls = [];
  const reaction = createEnemyPerceptionReaction({ random: () => 0,
    onStateChange: state => playPerceptionSfx(state, (name, options) => {
      assert.equal(options.volume, 0.2);
      calls.push([name, options.pitch]);
    }) });
  for (const strength of [0.25, 0.25, 0.5, 0.5, 1, 1]) {
    reaction.acceptDetection({ type: "visual", strength, cell: { x: 2, y: 3 } });
  }
  assert.deepEqual(calls, [["alert", 0.65], ["alert", 0.82], ["alert", 1]]);
  reaction.update(3);
  reaction.update(8);
  reaction.update(1);
  assert.deepEqual(calls.slice(3), [["alert", 0.82], ["alert", 0.65]]);
  assert.equal(reaction.getSnapshot().state, "NONE");
});
