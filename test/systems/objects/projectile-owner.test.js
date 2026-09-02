import test from "node:test";
import assert from "node:assert/strict";
import { createProjectileRenderer } from "../../../src/systems/objects/projectile-renderer.js";

test("projectile renderer preserves an arrow owner identity", () => {
  const api = {
    createSprite2DLayer: (atlas, options) => ({ atlas, ...options }),
    addSprite2D: (layer, options) => ({ layer, ...options }),
    removeSprite2D: () => {},
    updateSprite2D: () => {},
  };
  const renderer = createProjectileRenderer({ atlas: {}, bounds: { width: 640, height: 640 }, obstacles: [], api });
  renderer.shoot({ x: 100, y: 100 }, { x: 1, y: 0 }, "archer-1");
  assert.equal(renderer.getColliders()[0].ownerId, "archer-1");
});
