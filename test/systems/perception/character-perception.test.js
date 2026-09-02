import test from "node:test";
import assert from "node:assert/strict";
import { CARDINAL_DIRECTIONS, createCharacterPerception, evaluatePerception, getAudioCells, getVisualCells, getVisualStrength, PerceptionTargetState } from "../../src/systems/perception/character-perception.js";

test("visual geometry and strengths are cardinal and distance-ranked", () => {
  assert.deepEqual(getVisualCells({ x: 2, y: 3 }, CARDINAL_DIRECTIONS.right), [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }]);
  assert.deepEqual(getVisualCells({ x: 2, y: 3 }, "up")[0], { x: 2, y: 2 });
  assert.deepEqual([1, 2, 3, 4].map(getVisualStrength), [1, 0.75, 0.5, 0.25]);
});

test("audio includes exactly the eight neighboring cells", () => assert.equal(getAudioCells({ x: 0, y: 0 }).length, 8));

test("visual geometry follows every cardinal heading", () => {
  const origin = { x: 5, y: 5 };
  assert.deepEqual(getVisualCells(origin, "left")[0], { x: 4, y: 5 });
  assert.deepEqual(getVisualCells(origin, "up")[0], { x: 5, y: 4 });
  assert.deepEqual(getVisualCells(origin, "right")[0], { x: 6, y: 5 });
  assert.deepEqual(getVisualCells(origin, "down")[0], { x: 5, y: 6 });
});

test("perception snapshot uses the detector's updated heading", () => {
  const perception = createCharacterPerception();
  perception.register({ id: "player", type: "player", cell: { x: 5, y: 4 } });
  perception.register({ id: "enemy", type: "enemy", cell: { x: 5, y: 5 }, heading: "right" });
  perception.updateActor("enemy", { heading: "up" });
  assert.equal(perception.update().find(({ type }) => type === "visual").cell.y, 4);
  assert.equal(perception.getSnapshot().actors.find(({ id }) => id === "enemy").heading, "up");
});

test("visual is blocked by terrain while audio is not", () => {
  const args = { detector: { cell: { x: 0, y: 0 }, heading: "right" }, target: { cell: { x: 3, y: 0 } }, isWalkable: (cell) => cell.x !== 1 };
  assert.deepEqual(evaluatePerception(args), []);
  assert.equal(evaluatePerception({ ...args, target: { cell: { x: 1, y: 1 } } })[0].type, "audio");
});

test("visual blockers negate their own cell and block cells beyond", () => {
  const detector = { cell: { x: 0, y: 0 }, heading: "right" };
  const bush = { type: "bush", isAlive: true, cell: { x: 1, y: 0 } };
  assert.equal(evaluatePerception({ detector, target: { cell: { x: 1, y: 0 } }, blockers: [bush] }).some(({ type }) => type === "visual"), false);
  assert.equal(evaluatePerception({ detector, target: { cell: { x: 3, y: 0 } }, blockers: [bush] }).some(({ type }) => type === "visual"), false);
  assert.equal(evaluatePerception({ detector, target: { cell: { x: 2, y: 0 } }, blockers: [] })[0].type, "visual");
});

test("audio is negated by an enemy but not by a bush", () => {
  const detector = { cell: { x: 0, y: 0 }, heading: "right" };
  const target = { cell: { x: 1, y: 1 } };
  assert.deepEqual(evaluatePerception({ detector, target, blockers: [{ type: "bush", isAlive: true, cell: target.cell }] }).map(({ type }) => type), ["audio"]);
  assert.deepEqual(evaluatePerception({ detector, target, blockers: [{ type: "enemy", isAlive: true, cell: target.cell }] }), []);
});

test("dead visual and audio blockers are transparent", () => {
  const detector = { cell: { x: 0, y: 0 }, heading: "right" };
  const deadBush = { type: "bush", isAlive: false, cell: { x: 1, y: 0 } };
  const deadEnemy = { type: "enemy", isAlive: false, cell: { x: 1, y: 1 } };
  assert.equal(evaluatePerception({ detector, target: { cell: { x: 2, y: 0 } }, blockers: [deadBush] })[0].type, "visual");
  assert.equal(evaluatePerception({ detector, target: { cell: { x: 1, y: 1 } }, blockers: [deadEnemy] })[0].type, "audio");
});

