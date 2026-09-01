import assert from "node:assert/strict";
import test from "node:test";

import { createSharedCharacterActor } from "../../src/characters/shared-character-actor.js";
import { createCharacterDefinition } from "../../src/characters/character-contract.js";

function api() {
  const calls = { added: [], removed: [], stopped: [], updated: [] };
  return {
    calls,
    createSprite2DLayer: (atlas, options) => ({ atlas, ...options }),
    addSprite2D: (layer, options) => { const sprite = { layer, options }; calls.added.push(sprite); return sprite; },
    updateSprite2D: (sprite, options) => calls.updated.push({ sprite, options }),
    playSprite2DAnimation: (...args) => ({ args }),
    stopSpriteAnimation: (animation) => calls.stopped.push(animation),
    removeSprite2D: (sprite) => calls.removed.push(sprite),
  };
}

const definition = createCharacterDefinition({
  id: "test", frame: { width: 192, height: 192 }, movementCollider: { radius: 24 },
  animations: { idle: { frameCount: 2, gridSize: [192, 192], loop: true, frameDurationMs: 100 } },
});

test("shared actor owns transforms, animation lifecycle, and disposal", () => {
  const runtime = api();
  const actor = createSharedCharacterActor({
    definition, atlases: { idle: {} }, bounds: { height: 1024 },
    initialPosition: { x: 96, y: 96 }, tileSize: 64, api: runtime,
  });
  assert.equal(runtime.calls.added.length, 1);
  actor.setAnimationManager({});
  actor.playAnimation("idle");
  actor.setVisualTransform({ sizePx: [96, 96] });
  actor.setPosition({ x: 160, y: 96 });
  assert.deepEqual(actor.getMovementCollider(), { type: "circle", x: 160, y: 96, radius: 24 });
  actor.dispose();
  assert.equal(runtime.calls.removed.length, 1);
  assert.equal(runtime.calls.stopped.length, 1);
});
