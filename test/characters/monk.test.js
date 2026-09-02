import test from "node:test";
import assert from "node:assert/strict";
import { createMonk } from "../../src/characters/enemies/monk/monk.js";

test("Monk moves when given patrol intent and loops its walking animation", () => {
  const calls = [];
  const api = {
    createSprite2DLayer: (atlas, options) => ({ atlas, ...options }),
    addSprite2D: (layer, options) => ({ layer, ...options }),
    updateSprite2D: () => {},
    playSprite2DAnimation: (_manager, sprite, from, to, loop) => {
      calls.push({ sprite, from, to, loop });
      return {};
    },
    stopSpriteAnimation: () => {}, removeSprite2D: () => {},
  };
  const atlases = Object.fromEntries(["idle", "walking", "heal", "heal-effect"]
    .map((name) => [name, { name }]));
  const monk = createMonk({ atlases, initialPosition: { x: 100, y: 100 }, bounds: { width: 576, height: 1024 }, runtimeApi: api });
  monk.playAnimation({});
  monk.setMovementIntent({ x: 1, y: 0 });
  monk.update(1);
  assert.deepEqual(monk.getPosition(), { x: 220, y: 100 });
  assert.equal(calls.at(-1).to, 3);
  assert.equal(calls.at(-1).loop, true);
  monk.dispose();
});
