import assert from "node:assert/strict";
import test from "node:test";
import { createGoldStone } from "../../../src/systems/objects/gold-stone.js";
import { chooseNineGridDestinations, createGoldPickup } from "../../../src/systems/objects/gold-pickup.js";

test("gold stone has one health and enters object death after one hit", () => {
  const updates = [];
  const stone = createGoldStone({
    object: { id: 7, position: { x: 32, y: 64 }, goldStone: { frameSize: { width: 64, height: 64 }, frameCount: 6, combatCollider: { x: 0, y: 0, width: 48, height: 48 } } },
    api: { createSprite2DLayer: () => ({ }), addSprite2D: () => ({}), updateSprite2D: (_s, patch) => updates.push(patch), removeSprite2D: () => {} },
  });
  assert.equal(stone.type, "GoldObject");
  assert.equal(stone.health, 1);
  stone.applyDamage(1);
  assert.equal(stone.isDying, true);
  stone.update(0.25);
  assert.equal(stone.isDead, true);
  assert.ok(updates.some(({ alpha }) => alpha === 0));
});

test("pickups choose distinct surrounding 9-grid cells and collect during spawn", () => {
  const destinations = chooseNineGridDestinations({ x: 3, y: 3 }, 3, () => true, () => 0.1);
  assert.equal(new Set(destinations.map(({ x, y }) => `${x},${y}`)).size, 3);
  assert.ok(destinations.every(({ x, y }) => Math.abs(x - 3) <= 1 && Math.abs(y - 3) <= 1 && (x !== 3 || y !== 3)));
  const updates = [];
  const pickup = createGoldPickup({ object: { id: 1 }, startPosition: { x: 32, y: 32 }, destination: { x: 96, y: 32 }, api: { createSprite2DLayer: () => ({}), addSprite2D: () => ({}), updateSprite2D: (_sprite, patch) => updates.push(patch), removeSprite2D: () => {} } });
  assert.equal(pickup.type, "GoldPickup");
  assert.equal(pickup.getMovementCollider(), null);
  assert.deepEqual(pickup.getCombatCollider(), { x: 20, y: 20, width: 24, height: 24 });
  assert.equal(pickup.collect(), true);
  assert.equal(pickup.isPickingUp, true);
  pickup.update(0.09);
  assert.ok(updates.some(({ positionPx, alpha }) => positionPx?.[1] === 967 && alpha < 1 && alpha > 0));
  pickup.update(0.09);
  assert.ok(updates.some(({ positionPx, alpha }) => positionPx?.[1] === 942 && alpha === 0));
  assert.equal(pickup.isDead, true);
});
