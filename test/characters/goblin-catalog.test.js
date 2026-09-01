import test from "node:test";
import assert from "node:assert/strict";

import {
  GOBLIN_ANIMATION_CATALOG,
  GOBLIN_ANIMATION_NAMES,
  validateGoblinAnimationCatalog,
} from "../../src/characters/enemies/goblin/goblin-animation-catalog.js";

const EXPECTED = Object.freeze({
  idle: { filename: "goblin-idle.png", frameCount: 7, loop: true },
  walking: { filename: "goblin-walk.png", frameCount: 5, loop: true },
  "attack-right": {
    filename: "goblin-attack-right.png",
    frameCount: 5,
    loop: false,
  },
  "attack-down": {
    filename: "goblin-attack-down.png",
    frameCount: 5,
    loop: false,
  },
  "attack-up": {
    filename: "goblin-attack-up.png",
    frameCount: 6,
    loop: false,
  },
});

test("goblin catalog matches the verified Torch tags", () => {
  assert.deepEqual(GOBLIN_ANIMATION_NAMES, Object.keys(EXPECTED));
  assert.equal(
    validateGoblinAnimationCatalog(GOBLIN_ANIMATION_CATALOG),
    GOBLIN_ANIMATION_CATALOG,
  );

  for (const [name, expected] of Object.entries(EXPECTED)) {
    const descriptor = GOBLIN_ANIMATION_CATALOG[name];
    assert.equal(
      descriptor.imageUrl,
      `./assets/enemies/goblin/${expected.filename}`,
    );
    assert.deepEqual(descriptor.gridSize, [192, 192]);
    assert.deepEqual(descriptor.displaySize, [192, 192]);
    assert.deepEqual(descriptor.pivot, [0.5, 0.84]);
    assert.equal(descriptor.frameCount, expected.frameCount);
    assert.equal(descriptor.frameDurationMs, 100);
    assert.equal(descriptor.loop, expected.loop);
    assert.equal(descriptor.sampling, "nearest");
    assert.ok(Object.isFrozen(descriptor));
  }
  assert.ok(Object.isFrozen(GOBLIN_ANIMATION_CATALOG));
  assert.ok(Object.isFrozen(GOBLIN_ANIMATION_NAMES));
});

test("goblin catalog rejects inconsistent descriptors", () => {
  assert.throws(
    () => validateGoblinAnimationCatalog({
      ...GOBLIN_ANIMATION_CATALOG,
      idle: { ...GOBLIN_ANIMATION_CATALOG.idle, frameCount: 6 },
    }),
    /idle frameCount/,
  );
  assert.throws(
    () => validateGoblinAnimationCatalog({
      ...GOBLIN_ANIMATION_CATALOG,
      "attack-up": { ...GOBLIN_ANIMATION_CATALOG["attack-up"], loop: true },
    }),
    /attack-up loop/,
  );
});
