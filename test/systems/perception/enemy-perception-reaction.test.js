import test from "node:test";
import assert from "node:assert/strict";
import { createEnemyPerceptionReaction, PERCEPTION_STATES } from "../../src/systems/perception/enemy-perception-reaction.js";

const cell = (x, y) => ({ x, y });

test("uses discrete thresholds and keeps separate remembered cells", () => {
  const reaction = createEnemyPerceptionReaction({ random: () => 0 });
  assert.equal(reaction.getSnapshot().state, PERCEPTION_STATES.NONE);
  reaction.acceptDetection({ type: "audio", strength: 0.25, cell: cell(1, 2) });
  assert.equal(reaction.getSnapshot().state, PERCEPTION_STATES.SUSPICIOUS);
  assert.deepEqual(reaction.getSnapshot().suspicionCell, cell(1, 2));
  reaction.acceptDetection({ type: "visual", strength: 0.5, cell: cell(2, 2) });
  assert.equal(reaction.getSnapshot().state, PERCEPTION_STATES.INVESTIGATING);
  assert.deepEqual(reaction.getSnapshot().lastKnownCell, cell(2, 2));
  reaction.acceptDetection({ type: "visual", strength: 1, cell: cell(3, 2) });
  assert.equal(reaction.getSnapshot().state, PERCEPTION_STATES.ALERTED);
  assert.deepEqual(reaction.getSnapshot().alertedCell, cell(3, 2));
});

test("audio cannot alert and visual re-detection refreshes alerted cells and duration", () => {
  const reaction = createEnemyPerceptionReaction({ random: () => 1 });
  reaction.acceptDetection({ type: "audio", strength: 1, cell: cell(1, 1) });
  assert.equal(reaction.getSnapshot().state, PERCEPTION_STATES.INVESTIGATING);
  reaction.acceptDetection({ type: "visual", strength: 1, cell: cell(4, 4) });
  reaction.update(4.9);
  reaction.acceptDetection({ type: "visual", strength: 1, cell: cell(5, 4) });
  assert.deepEqual(reaction.getSnapshot().alertedCell, cell(5, 4));
  assert.equal(reaction.getSnapshot().remainingSeconds, 5);
});

test("de-escalates alerted to investigating to suspicious to none", () => {
  const reaction = createEnemyPerceptionReaction({ random: () => 0, profile: {
    alertedDuration: [3, 3], investigationDuration: 2, suspiciousDuration: [1, 1],
  } });
  reaction.acceptDetection({ type: "visual", strength: 1, cell: cell(2, 2) });
  reaction.update(3);
  assert.equal(reaction.getSnapshot().state, PERCEPTION_STATES.INVESTIGATING);
  reaction.update(2);
  assert.equal(reaction.getSnapshot().state, PERCEPTION_STATES.SUSPICIOUS);
  reaction.update(1);
  assert.equal(reaction.getSnapshot().state, PERCEPTION_STATES.NONE);
  assert.equal(reaction.getSnapshot().lastKnownCell, null);
});

test("snapshots are deeply immutable and configuration is validated", () => {
  const reaction = createEnemyPerceptionReaction({ profile: { suspiciousDuration: [1, 1] } });
  reaction.acceptDetection({ strength: 0.25, cell: cell(1, 1) });
  const snapshot = reaction.getSnapshot();
  assert.throws(() => { snapshot.suspicionCell.x = 9; }, TypeError);
  assert.throws(() => createEnemyPerceptionReaction({ profile: { alertedDuration: [-1, 2] } }), TypeError);
  assert.throws(() => reaction.update(-1), TypeError);
});

test("investigation advances through four facing phases", () => {
  const faces = [];
  const reaction = createEnemyPerceptionReaction({ onFace: (_cell, direction) => faces.push(direction), profile: {
    alertedDuration: [3, 3], investigationDuration: 8, searchDirectionDuration: 2,
  } });
  reaction.acceptDetection({ type: "visual", strength: 1, cell: cell(2, 2) });
  reaction.update(3); reaction.update(2); reaction.update(2);
  assert.deepEqual(faces, [1, 2]);
  assert.equal(reaction.getSnapshot().searchDirectionIndex, 2);
});
