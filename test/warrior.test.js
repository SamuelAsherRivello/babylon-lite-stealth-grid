import test from "node:test";
import assert from "node:assert/strict";

import {
  createWarrior,
  loadWarriorAtlases,
} from "../src/enemies/warrior/warrior.js";

function createFakeApi() {
  const calls = {
    loaded: [],
    layers: [],
    played: [],
    stopped: [],
    removed: [],
    updated: [],
  };
  return {
    calls,
    async loadSpriteAtlas(engine, imageUrl, options) {
      calls.loaded.push({ engine, imageUrl, options });
      return { imageUrl };
    },
    createSprite2DLayer(atlas, options) {
      const layer = { atlas, ...options, view: { zoom: 1 } };
      calls.layers.push(layer);
      return layer;
    },
    addSprite2D(layer, options) {
      return { layer, ...options };
    },
    playSprite2DAnimation(manager, sprite, from, to, loop, duration, options) {
      const animation = { manager, sprite, from, to, loop, duration, options };
      calls.played.push(animation);
      return animation;
    },
    stopSpriteAnimation(animation) {
      calls.stopped.push(animation);
    },
    updateSprite2D(sprite, patch) {
      calls.updated.push({ sprite, patch });
      Object.assign(sprite, patch);
    },
    removeSprite2D(sprite) {
      calls.removed.push(sprite);
    },
  };
}

test("warrior shares all five atlases across actor instances", async () => {
  const api = createFakeApi();
  const atlases = await loadWarriorAtlases("engine", api);
  assert.deepEqual(Object.keys(atlases), [
    "idle",
    "walking",
    "attack-1",
    "attack-2",
    "guard",
  ]);
  assert.equal(api.calls.loaded.length, 5);
});

test("warrior renders every action and disposes completely", () => {
  const api = createFakeApi();
  const atlases = Object.fromEntries(
    ["idle", "walking", "attack-1", "attack-2", "guard"]
      .map((name) => [name, { name }]),
  );
  const warrior = createWarrior({
    atlases,
    initialPosition: { x: 352, y: 608 },
    bounds: { width: 576, height: 1024 },
    obstacles: [],
    api,
  });
  assert.equal(api.calls.layers.length, 5);
  warrior.playAnimation("manager");
  assert.equal(api.calls.played.at(-1).sprite.layer.atlas.name, "idle");

  warrior.setMovementIntent({ x: -1, y: 0 });
  warrior.update(0.1);
  assert.equal(api.calls.played.at(-1).sprite.layer.atlas.name, "walking");
  assert.equal(api.calls.played.at(-1).sprite.flipX, true);

  assert.equal(warrior.attack("attack-2", { x: -1, y: 0 }), true);
  const attack = api.calls.played.at(-1);
  assert.equal(attack.sprite.layer.atlas.name, "attack-2");
  assert.equal(attack.loop, false);
  const before = warrior.getPosition();
  assert.deepEqual(warrior.update(1).position, before);
  attack.options.onEnd();
  assert.equal(warrior.state, "walking");

  assert.equal(warrior.setGuarding(true), true);
  assert.equal(warrior.state, "guard");
  assert.equal(api.calls.played.at(-1).sprite.layer.atlas.name, "guard");
  assert.equal(warrior.setGuarding(false), true);
  assert.equal(warrior.state, "walking");

  warrior.dispose();
  assert.equal(api.calls.removed.length, 5);
  const updateCount = api.calls.updated.length;
  warrior.update(1);
  assert.equal(api.calls.updated.length, updateCount);
});
