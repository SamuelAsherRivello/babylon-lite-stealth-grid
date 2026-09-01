import assert from "node:assert/strict";
import test from "node:test";

import {
  canBurnBushFromCell,
  createGoblinBehaviorController,
  createGoblinFireHitCollider,
  findRoute,
  selectNearestReachableBush,
} from "../../src/characters/enemies/goblin/goblin-behavior-controller.js";

const grid = { tileSizePx: 64, columns: 9, rows: 16 };
const open = ({ x, y }) => x >= 0 && x < grid.columns && y >= 0 && y < grid.rows;

test("a bush burn is valid only from the four cardinal adjacent cells", () => {
  const bush = { x: 4, y: 5 };
  for (const cell of [
    { x: 3, y: 5 }, { x: 5, y: 5 }, { x: 4, y: 4 }, { x: 4, y: 6 },
  ]) assert.equal(canBurnBushFromCell(cell, bush), true);

  for (const cell of [
    { x: 4, y: 5 },
    { x: 3, y: 4 }, { x: 3, y: 6 }, { x: 5, y: 4 }, { x: 5, y: 6 },
    { x: 2, y: 5 }, { x: 6, y: 5 }, { x: 4, y: 3 }, { x: 4, y: 7 },
  ]) assert.equal(canBurnBushFromCell(cell, bush), false);
});

test("route search turns through cardinal cells and selects nearest reachable bush", () => {
  const blocked = new Set(["1,0"]);
  const isWalkable = (cell) => open(cell) && !blocked.has(`${cell.x},${cell.y}`);
  const route = findRoute({ x: 0, y: 0 }, [{ x: 2, y: 0 }], isWalkable);
  assert.deepEqual(route, [
    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 0 },
  ]);
  const selected = selectNearestReachableBush({ x: 0, y: 0 }, [
    { id: "far", isAlive: true, cell: { x: 7, y: 7 } },
    { id: "near", isAlive: true, cell: { x: 2, y: 0 } },
  ], isWalkable);
  assert.equal(selected.bush.id, "near");
});

test("fire swing projects one grid cell toward the locked direction", () => {
  const body = { x: 32, y: 32, width: 64, height: 96 };
  assert.deepEqual(createGoblinFireHitCollider(body, { x: 1, y: 0 }), {
    x: 96, y: 32, width: 64, height: 96,
  });
  assert.deepEqual(createGoblinFireHitCollider(body, { x: 0, y: -1 }), {
    x: 32, y: -32, width: 64, height: 64,
  });
});

function harness(randomValues, world, options = {}, movementColliderOffset = { x: 0, y: 0 }) {
  const events = [];
  let position = { x: 32, y: 32 };
  const goblin = {
    getPosition: () => ({ ...position }),
    getGridPosition: () => ({ x: Math.floor(position.x / 64), y: Math.floor(position.y / 64) }),
    getMovementCollider: () => ({
      type: "circle",
      x: position.x + movementColliderOffset.x,
      y: position.y + movementColliderOffset.y,
      radius: 24,
    }),
    getCombatCollider: () => ({ x: position.x - 32, y: position.y - 48, width: 64, height: 96 }),
    setMovementIntent: (movement) => events.push({ type: "move", movement }),
    attack: (direction) => { events.push({ type: "attack", direction }); return true; },
  };
  const random = () => randomValues.shift() ?? 0.5;
  const controller = createGoblinBehaviorController(goblin, {
    grid, spawnCell: { x: 0, y: 0 }, isWalkable: open,
    getWorld: () => world, random, idleRange: [0, 0],
    ...options,
  });
  return { controller, events, setPosition: (next) => { position = next; } };
}

test("the real goblin collider center, not its artwork anchor, determines adjacency", () => {
  let hits = 0;
  const bush = {
    id: "bush", isAlive: true, cell: { x: 3, y: 0 }, position: { x: 224, y: 32 },
    combatCollider: { x: 188, y: -4, width: 72, height: 72 },
    applyFireDamage() { hits += 1; },
  };
  const { controller, events, setPosition } = harness([0.5], {
    characters: [], bushes: [bush],
  }, { prioritizeBushes: true, bushChance: 1 }, {
    x: 0,
    y: 192 * 0.84 - 123,
  });

  // The artwork anchor is outside cell 2,0 while the movement-collider center
  // is in cell 2,0. The collider-center contract therefore permits this hit.
  setPosition({ x: 160, y: 32 - (192 * 0.84 - 123) });
  controller.update(0.01);

  assert.equal(hits, 1);
  assert.equal(events.filter(({ type }) => type === "attack").length, 1);
});

