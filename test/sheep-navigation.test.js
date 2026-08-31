import test from "node:test";
import assert from "node:assert/strict";

import {
  chooseInclusiveInteger,
  createGridWalkability,
  planFleeRoute,
} from "../src/npc/sheep/sheep-navigation.js";

const bounds = { width: 448, height: 448 };
const character = {
  frame: { width: 0, height: 0 },
  pivot: { x: 0, y: 0 },
  collider: { type: "circle", x: 0, y: 0, radius: 10 },
};
const grid = { tileSizePx: 64, columns: 7, rows: 7 };

function walkability(obstacles = []) {
  return createGridWalkability({ bounds, character, grid, obstacles });
}

test("inclusive integer selection reaches one, two, and three", () => {
  assert.equal(chooseInclusiveInteger(1, 3, () => 0), 1);
  assert.equal(chooseInclusiveInteger(1, 3, () => 0.5), 2);
  assert.equal(chooseInclusiveInteger(1, 3, () => 0.999999), 3);
});

test("flee planner finds a straight three-step route away", () => {
  const route = planFleeRoute({
    start: { x: 3, y: 3 }, threat: { x: 2, y: 3 },
    minimumSteps: 3, maximumSteps: 3,
    isWalkable: walkability(), random: () => 0,
  });
  assert.deepEqual(route, [
    { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 },
  ]);
});

test("flee planner can turn a three-step route around a corner", () => {
  const blocked = new Set(["4,3", "3,4", "3,2", "1,3"]);
  const route = planFleeRoute({
    start: { x: 3, y: 3 }, threat: { x: 4, y: 3 },
    minimumSteps: 3, maximumSteps: 3,
    isWalkable: (cell) => (
      cell.x >= 0 && cell.x < 7 && cell.y >= 0 && cell.y < 7
      && !blocked.has(`${cell.x},${cell.y}`)
    ),
    random: () => 0,
  });
  assert.equal(route.length, 3);
  assert.deepEqual(route[0], { x: 2, y: 3 });
  assert.notEqual(route[1].y, route[0].y);
});

test("walkability rejects bounds, full colliders, and partial polygons", () => {
  const full = { x: 64, y: 64, width: 64, height: 64 };
  const partial = {
    type: "polygon",
    points: [{ x: 128, y: 128 }, { x: 192, y: 128 }, { x: 128, y: 192 }],
  };
  const canWalk = walkability([full, partial]);
  assert.equal(canWalk({ x: -1, y: 0 }), false);
  assert.equal(canWalk({ x: 1, y: 1 }), false);
  assert.equal(canWalk({ x: 2, y: 2 }), false);
  assert.equal(canWalk({ x: 3, y: 2 }), true);
});

test("walkability rejects dynamic non-NPC colliders and ignores NPC colliders", () => {
  const canWalk = walkability();
  const collider = { type: "circle", x: 224, y: 224, radius: 26 };
  assert.equal(canWalk({ x: 3, y: 3 }, [{ type: "player", collider }]), false);
  assert.equal(canWalk({ x: 3, y: 3 }, [{ type: "npc", collider }]), true);
});

test("planner still returns a valid one-step escape route", () => {
  const route = planFleeRoute({
    start: { x: 3, y: 3 }, threat: { x: 3, y: 3 },
    minimumSteps: 1, maximumSteps: 1, isWalkable: walkability(),
    random: () => 0,
  });

  assert.equal(route.length, 1);
  assert.deepEqual(route[0], { x: 4, y: 3 });
});

test("planner prefers the farthest escape cell when tied on distance", () => {
  const route = planFleeRoute({
    start: { x: 3, y: 3 },
    threat: { x: 3, y: 2 },
    minimumSteps: 1,
    maximumSteps: 1,
    isWalkable: walkability(),
    random: () => 0.999999,
  });

  assert.deepEqual(route, [{ x: 3, y: 4 }]);
});

test("planner falls back to the longest shorter safe route", () => {
  const allowed = new Set(["3,3", "4,3", "5,3"]);
  const route = planFleeRoute({
    start: { x: 3, y: 3 }, threat: { x: 2, y: 3 },
    minimumSteps: 1, maximumSteps: 3,
    isWalkable: (cell) => allowed.has(`${cell.x},${cell.y}`),
    random: () => 0.999999,
  });
  assert.deepEqual(route, [{ x: 4, y: 3 }, { x: 5, y: 3 }]);
});

test("planner returns no route when enclosed", () => {
  assert.deepEqual(planFleeRoute({
    start: { x: 3, y: 3 }, threat: { x: 2, y: 3 },
    minimumSteps: 1, maximumSteps: 3,
    isWalkable: (cell) => cell.x === 3 && cell.y === 3,
    random: () => 0,
  }), []);
});
