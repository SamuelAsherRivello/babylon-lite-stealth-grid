import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFLECT_DURATION_SECONDS,
  createProjectileRenderer,
} from "../src/systems/objects/projectile-renderer.js";

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