test("temporary QA mode walks to a cardinal adjacent cell and hits the bush twice", () => {
  let health = 100;
  const bush = {
    id: "bush", isAlive: true, cell: { x: 3, y: 0 }, position: { x: 224, y: 32 },
    combatCollider: { x: 188, y: -4, width: 72, height: 72 },
    applyFireDamage(amount) { health = Math.max(0, health - amount); this.isAlive = health > 0; },
  };
  const { controller, events, setPosition } = harness([0.5], {
    characters: [], bushes: [bush],
  }, {
    prioritizeBushes: true,
    bushChance: 1,
  });

  controller.update(0.01);
  controller.update(0.01);
  setPosition({ x: 96, y: 32 });
  controller.update(0.01);
  controller.update(0.01);
  setPosition({ x: 160, y: 32 });
  controller.update(0.01);
  controller.update(1.3);

  assert.ok(events.some(({ type, movement }) => (
    type === "move" && movement.x === 1 && movement.y === 0
  )));
  assert.deepEqual(events.filter(({ type }) => type === "attack").map(({ direction }) => direction), [
    { x: 1, y: 0 },
    { x: 1, y: 0 },
  ]);
  assert.equal(health, 0);
});

test("a collider center in a diagonal cell does not permit a corner burn", () => {
  let hits = 0;
  const bush = {
    id: "bush", isAlive: true, cell: { x: 2, y: 0 }, position: { x: 160, y: 32 },
    combatCollider: { x: 124, y: -4, width: 72, height: 72 },
    applyFireDamage() { hits += 1; },
  };
  const { controller, events, setPosition } = harness([0.5], {
    characters: [], bushes: [bush],
  }, { prioritizeBushes: true, bushChance: 1 });
  setPosition({ x: 70, y: 70 });

  controller.update(0.01);
  controller.update(0.01);

  assert.equal(hits, 0);
  assert.equal(events.filter(({ type }) => type === "attack").length, 0);
  assert.ok(events.some(({ type, movement }) => (
    type === "move" && (movement.x !== 0 || movement.y !== 0)
  )));
});

test("character priority avoids the bush roll", () => {
  let damage = 0;
  const world = {
    characters: [{ id: "player", isAlive: true, cell: { x: 1, y: 0 }, position: { x: 96, y: 32 } }],
    bushes: [{ id: "bush", isAlive: true, cell: { x: 2, y: 0 }, position: { x: 160, y: 32 }, applyFireDamage: () => { damage += 1; } }],
  };
  const { controller, events } = harness([0, 0], world);
  controller.update(0.01);
  assert.equal(events.filter(({ type }) => type === "attack").length, 1);
  assert.equal(damage, 0);
});

test("a stationary adjacent character triggers one attack rather than an endless attack loop", () => {
  const world = {
    characters: [{ id: "player", isAlive: true, cell: { x: 1, y: 0 }, position: { x: 96, y: 32 } }],
    bushes: [],
  };
  const { controller, events } = harness([0.5, 0.5, 0], world);

  controller.update(0.01);
  controller.update(1.3);
  controller.update(0.01);

  assert.equal(events.filter(({ type }) => type === "attack").length, 1);
  assert.ok(events.some(({ type, movement }) => (
    type === "move" && (movement.x !== 0 || movement.y !== 0)
  )));
});

test("a diagonal character does not trap the goblin in repeated stationary attacks", () => {
  const bush = {
    id: "bush", isAlive: true, cell: { x: 3, y: 0 }, position: { x: 224, y: 32 },
    combatCollider: { x: 188, y: -4, width: 72, height: 72 },
    applyFireDamage() {},
  };
  const world = {
    characters: [{
      id: "player", isAlive: true, cell: { x: 1, y: 1 }, position: { x: 96, y: 96 },
    }],
    bushes: [bush],
  };
  const { controller, events } = harness([0.5, 0], world);

  controller.update(0.01);
  controller.update(0.01);

  assert.equal(events.filter(({ type }) => type === "attack").length, 0);
  assert.deepEqual(events.at(-1), { type: "move", movement: { x: 1, y: 0 } });
});

test("roll below 0.25 seeks a map-wide bush and applies one 50 damage event", () => {
  const hits = [];
  const bush = {
    id: "bush", isAlive: true, cell: { x: 1, y: 0 }, position: { x: 96, y: 32 },
    combatCollider: { x: 60, y: -4, width: 72, height: 72 },
    applyFireDamage: (amount) => hits.push(amount),
  };
  const { controller } = harness([0.5, 0.249], { characters: [], bushes: [bush] });
  controller.update(0.01);
  assert.deepEqual(hits, [50]);
});

test("exact 0.25 uses normal home-bounded patrol instead of bush search", () => {
  const hits = [];
  const bush = {
    id: "bush", isAlive: true, cell: { x: 1, y: 0 }, position: { x: 96, y: 32 },
    combatCollider: { x: 60, y: -4, width: 72, height: 72 },
    applyFireDamage: (amount) => hits.push(amount),
  };
  const { controller } = harness([0.5, 0.25, 0], { characters: [], bushes: [bush] });
  controller.update(0.01);
  assert.deepEqual(hits, []);
});
