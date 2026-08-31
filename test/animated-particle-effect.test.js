import test from "node:test";
import assert from "node:assert/strict";

import { AnimatedParticleEffect } from "../src/particle-fx/AnimatedParticleEffect.js";
import { PARTICLE_FX_CATALOG } from "../src/particle-fx/particle-fx.catalog.js";

function createMockApi() {
  const calls = [];
  const api = {
    async loadSpriteAtlas(engine, imageUrl, options) {
      calls.push(["loadSpriteAtlas", engine, imageUrl, options]);
      return { id: "atlas" };
    },
    createSprite2DLayer(atlas, options) {
      calls.push(["createSprite2DLayer", atlas, options]);
      return { id: "layer", view: { zoom: 1 } };
    },
    addSprite2D(layer, options) {
      calls.push(["addSprite2D", layer, options]);
      return { id: "sprite" };
    },
    playSprite2DAnimation(manager, sprite, from, to, loop, delayMs) {
      calls.push(["playSprite2DAnimation", manager, sprite, from, to, loop, delayMs]);
      return { id: "animation", current: from };
    },
    playSpriteFrameAnimation(animation, from, to, loop, delayMs) {
      calls.push(["playSpriteFrameAnimation", animation, from, to, loop, delayMs]);
      animation.current = from;
    },
    stopSpriteAnimation(animation) {
      calls.push(["stopSpriteAnimation", animation]);
    },
  };
  return { api, calls };
}

class TestParticleEffect extends AnimatedParticleEffect {
  static descriptor = PARTICLE_FX_CATALOG.explosion01;
}

test("particle construction uses native atlas geometry and a capacity-one layer", async () => {
  const { api, calls } = createMockApi();
  const engine = { id: "engine" };
  const animationManager = { animations: [] };
  const effect = await TestParticleEffect.create({
    engine,
    animationManager,
    position: [160, 480],
    order: 3,
    api,
  });

  assert.equal(effect.descriptor, PARTICLE_FX_CATALOG.explosion01);
  assert.deepEqual(calls[0], [
    "loadSpriteAtlas",
    engine,
    "./assets/particles/Explosion_01.png",
    { gridSize: [192, 192], sampling: "nearest" },
  ]);
  assert.deepEqual(calls[1], [
    "createSprite2DLayer",
    { id: "atlas" },
    { capacity: 1, order: 3, pivot: [0, 0] },
  ]);
  assert.deepEqual(calls[2], [
    "addSprite2D",
    effect.layer,
    { positionPx: [160, 480], sizePx: [64, 64], frame: 0 },
  ]);
  assert.equal(effect.sprite.id, "sprite");
});

test("play and stop are idempotent and reuse one animation handle", async () => {
  const { api, calls } = createMockApi();
  const effect = await TestParticleEffect.create({
    engine: {},
    animationManager: { animations: [] },
    position: [0, 0],
    api,
  });
  const originalSprite = effect.sprite;

  effect.play();
  effect.play();
  effect.stop();
  effect.stop();
  effect.play();

  assert.equal(calls.filter(([name]) => name === "playSprite2DAnimation").length, 1);
  assert.equal(calls.filter(([name]) => name === "playSpriteFrameAnimation").length, 2);
  assert.equal(calls.filter(([name]) => name === "stopSpriteAnimation").length, 1);
  const initialPlay = calls.find(([name]) => name === "playSprite2DAnimation");
  const replays = calls.filter(([name]) => name === "playSpriteFrameAnimation");
  assert.deepEqual(initialPlay.slice(3), [0, 7, true, 100]);
  assert.deepEqual(replays.map((call) => call.slice(2)), [
    [0, 7, true, 100],
    [0, 7, true, 100],
  ]);
  assert.equal(effect.sprite, originalSprite);
  assert.equal(effect.isPlaying, true);
});
