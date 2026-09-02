import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFLECT_DURATION_SECONDS,
  createProjectileRenderer,
  getProjectileRotation,
  getArrowGroundClip,
} from "../../../src/systems/objects/projectile-renderer.js";

function createFakeApi() {
  const sprites = [];
  const removed = [];
  return {
    sprites,
    removed,
    createSprite2DLayer(atlas, options) {
      return { atlas, ...options, view: { zoom: 1 } };
    },
    addSprite2D(layer, options) {
      const sprite = { layer, ...options };
      sprites.push(sprite);
      return sprite;
    },
    updateSprite2D(sprite, patch) {
      Object.assign(sprite, patch);
    },
    removeSprite2D(sprite) {
      removed.push(sprite);
    },
  };
}

for (const facing of [-1, 1]) test(`grounded arrows are picked up only by their owner, facing ${facing}`, () => {
  const api = createFakeApi();
  const pickups = [];
  const renderer = createProjectileRenderer({ atlas: "arrow", bounds: { width: 1024, height: 1024 }, obstacles: [], api, onPickup: (arrow) => pickups.push(arrow) });
  renderer.shoot({ x: 400, y: 329.55 }, { x: facing, y: 0 }, "archer-1", {
    target: { x: 400 + facing * 128, y: 300 }, landingCenterY: 300,
    initialVelocityDirection: { x: facing, y: 0.85 }, collisionEnabled: false,
  });
  assert.deepEqual(renderer.getPickupColliders(), []);
  renderer.collectGroundedArrows([{ id: "archer-1", collider: { x: 0, y: 0, width: 1024, height: 1024 } }]);
  assert.equal(api.removed.length, 0);
  renderer.update(10);
  const [{ collider }] = renderer.getPickupColliders();
  assert.ok(Math.abs(collider.y + collider.height / 2 - 300) < 0.001);
  for (const id of ["player", "archer-2", "sheep"]) renderer.collectGroundedArrows([{ id, collider }]);
  renderer.collectGroundedArrows([{ id: "archer-1", collider: { x: 0, y: 0, width: 1, height: 1 } }]);
  assert.equal(api.removed.length, 0);
  const landedY = api.sprites[0].positionPx[1];
  renderer.collectGroundedArrows([{ id: "archer-1", collider }]);
  assert.deepEqual(api.removed, []);
  assert.equal(renderer.getProjectiles()[0].state, "pickingUp");
  assert.deepEqual(renderer.getPickupColliders(), []);
  assert.equal(pickups.length, 1);
  assert.equal(pickups[0].ownerId, "archer-1");
  renderer.collectGroundedArrows([{ id: "archer-1", collider }]);
  assert.equal(pickups.length, 1);
  renderer.update(0);
  assert.equal(api.sprites[0].positionPx[1], landedY);
  renderer.update(0.09);
  assert.equal(api.sprites[0].positionPx[1], landedY - 25);
  assert.equal(api.sprites[0].color[3], -0.5, "cropped arrow fades without revealing its buried tip");
  assert.deepEqual(renderer.getColliders(), []);
  assert.deepEqual(api.removed, []);
  renderer.update(0.09);
  assert.deepEqual(api.removed, [api.sprites[0]]);
  assert.deepEqual(renderer.getProjectiles(), []);
});

test("a deflected arrow leaves collisions, bounces, spins, fades, and expires", () => {
  const api = createFakeApi();
  const renderer = createProjectileRenderer({
    atlas: "arrow",
    bounds: { width: 576, height: 1024 },
    obstacles: [],
    api,
  });
  assert.equal(DEFLECT_DURATION_SECONDS, 0.25);
  assert.equal(renderer.shoot({ x: 200, y: 300 }, { x: 1, y: 0 }), true);
  const [{ id }] = renderer.getColliders();
  const sprite = api.sprites[0];
  const startX = sprite.positionPx[0];
  const startRotation = sprite.rotation;

  assert.equal(renderer.deflect(id), true);
  assert.deepEqual(renderer.getColliders(), []);
  renderer.update(0.125);
  assert.ok(sprite.positionPx[0] < startX);
  assert.ok(sprite.rotation > startRotation);
  assert.equal(sprite.alpha, 0.5);
  assert.equal(api.removed.length, 0);

  renderer.update(0.125);
  assert.equal(sprite.alpha, 0);
  assert.deepEqual(renderer.getProjectiles(), []);
  assert.deepEqual(api.removed, [sprite]);
});

test("an archer arrow rises one grid height and rotates from velocity", () => {
  const api = createFakeApi();
  const renderer = createProjectileRenderer({ atlas: "arrow", bounds: { width: 576, height: 1024 }, obstacles: [], api });
  renderer.shoot({ x: 100, y: 100 }, { x: 1, y: 0 }, "archer-1", { target: { x: 356, y: 100 } });
  const sprite = api.sprites[0];
  renderer.update(0.1);
  assert.ok(sprite.positionPx[1] < 924);
  assert.ok(sprite.rotation < 0, "rising rightward arrow points up in screen coordinates");
});