test("a bush at the detector origin does not block its visual ray", () => {
  const detector = { cell: { x: 0, y: 0 }, heading: "right" };
  const bush = { type: "bush", isAlive: true, cell: { x: 0, y: 0 } };
  const detections = evaluatePerception({ detector, target: { cell: { x: 1, y: 0 } }, blockers: [bush] });
  assert.equal(detections.some(({ type }) => type === "visual"), true);
});

test("manager registers, deregisters, snapshots, and accepts one alert until recovery", () => {
  const events = [];
  const perception = createCharacterPerception();
  perception.register({ id: "player", type: "player", cell: { x: 1, y: 0 } });
  perception.register({ id: "goblin", type: "enemy", cell: { x: 0, y: 0 }, heading: "right", onDetection: (event) => events.push(event) });
  assert.equal(perception.update().length, 2);
  perception.update();
  assert.equal(events.length, 1);
  perception.recover("goblin"); perception.update();
  assert.equal(events.length, 2);
  perception.unregister("player");
  assert.equal(perception.snapshot().length, 1);
});

test("walking the player through perception cells produces the current visual and audio detections", () => {
  const perception = createCharacterPerception();
  perception.register({ id: "player", type: "player", cell: { x: 1, y: 0 } });
  perception.register({ id: "enemy", type: "enemy", cell: { x: 0, y: 0 }, heading: "right" });

  assert.deepEqual(perception.update().map(({ type, cell }) => ({ type, cell })), [
    { type: "visual", cell: { x: 1, y: 0 } },
    { type: "audio", cell: { x: 1, y: 0 } },
  ]);
  perception.updateActor("player", { cell: { x: 2, y: 0 } });
  assert.deepEqual(perception.update().map(({ type, cell }) => ({ type, cell })), [
    { type: "visual", cell: { x: 2, y: 0 } },
  ]);
});

test("hidden players produce neither visual nor audio detections", () => {
  const perception = createCharacterPerception();
  const events = [];
  perception.register({ id: "player", type: "player", cell: { x: 1, y: 0 }, targetState: PerceptionTargetState.Hidden });
  perception.register({ id: "goblin", type: "enemy", cell: { x: 0, y: 0 }, heading: "right", onDetection: (event) => events.push(event) });
  assert.deepEqual(perception.update(), []);
  assert.deepEqual(events, []);
});

test("perceived cells remain known for five seconds after current detection ends", () => {
  const perception = createCharacterPerception();
  perception.register({ id: "player", type: "player", cell: { x: 1, y: 0 } });
  perception.register({ id: "enemy", type: "enemy", cell: { x: 0, y: 0 }, heading: "right" });

  perception.update();
  assert.deepEqual(perception.getSnapshot().knownDetections, [{ detectorId: "enemy", cell: { x: 1, y: 0 } }]);
  perception.updateActor("player", { cell: { x: 5, y: 5 } });
  perception.update(4.9);
  assert.equal(perception.getSnapshot().detections.length, 0);
  assert.equal(perception.getSnapshot().knownDetections.length, 1);
  perception.update(0.1);
  assert.equal(perception.getSnapshot().knownDetections.length, 0);
});

test("each detector remembers only its latest perceived cell", () => {
  const perception = createCharacterPerception();
  perception.register({ id: "player", type: "player", cell: { x: 1, y: 0 } });
  perception.register({ id: "enemy", type: "enemy", cell: { x: 0, y: 0 }, heading: "right" });

  perception.update();
  perception.updateActor("player", { cell: { x: 2, y: 0 } });
  perception.update();

  assert.deepEqual(perception.getSnapshot().knownDetections, [{
    detectorId: "enemy", cell: { x: 2, y: 0 },
  }]);
});
