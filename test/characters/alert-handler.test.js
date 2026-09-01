import test from "node:test";
import assert from "node:assert/strict";
import { createAlertHandler } from "../../src/characters/enemies/alert-handler.js";

test("alert handler accepts first event only and recovers", () => {
  const calls = [];
  const handler = createAlertHandler({ random: () => 0.5, alertSeconds: 1, cooldownSeconds: 1, onWalk: (cell) => calls.push(["walk", cell]), onComplete: () => calls.push(["complete"]) });
  assert.equal(handler.accept({ strength: 1, cell: { x: 2, y: 3 } }, "patrol"), true);
  assert.equal(handler.accept({ strength: 1, cell: { x: 9, y: 9 } }), false);
  handler.update(2);
  assert.deepEqual(calls, [["walk", { x: 2, y: 3 }], ["complete"]]);
});

test("alert responses cover 75 percent half-strength, weak face, and failed half-strength", () => {
  const calls = [];
  const make = (random) => createAlertHandler({ random, onWalk: () => calls.push("walk"), onFace: () => calls.push("face"), onStop: () => calls.push("stop") });
  make(() => 0.7).accept({ strength: 0.5, cell: { x: 0, y: 0 } });
  make(() => 0.8).accept({ strength: 0.5, cell: { x: 0, y: 0 } });
  make(() => 0.1).accept({ strength: 0.25, cell: { x: 0, y: 0 } });
  assert.deepEqual(calls, ["walk", "stop", "stop", "face"]);
});
