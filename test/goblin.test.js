import test from "node:test";
import assert from "node:assert/strict";

import {
  GOBLIN_ANIMATION_NAMES,
} from "../src/characters/enemies/goblin/goblin-animation-catalog.js";
import {
  GOBLIN_MOVEMENT_COLLIDER,
  createGoblin,
  loadGoblinAtlases,
} from "../src/characters/enemies/goblin/goblin.js";
import { GAME_DEPTH } from "../src/systems/environment/render-depth.js";

function createApi() {
  const calls = {
    added: [],
    layers: [],
    loaded: [],
    played: [],
    removed: [],
    stopped: [],
    updated: [],
  };
  return {
    calls,
    addSprite2D(layer, options) {
      const sprite = { layer, options };
      calls.added.push({ layer, options, sprite });
      return sprite;
    },
    createSprite2DLayer(atlas, options) {
      const layer = { atlas, ...options };
      calls.layers.push(layer);
      return layer;
    },
    async loadSpriteAtlas(engine, url, options) {
      const atlas = { engine, url, options };
      calls.loaded.push(atlas);
      return atlas;
    },
    playSprite2DAnimation(manager, sprite, from, to, loop, duration, options) {
      const animation = { manager, sprite, from, to, loop, duration, options };
      calls.played.push(animation);
      return animation;
    },
    removeSprite2D(sprite) {
      calls.removed.push(sprite);
    },
    stopSpriteAnimation(animation) {
      calls.stopped.push(animation);
    },
    updateSprite2D(sprite, options) {
      calls.updated.push({ sprite, options });
    },
  };
}

test("goblin collider matches the player's art-baseline offset", () => {
  assert.equal(GOBLIN_MOVEMENT_COLLIDER.y, 123);
  assert.equal(GOBLIN_MOVEMENT_COLLIDER.x, 96);
  assert.equal(GOBLIN_MOVEMENT_COLLIDER.radius, 24);
});

test("goblin atlases load once as nearest 192 pixel grids", async () => {
  const api = createApi();
  const engine = {};
  const atlases = await loadGoblinAtlases(engine, api);

  assert.deepEqual(Object.keys(atlases), GOBLIN_ANIMATION_NAMES);
  assert.equal(api.calls.loaded.length, 5);
  for (const loaded of api.calls.loaded) {
    assert.equal(loaded.engine, engine);
    assert.deepEqual(loaded.options, {
      gridSize: [192, 192],
      sampling: "nearest",
    });
  }
});

test("goblin starts idle, switches locomotion, and mirrors left", () => {
  const api = createApi();
  const atlases = Object.fromEntries(
    GOBLIN_ANIMATION_NAMES.map((name) => [name, { name }]),
  );
  const goblin = createGoblin({
    atlases,
    initialPosition: { x: 200, y: 300 },
    bounds: { width: 1000, height: 800 },
    obstacles: [],
    movementSpeed: 100,
    api,
  });

  assert.equal(goblin.state, "idle");
  assert.equal(api.calls.layers.find((layer) => layer.atlas.name === "idle").visible, true);
  assert.deepEqual(api.calls.added[0].options.positionPx, [200, 500]);

  goblin.playAnimation({});
  assert.ok(
    api.calls.layers.every(({ order }) => (
      order >= GAME_DEPTH.npcs && order < GAME_DEPTH.player
    )),
  );
  assert.deepEqual(
    api.calls.played.map(({ from, to, loop, duration }) => ({
      from,
      to,
      loop,
      duration,
    })),
    [{ from: 0, to: 6, loop: true, duration: 100 }],
  );

  goblin.setMovementIntent({ x: -1, y: 0 });
  const result = goblin.update(0.5);
  assert.equal(result.state, "walking");
  assert.deepEqual(result.position, { x: 150, y: 300 });
  assert.equal(api.calls.played.at(-1).to, 4);
  assert.equal(api.calls.played.at(-1).loop, true);
  assert.ok(
    api.calls.updated
      .slice(-GOBLIN_ANIMATION_NAMES.length)
      .every(({ options }) => options.flipX === true),
  );
});

test("goblin attack is atomic and disposal removes every sprite", () => {
  const api = createApi();
  const atlases = Object.fromEntries(
    GOBLIN_ANIMATION_NAMES.map((name) => [name, { name }]),
  );
  const goblin = createGoblin({
    atlases,
    initialPosition: { x: 200, y: 300 },
    bounds: { width: 1000, height: 800 },
    obstacles: [],
    api,
  });
  goblin.playAnimation({});
  goblin.setMovementIntent({ x: 1, y: 0 });

  assert.equal(goblin.attack({ x: -1, y: 0 }), true);
  assert.equal(goblin.attack({ x: 0, y: 1 }), false);
  const attack = api.calls.played.at(-1);
  assert.equal(attack.sprite.layer.atlas.name, "attack-right");
  assert.equal(attack.loop, false);
  assert.equal(attack.to, 4);
  const before = goblin.getPosition();
  assert.deepEqual(goblin.update(1).position, before);

  attack.options.onEnd();
  assert.equal(goblin.state, "walking");
  goblin.dispose();
  assert.equal(api.calls.removed.length, 5);
  assert.equal(api.calls.stopped.at(-1), api.calls.played.at(-1));
  const updateCount = api.calls.updated.length;
  goblin.update(1);
  assert.equal(api.calls.updated.length, updateCount);
});
