import test from "node:test";
import assert from "node:assert/strict";
import { createSpriteAnimationManager, updateSpriteAnimationManager } from "@babylonjs/lite";
import { createArcher } from "../../src/characters/enemies/archer/archer.js";

test("calibration forces one shot and holds the release pose indefinitely", () => {
  const atlas = { frames: Array.from({ length: 6 }, () => ({ uvMin: [0, 0], uvMax: [1, 1], sourceSizePx: [192, 192] })) };
  const shots = [];
  const actor = createArcher({ atlases: { idle: atlas, walking: atlas, shooting: atlas }, initialPosition: { x: 320, y: 320 }, bounds: { width: 1024, height: 1024 }, calibrateArrow: true, onShoot: (...args) => shots.push(args) });
  const manager = createSpriteAnimationManager();
  actor.playAnimation(manager);
  for (let i = 0; i < 100; i++) {
    updateSpriteAnimationManager(manager, 50);
    actor.setMovementIntent({ x: 1, y: 0 });
    actor.update(0.05);
  }
  assert.equal(shots.length, 1);
  assert.equal(actor.state, "shooting");
  assert.deepEqual(actor.getPosition(), { x: 320, y: 320 });
  assert.deepEqual(shots[0][0], { x: 336, y: 375 });
  assert.equal(actor.isMovementLocked(), true);
  actor.dispose();
});
