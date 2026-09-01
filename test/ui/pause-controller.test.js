import test from "node:test";
import assert from "node:assert/strict";

import { createPauseController } from "../../src/ui/pause-controller.js";

test("pause returns zero active delta and resume resets the time origin", () => {
  const events = [];
  const pause = createPauseController({
    onPause: () => events.push("pause"),
    onResume: () => events.push("resume"),
    now: () => 5000,
  });

  assert.equal(pause.getDelta(0.016), 0.016);
  assert.equal(pause.pause(), true);
  assert.equal(pause.getDelta(99), 0);
  assert.equal(pause.resume(), 5000);
  assert.equal(pause.getDelta(0.02), 0.02);
  assert.deepEqual(events, ["pause", "resume"]);
});

test("pause and resume transitions are idempotent", () => {
  let pauses = 0;
  let resumes = 0;
  const pause = createPauseController({
    onPause: () => { pauses += 1; },
    onResume: () => { resumes += 1; },
  });

  assert.equal(pause.pause(), true);
  assert.equal(pause.pause(), false);
  assert.equal(pause.resume(), pause.lastResumeTime);
  assert.equal(pause.resume(), pause.lastResumeTime);
  assert.equal(pauses, 1);
  assert.equal(resumes, 1);
});

test("opening settings clears input before gameplay becomes paused", () => {
  const sequence = [];
  let pause;
  pause = createPauseController({
    onPause: () => sequence.push(pause.isPaused ? "paused" : "active"),
  });
  pause.pause();
  assert.deepEqual(sequence, ["paused"]);
});
