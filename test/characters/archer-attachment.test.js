import test from "node:test";
import assert from "node:assert/strict";
import { createSpriteAnimationManager, updateSpriteAnimationManager } from "@babylonjs/lite";
import { createArcher } from "../../src/characters/enemies/archer/archer.js";

for (const facing of [1, -1]) test(`archer releases at frame 5 with approved attachment, facing ${facing}, then resumes`, () => {
  const atlas = { frames: Array.from({ length: 6 }, () => ({ uvMin: [0, 0], uvMax: [1, 1], sourceSizePx: [192, 192] })) };
  const shots = [];
  const actor = createArcher({ atlases: { idle: atlas, walking: atlas, shooting: atlas }, initialPosition: { x: 320, y: 320 }, bounds: { width: 1024, height: 1024 }, onShoot: (...args) => shots.push(args) });
  const manager = createSpriteAnimationManager();
  actor.playAnimation(manager);
  actor.shootAt({ x: 320 + facing * 128, y: 320 });
  for (let i = 0; i < 4; i++) {
    updateSpriteAnimationManager(manager, 101);
    actor.update(0.101);
  }
  assert.equal(shots.length, 0, "frame 4 must not release the arrow");
  actor.update(0.5);
  assert.equal(shots.length, 0, "elapsed time must not release before the displayed frame");
  updateSpriteAnimationManager(manager, 101);
  actor.update(0.1);
  assert.equal(shots.length, 1);
  assert.equal(actor.state, "shooting");
  assert.deepEqual(actor.getPosition(), { x: 320, y: 320 });
  assert.deepEqual(shots[0][0], { x: 320 + facing * 24.48, y: 349.55 });
  assert.equal(shots[0][2].initialRotation, (facing < 0 ? Math.atan2(-55, -64) : Math.PI - Math.atan2(-55, -64)) - facing * Math.PI / 180);
  assert.equal(actor.isMovementLocked(), true);
  updateSpriteAnimationManager(manager, 101);
  assert.equal(actor.state, "recovering");
  actor.update(2);
  assert.equal(actor.state, "idle");
  assert.equal(actor.isMovementLocked(), false);
  assert.equal(shots.length, 1);
  actor.dispose();
});
