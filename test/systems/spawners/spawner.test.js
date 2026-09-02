import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_SPAWN_CHECK_INTERVAL_SECONDS,
  createSpawner,
  selectWeightedSpawnCount,
  SPAWN_MODE_ANYWHERE_WALKABLE,
} from "../../../src/systems/spawners/spawner.js";

function sequenceRandom(values) {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}

function createHarness(overrides = {}) {
  const disposed = [];
  let nextId = 1;
  const spawner = createSpawner({
    type: "enemy",
    position: { x: 10, y: 20 },
    minimumCount: 2,
    maximumCount: 3,
    random: () => 0.999999,
    createActor: (position) => ({ id: nextId++, position: { ...position } }),
    disposeActor: (actor) => disposed.push(actor.id),
    ...overrides,
  });
  return { disposed, spawner };
}

test("spawner validates population, interval, position, and callbacks", () => {
  const base = {
    type: "enemy",
    position: { x: 0, y: 0 },
    minimumCount: 0,
    maximumCount: 1,
    createActor: () => ({}),
  };

  assert.throws(() => createSpawner({ ...base, minimumCount: -1 }), /minimumCount/);
  assert.throws(() => createSpawner({ ...base, maximumCount: -1 }), /maximumCount/);
  assert.throws(
    () => createSpawner({ ...base, minimumCount: 2, maximumCount: 1 }),
    /minimumCount.*maximumCount/,
  );
  assert.throws(() => createSpawner({ ...base, checkIntervalSeconds: 0 }), /checkIntervalSeconds/);
  assert.throws(() => createSpawner({ ...base, position: { x: NaN, y: 0 } }), /position/);
  assert.throws(() => createSpawner({ ...base, createActor: null }), /createActor/);
  assert.throws(() => createSpawner({ ...base, spawnMode: "invalid" }), /spawnMode/);
  assert.throws(() => createSpawner({ ...base, spawnMaxDistance: -1 }), /spawnMaxDistance/);
});

test("spawner defaults to a one-second evaluation interval", () => {
  const { spawner } = createHarness();
  assert.equal(spawner.config.checkIntervalSeconds, DEFAULT_SPAWN_CHECK_INTERVAL_SECONDS);
  assert.equal(DEFAULT_SPAWN_CHECK_INTERVAL_SECONDS, 1);
});

test("weighted spawn selection includes zero and remaining capacity", () => {
  assert.equal(selectWeightedSpawnCount(3, 0), 0);
  assert.equal(selectWeightedSpawnCount(3, 0.49), 0);
  assert.equal(selectWeightedSpawnCount(3, 0.5), 1);
  assert.equal(selectWeightedSpawnCount(3, 0.999999), 3);
  assert.throws(() => selectWeightedSpawnCount(-1, 0.5), /remainingCapacity/);
  assert.throws(() => selectWeightedSpawnCount(1, 1), /randomValue/);
});

test("player can guarantee one actor during its immediate startup evaluation", () => {
  const { spawner } = createHarness({
    type: "player",
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: true,
    random: () => 0,
  });

  assert.equal(spawner.actors.length, 0);
  assert.equal(spawner.initialize(), 1);
  assert.equal(spawner.actors.length, 1);
  assert.deepEqual(spawner.actors[0].position, { x: 10, y: 20 });
});

test("a batch uses distinct walkable cells from the spawner-centered 3x3 grid", () => {
  const { spawner } = createHarness({
    position: { x: 25, y: 25 },
    minimumCount: 3,
    maximumCount: 3,
    guaranteeInitialPopulation: true,
    tileSize: 10,
    random: sequenceRandom([0.5, 0, 0.999999]),
    isWalkable: ({ x, y }) => !(x === 15 && y === 15),
  });

  assert.equal(spawner.initialize(), 3);
  const positions = spawner.actors.map(({ position }) => position);
  assert.equal(new Set(positions.map(({ x, y }) => `${x},${y}`)).size, 3);
  assert.ok(positions.every(({ x, y }) => Math.abs(x - 25) <= 10 && Math.abs(y - 25) <= 10));
  assert.ok(positions.every(({ x, y }) => !(x === 15 && y === 15)));
});

test("a spawner skips excess creations when no unoccupied walkable nearby cell remains", () => {
  const { spawner } = createHarness({
    minimumCount: 2,
    maximumCount: 2,
    guaranteeInitialPopulation: true,
    tileSize: 10,
    isWalkable: ({ x, y }) => x === 15 && y === 25,
  });

  assert.equal(spawner.initialize(), 1);
  assert.equal(spawner.actors.length, 1);
  assert.deepEqual(spawner.actors[0].position, { x: 15, y: 25 });
});

test("nearby radius three can reach a cell three tiles from the spawner", () => {
  const { spawner } = createHarness({
    position: { x: 35, y: 35 }, minimumCount: 1, maximumCount: 1,
    guaranteeInitialPopulation: true, tileSize: 10, spawnMaxDistance: 3,
    isWalkable: ({ x, y }) => x === 5 && y === 5,
  });
  assert.equal(spawner.initialize(), 1);
  assert.deepEqual(spawner.actors[0].position, { x: 5, y: 5 });
});

