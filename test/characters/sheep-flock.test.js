import test from "node:test";
import assert from "node:assert/strict";

import {
  createSheepContactCoordinator,
  getOrderedPair,
  getPairSeparationDirections,
  movementsConflict,
} from "../../src/characters/npc/sheep/sheep-flock.js";

const circle = (x, y, radius = 26) => ({ type: "circle", x, y, radius });
const sheep = (id, x, y, extra = {}) => ({
  id,
  isAlive: true,
  collider: circle(x, y),
  position: { x, y },
  ...extra,
});

test("pair ordering and separation directions are stable across input order", () => {
  assert.deepEqual(getOrderedPair("sheep-9", "sheep-2"), ["sheep-2", "sheep-9"]);
  const forward = getPairSeparationDirections(sheep("sheep-2", 100, 100), sheep("sheep-9", 150, 110));
  const reversed = getPairSeparationDirections(sheep("sheep-9", 150, 110), sheep("sheep-2", 100, 100));
  assert.deepEqual(forward, {
    "sheep-2": { x: -1, y: 0 },
    "sheep-9": { x: 1, y: 0 },
  });
  assert.deepEqual(reversed, forward);
});

test("coincident centers receive deterministic opposite cardinal directions", () => {
  const first = getPairSeparationDirections(sheep("sheep-a", 100, 100), sheep("sheep-b", 100, 100));
  const second = getPairSeparationDirections(sheep("sheep-b", 100, 100), sheep("sheep-a", 100, 100));
  assert.deepEqual(second, first);
  const directions = Object.values(first);
  assert.equal(Math.abs(directions[0].x) + Math.abs(directions[0].y), 1);
  assert.equal(directions[1].x + directions[0].x, 0);
  assert.equal(directions[1].y + directions[0].y, 0);
});

test("requested movement conflict detects a shared destination and a head-on crossing", () => {
  assert.equal(movementsConflict(
    sheep("a", 64, 64, { requestedPosition: { x: 128, y: 64 } }),
    sheep("b", 192, 64, { requestedPosition: { x: 128, y: 64 } }),
  ), true);
  assert.equal(movementsConflict(
    sheep("a", 64, 64, { requestedPosition: { x: 192, y: 64 } }),
    sheep("b", 192, 64, { requestedPosition: { x: 64, y: 64 } }),
  ), true);
});

test("one uninterrupted contact episode triggers once and rearms after separation", () => {
  const coordinator = createSheepContactCoordinator();
  const touching = [sheep("a", 100, 100), sheep("b", 150, 100)];
  assert.equal(coordinator.update(touching).contacts.length, 1);
  assert.equal(coordinator.update(touching).contacts.length, 0);
  assert.equal(coordinator.update([sheep("a", 100, 100), sheep("b", 200, 100)]).contacts.length, 0);
  assert.equal(coordinator.update(touching).contacts.length, 1);
});

test("dead and absent sheep prune episodes and do not react", () => {
  const coordinator = createSheepContactCoordinator();
  coordinator.update([sheep("a", 100, 100), sheep("b", 150, 100)]);
  assert.equal(coordinator.update([sheep("a", 100, 100), sheep("b", 150, 100, { isAlive: false })]).contacts.length, 0);
  assert.equal(coordinator.update([sheep("a", 100, 100)]).contacts.length, 0);
  assert.equal(coordinator.update([sheep("a", 100, 100), sheep("b", 150, 100)]).contacts.length, 1);
});

test("three-sheep contacts are ordered and start at most one response per sheep", () => {
  const coordinator = createSheepContactCoordinator();
  const result = coordinator.update([
    sheep("c", 200, 100),
    sheep("a", 100, 100),
    sheep("b", 150, 100),
  ]);
  assert.deepEqual(result.contacts.map(({ pair }) => pair), [["a", "b"], ["b", "c"]]);
  assert.equal(result.intents.size, 3);
  assert.equal(result.intents.has("a"), true);
  assert.equal(result.intents.has("b"), true);
  assert.equal(result.intents.has("c"), true);
});