test("landed arrows remain visible, frozen and inactive without exhausting the sprite pool", () => {
  const api = createFakeApi();
  const renderer = createProjectileRenderer({ atlas: "arrow", bounds: { width: 1024, height: 1024 }, obstacles: [], api });
  renderer.shoot({ x: 100, y: 100 }, { x: 1, y: 0 }, "archer", { target: { x: 356, y: 100 }, initialRotation: -0.7 });
  assert.equal(api.sprites[0].rotation, -0.7);
  renderer.update(10);
  const sprite = api.sprites[0];
  assert.deepEqual(sprite.positionPx, [356, 924]);
  assert.ok(sprite.rotation > 0, "landed arrow points down");
  assert.equal(renderer.getProjectiles()[0].state, "landed");
  assert.equal(renderer.getProjectiles()[0].active, false);
  assert.deepEqual(renderer.getColliders(), []);
  assert.equal(renderer.deflect(0), false);
  const frozen = { ...sprite };
  renderer.update(10);
  assert.deepEqual(sprite, frozen);
  assert.equal(api.removed.length, 0);
  for (let i = 0; i < 40; i++) {
    assert.equal(renderer.shoot({ x: 100, y: 100 }, { x: 1, y: 0 }, "archer", { target: { x: 356, y: 100 } }), true);
    renderer.update(10);
  }
  assert.equal(renderer.getProjectiles().length, 41);
  assert.equal(api.removed.length, 0);
  renderer.dispose();
  assert.equal(api.removed.length, 41);
});

for (const progress of [.15, .7, .999]) test(`flight hit at ${progress} is consumed before a long frame lands`, () => {
  const api = createFakeApi();
  const renderer = createProjectileRenderer({ atlas: 'arrow', bounds: { width: 1024, height: 1024 }, obstacles: [], api });
  renderer.shoot({ x: 100, y: 300 }, { x: 1, y: 0 }, 'archer', { target: { x: 356, y: 300 }, collisionEnabled: true });
  const target = { x: 100 + 256 * progress, y: 300 + 256 * progress * (1-progress) };
  let hits = 0;
  renderer.update(10, [], ({ collider, ownerId }) => {
    if (collider.x <= target.x && collider.x + collider.width >= target.x && collider.y <= target.y && collider.y + collider.height >= target.y) {
      assert.equal(ownerId, 'archer'); hits++; return true;
    }
    return false;
  });
  assert.equal(hits, 1);
  assert.deepEqual(renderer.getProjectiles(), []);
  assert.deepEqual(renderer.getPickupColliders(), []);
  assert.equal(api.removed.length, 1);
});

for (const facing of [-1, 1]) test(`landed arrow crops its tip half and aligns the remaining midpoint with archer center, facing ${facing}`, () => {
  const api = createFakeApi();
  const renderer = createProjectileRenderer({ atlas: "arrow", bounds: { width: 1024, height: 1024 }, obstacles: [], api });
  renderer.shoot({ x: 400, y: 329.55 }, { x: facing, y: 0 }, "archer", {
    target: { x: 400 + facing * 128, y: 300 },
    landingCenterY: 300,
    initialVelocityDirection: { x: facing, y: 0.85 },
    collisionEnabled: false,
  });
  assert.deepEqual(api.sprites[0].sizePx, [64, 64]);
  renderer.update(10);
  assert.equal(api.sprites[0].frame, 0);
  assert.deepEqual(api.sprites[0].sizePx, [64, 64]);
  assert.equal(api.sprites[0].color[3], -1, "ground mask remains enabled when frozen");
  assert.ok(Math.abs(api.sprites[0].color[2]) < 0.001, "ground bisects the final full sprite");
  assert.ok(Math.abs(api.sprites[0].positionPx[1] - Math.sin(api.sprites[0].rotation) * 16 - 724) < 0.001);
  assert.equal(renderer.getProjectiles()[0].active, false);
});

test("horizontal ground clipping advances pixel by pixel for both descending orientations", () => {
  for (const angle of [Math.PI / 4, Math.PI * 3 / 4]) {
    const bottom = 32 * (Math.abs(Math.sin(angle)) + Math.abs(Math.cos(angle)));
    for (const depth of [0, 1, 2, 3, 8, 16]) {
      const clip = getArrowGroundClip(angle, 200 - bottom + depth, 200);
      assert.deepEqual(clip, [Math.sin(angle), Math.cos(angle), bottom - depth, -1]);
    }
  }
});

for (const facing of [-1, 1]) test(`ground mask changes during descent before landing, facing ${facing}`, () => {
  const api = createFakeApi();
  const renderer = createProjectileRenderer({ atlas: "arrow", bounds: { width: 1024, height: 1024 }, obstacles: [], api });
  renderer.shoot({ x: 400, y: 329.55 }, { x: facing, y: 0 }, "archer", {
    target: { x: 400 + facing * 256, y: 300 }, landingCenterY: 300,
    initialVelocityDirection: { x: facing, y: 0.85 }, speedMultiplier: 0.5, collisionEnabled: false,
  });
  const thresholds = [];
  for (let frame = 0; frame < 80; frame++) {
    renderer.update(1 / 120);
    const sprite = api.sprites[0];
    if (sprite.color?.[3] === -1 && sprite.color[2] < 30 && renderer.getProjectiles()[0].active) thresholds.push(sprite.color[2]);
  }
  // Continue to cover the full ~1-second flight.
  for (let frame = 0; frame < 60; frame++) {
    renderer.update(1 / 120);
    const sprite = api.sprites[0];
    if (sprite.color?.[3] === -1 && sprite.color[2] < 30 && renderer.getProjectiles()[0].active) thresholds.push(sprite.color[2]);
  }
  assert.ok(thresholds.length > 5, "crop must be visible over multiple flying frames");
  assert.ok(thresholds.every((value, i) => i === 0 || value < thresholds[i - 1]));
});