test("anywhere-walkable can reach a cell outside the nearby neighborhood", () => {
  const { spawner } = createHarness({
    position: { x: 5, y: 5 }, minimumCount: 1, maximumCount: 1,
    guaranteeInitialPopulation: true, tileSize: 10,
    spawnMode: SPAWN_MODE_ANYWHERE_WALKABLE,
    getWalkableCells: () => [{ x: 8, y: 8 }],
  });
  assert.equal(spawner.initialize(), 1);
  assert.deepEqual(spawner.actors[0].position, { x: 85, y: 85 });
});

test("non-player startup and later evaluations can choose zero", () => {
  const { spawner } = createHarness({ random: () => 0 });

  assert.equal(spawner.initialize(), 0);
  assert.equal(spawner.update(0.999), 0);
  assert.equal(spawner.update(0.001), 0);
  assert.equal(spawner.actors.length, 0);
});

test("custom N-second interval delays a bounded random batch", () => {
  const { spawner } = createHarness({
    checkIntervalSeconds: 2,
    random: sequenceRandom([0, 0.999999]),
  });

  spawner.initialize();
  assert.equal(spawner.update(1.99), 0);
  assert.equal(spawner.update(0.01), 3);
  assert.equal(spawner.actors.length, 3);
});

test("large delta consumes complete intervals without spawning in range", () => {
  const { spawner } = createHarness({
    minimumCount: 1,
    maximumCount: 2,
    random: sequenceRandom([0, 0, 0.999999]),
  });

  spawner.initialize();
  assert.equal(spawner.update(2), 2);
  assert.equal(spawner.actors.length, 2);
  assert.equal(spawner.update(10), 0);
  assert.equal(spawner.actors.length, 2);
});

test("removing an owned actor disposes once and allows later replenishment", () => {
  const { disposed, spawner } = createHarness({
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: true,
  });
  spawner.initialize();
  const actor = spawner.actors[0];

  assert.equal(spawner.remove(actor), true);
  assert.equal(spawner.remove(actor), false);
  assert.deepEqual(disposed, [actor.id]);
  assert.equal(spawner.actors.length, 0);
  assert.equal(spawner.update(1), 1);
  assert.equal(spawner.actors.length, 1);
});

test("a dying actor remains counted until death completion, then replacement can be gradual", () => {
  const { spawner } = createHarness({
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: true,
    random: sequenceRandom([0, 0.999999]),
  });
  spawner.initialize();
  const actor = spawner.actors[0];

  actor.state = "dying";
  assert.equal(spawner.update(1), 0);
  assert.equal(spawner.actors.length, 1);

  actor.state = "dead";
  assert.equal(spawner.remove(actor), true);
  assert.equal(spawner.update(1), 0);
  assert.equal(spawner.actors.length, 0);
  assert.equal(spawner.update(1), 1);
  assert.equal(spawner.actors.length, 1);
});

test("actors owned by another spawner cannot be removed or counted", () => {
  const first = createHarness({ minimumCount: 1, maximumCount: 1, guaranteeInitialPopulation: true });
  const second = createHarness({ minimumCount: 1, maximumCount: 1, guaranteeInitialPopulation: true });
  first.spawner.initialize();
  second.spawner.initialize();

  assert.equal(first.spawner.remove(second.spawner.actors[0]), false);
  assert.equal(first.spawner.actors.length, 1);
  assert.equal(second.spawner.actors.length, 1);
});

test("dispose is idempotent and stops future evaluations", () => {
  const { disposed, spawner } = createHarness({
    minimumCount: 1,
    maximumCount: 2,
    guaranteeInitialPopulation: true,
  });
  spawner.initialize();

  spawner.dispose();
  spawner.dispose();
  assert.deepEqual(disposed, [1]);
  assert.equal(spawner.actors.length, 0);
  assert.equal(spawner.update(100), 0);
});

test("zero-distance initial spawns use the exact configured position", () => {
  const positions = [];
  const spawner = createSpawner({
    type: "player",
    position: { x: 224, y: 405.76 },
    minimumCount: 1,
    maximumCount: 1,
    guaranteeInitialPopulation: true,
    tileSize: 64,
    spawnMaxDistance: 0,
    random: () => 0.999,
    createActor: (position) => { positions.push(position); return { position }; },
  });

  spawner.initialize();
  assert.deepEqual(positions, [{ x: 224, y: 405.76 }]);
});

test('validated exact autonomous spawn chooses nearest available cell with stable ties', () => {
  const { spawner } = createHarness({
    position: { x: 32, y: 800 }, minimumCount: 1, maximumCount: 1,
    tileSize: 64, spawnMaxDistance: 0, guaranteeInitialPopulation: true,
    validateSpawnPosition: true,
    getWalkableCells: () => [{ x: 0, y: 13 }, { x: 0, y: 11 }, { x: 2, y: 12 }],
    isWalkable: (_position, cell) => !(cell.x === 0 && cell.y === 12),
  });
  spawner.initialize();
  assert.deepEqual(spawner.actors[0].position, { x: 32, y: 736 });
});
test('validated autonomous spawn defers until an occupied cell becomes available', () => {
  let available = false;
  const { spawner } = createHarness({
    position: { x: 32, y: 32 }, minimumCount: 1, maximumCount: 1,
    tileSize: 64, spawnMaxDistance: 0, guaranteeInitialPopulation: true,
    validateSpawnPosition: true, getWalkableCells: () => [{ x: 0, y: 0 }],
    isWalkable: () => available,
  });
  assert.equal(spawner.initialize(), 0);
  available = true;
  assert.equal(spawner.update(1), 1);
  assert.deepEqual(spawner.actors[0].position, { x: 32, y: 32 });
});
