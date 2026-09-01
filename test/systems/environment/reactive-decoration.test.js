import assert from "node:assert/strict";
import test from "node:test";

import {
  createReactiveDecoration,
  getCenteredEffectPosition,
} from "../../src/systems/environment/decorations/reactive-decoration.js";
import { getYSortedLayerOrder } from "../../src/systems/environment/render-depth.js";

function createHarness(position = { x: 100, y: 200 }, withFire = false) {
  const calls = { animations: [], stopped: [], updates: [], removed: [] };
  const api = {
    createSprite2DLayer(atlas, options) { return { atlas, ...options, view: {} }; },
    addSprite2D(layer, props) { return { layer, ...props }; },
    playSprite2DAnimation(manager, sprite, from, to, loop, delay, options) {
      const animation = { manager, sprite, from, to, loop, delay, options };
      calls.animations.push(animation);
      return animation;
    },
    stopSpriteAnimation(animation) { calls.stopped.push(animation); },
    updateSprite2D(sprite, patch) { calls.updates.push(patch); Object.assign(sprite, patch); },
    removeSprite2D(sprite) { calls.removed.push(sprite); },
    collidersOverlap(a, b) {
      return a.x < b.x + b.width && a.x + a.width > b.x
        && a.y < b.y + b.height && a.y + a.height > b.y;
    },
  };
  const object = {
    id: Math.round(position.x),
    position,
    decoration: {
      frameSize: { width: 128, height: 128 }, frameCount: 8,
      frameDurationMs: 100, idleFrame: 0, resetAfterPlay: true,
      rearmOnExit: true, acceptedCharacterTypes: ["player", "npc", "enemy"],
      sensor: { x: position.x - 24, y: position.y + 8, width: 48, height: 32 },
      combatCollider: { x: position.x - 36, y: position.y + 8, width: 72, height: 72 },
    },
  };
  const fire = withFire ? {
    layer: { visible: false, view: {} },
    playOnce(onEnd) { calls.fireEnd = onEnd; calls.firePlays = (calls.firePlays ?? 0) + 1; },
    dispose() { calls.fireDisposed = true; },
  } : null;
  return {
    calls,
    decoration: createReactiveDecoration({
      object, atlas: { name: "bush" }, animationManager: {}, screenHeight: 1024,
      fireEffect: fire, api,
    }),
  };
}

const character = (id, type = "player", x = 90) => ({
  id, type, collider: { x, y: 215, width: 20, height: 20 },
});

test("fire effect is centered over the bush artwork", () => {
  assert.deepEqual(getCenteredEffectPosition({
    position: { x: 96, y: 160 },
    frameSize: { width: 128, height: 128 },
    effectSize: { width: 64, height: 64 },
    screenHeight: 1024,
  }), [64, 768]);
});

test("bush owns 100 health, a living-only combat collider, and two fire hits", () => {
  const { decoration, calls } = createHarness({ x: 96, y: 160 }, true);
  assert.equal(decoration.health, 100);
  assert.deepEqual(decoration.interactionPosition, { x: 96, y: 204 });
  assert.deepEqual(decoration.cell, { x: 1, y: 3 });
  assert.deepEqual(decoration.getSnapshot().position, { x: 96, y: 204 });
  assert.ok(decoration.getCombatCollider());
  assert.equal(decoration.applyFireDamage(50), true);
  assert.equal(decoration.health, 50);
  assert.equal(decoration.applyFireDamage(50), false);
  calls.fireEnd();
  assert.equal(decoration.applyFireDamage(50), true);
  assert.equal(decoration.health, 0);
  assert.equal(decoration.isAlive, false);
  assert.equal(decoration.getCombatCollider(), null);
  calls.fireEnd();
  assert.equal(decoration.isDying, true);
  decoration.update([], 0.25);
  assert.equal(decoration.isDead, true);
  assert.equal(calls.firePlays, 2);
  assert.equal(calls.fireDisposed, true);
});

test("reactive decoration starts on authored transform and idle frame", () => {
  const { decoration } = createHarness();
  assert.deepEqual(decoration.sprite.positionPx, [97, 864]);
  assert.deepEqual(decoration.sprite.sizePx, [128, 128]);
  assert.equal(decoration.sprite.frame, 0);
  assert.deepEqual(decoration.layer.pivot, [0.5, 0.84]);
  assert.equal(decoration.layer.order, getYSortedLayerOrder(200, 1024));
});

test("supported entry plays once without restart and completion resets frame zero", () => {
  const { decoration, calls } = createHarness();
  decoration.update([character("player-1")]);
  assert.equal(calls.animations.length, 1);
  assert.equal(calls.animations[0].sprite, decoration.sprite);
  assert.deepEqual(
    { from: calls.animations[0].from, to: calls.animations[0].to,
      loop: calls.animations[0].loop, delay: calls.animations[0].delay },
    { from: 0, to: 7, loop: false, delay: 100 },
  );
  decoration.update([character("player-1"), character("npc-1", "npc", 100)]);
  assert.equal(calls.animations.length, 1);
  calls.animations[0].options.onEnd();
  assert.equal(decoration.sprite.frame, 0);
  assert.equal(decoration.playing, false);
  assert.equal(decoration.armed, false);
});

test("non-character is ignored and empty sensor rearms a later entry", () => {
  const { decoration, calls } = createHarness();
  decoration.update([character("arrow", "projectile")]);
  assert.equal(calls.animations.length, 0);
  decoration.update([character("player-1")]);
  calls.animations[0].options.onEnd();
  decoration.update([]);
  assert.equal(decoration.armed, true);
  decoration.update([character("enemy-1", "enemy")]);
  assert.equal(calls.animations.length, 2);
});

test("instances own occupancy and playback independently", () => {
  const first = createHarness();
  const second = createHarness({ x: 400, y: 200 });
  first.decoration.update([character("player-1")]);
  second.decoration.update([character("player-1")]);
  assert.equal(first.calls.animations.length, 1);
  assert.equal(second.calls.animations.length, 0);
  assert.equal(first.decoration.occupantCount, 1);
  assert.equal(second.decoration.occupantCount, 0);
});

test("dispose stops active playback and removes only its sprite", () => {
  const { decoration, calls } = createHarness();
  decoration.update([character("player-1")]);
  decoration.dispose();
  assert.equal(calls.stopped.length, 1);
  assert.deepEqual(calls.removed, [decoration.sprite]);
  decoration.update([character("player-2")]);
  assert.equal(calls.animations.length, 1);
});
