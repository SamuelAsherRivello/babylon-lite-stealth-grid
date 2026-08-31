import test from "node:test";
import assert from "node:assert/strict";

import {
  WARRIOR_ANIMATION_CATALOG,
  WARRIOR_ANIMATION_NAMES,
  validateWarriorAnimationCatalog,
} from "../src/characters/enemies/warrior/warrior-animation-catalog.js";

const EXPECTED = Object.freeze({
  idle: { filename: "warrior-idle.png", frameCount: 8, loop: true },
  walking: { filename: "warrior-run.png", frameCount: 6, loop: true },
  "attack-1": { filename: "warrior-attack-1.png", frameCount: 4, loop: false },
  "attack-2": { filename: "warrior-attack-2.png", frameCount: 4, loop: false },
  guard: { filename: "warrior-guard.png", frameCount: 6, loop: true },
});

test("warrior catalog preserves every supplied animation", () => {
  assert.deepEqual(WARRIOR_ANIMATION_NAMES, Object.keys(EXPECTED));
  assert.equal(
    validateWarriorAnimationCatalog(WARRIOR_ANIMATION_CATALOG),
    WARRIOR_ANIMATION_CATALOG,
  );
  for (const [name, expected] of Object.entries(EXPECTED)) {
    const descriptor = WARRIOR_ANIMATION_CATALOG[name];
    assert.equal(
      descriptor.imageUrl,
      `./assets/enemies/warrior/${expected.filename}`,
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
});

test("warrior catalog rejects inconsistent descriptors", () => {
  assert.throws(
    () => validateWarriorAnimationCatalog({
      ...WARRIOR_ANIMATION_CATALOG,
      guard: { ...WARRIOR_ANIMATION_CATALOG.guard, frameCount: 5 },
    }),
    /guard frameCount/,
  );
});
