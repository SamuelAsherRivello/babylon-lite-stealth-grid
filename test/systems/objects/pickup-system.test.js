import assert from "node:assert/strict";
import test from "node:test";
import { createPickupSystem } from "../../../src/systems/objects/pickup-system.js";

test("pickup system spawns arbitrary pickup definitions and collects them", () => {
  const added = [];
  let collected = 0;
  const system = createPickupSystem({ renderer: { add: (layer) => added.push(layer), remove: () => {} } });
  const pickup = system.spawn({ create: ({ position }) => ({
    layer: { position }, isDead: false,
    getCollider: () => ({ x: 0, y: 0, width: 10, height: 10 }), update: () => {},
    collect: () => { collected += 1; }, dispose: () => {},
  }) }, { x: 12, y: 34 });
  assert.equal(pickup.layer.position.x, 12);
  assert.equal(added.length, 1);
  system.update(0.1, { x: 1, y: 1, width: 2, height: 2 });
  assert.equal(collected, 1);
});

test("pickup system removes a collected pickup after its death animation", () => {
  let dead = false;
  let collected = false;
  let updates = 0;
  const system = createPickupSystem({ renderer: { add: () => {}, remove: () => {} } });
  system.spawn({ create: () => ({
    layer: {},
    isDead: false,
    getCombatCollider: () => ({ x: 0, y: 0, width: 10, height: 10 }),
    update: () => { updates += 1; },
    collect: () => { collected = true; dead = true; },
    dispose: () => {},
    get isDead() { return dead; },
  }) }, { x: 0, y: 0 });

  system.update(0.1, { x: 1, y: 1, width: 2, height: 2 });
  assert.equal(collected, true);
  assert.equal(updates, 1);
  assert.equal(system.pickups.length, 0);
});
