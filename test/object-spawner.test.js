import assert from "node:assert/strict";
import test from "node:test";

import { createObjectSpawner } from "../src/object-spawner.js";

test("object spawner creates exactly once and never respawns", () => {
  const positions = [];
  const spawner = createObjectSpawner({
    type: "GOLD_STONE",
    position: { x: 10, y: 20 },
    createObject: (position) => { positions.push(position); return { id: 1 }; },
  });
  assert.equal(spawner.initialize(), 1);
  assert.equal(spawner.initialize(), 0);
  assert.equal(spawner.update(10), 0);
  assert.deepEqual(positions, [{ x: 10, y: 20 }]);
});
