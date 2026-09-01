import test from "node:test";
import assert from "node:assert/strict";

import {
  validateAsepriteSpriteDescriptor,
} from "../plugins/aseprite-babylon-lite/index.js";
import {
  PARTICLE_FX_CATALOG,
  PARTICLE_FX_ORDER,
} from "../../src/particle-fx/particle-fx.catalog.js";

const EXPECTED = [
  ["dust01", "Dust 1", "Dust_01.png", 64, 8],
  ["dust02", "Dust 2", "Dust_02.png", 64, 10],
  ["explosion01", "Explosion 1", "Explosion_01.png", 192, 8],
  ["explosion02", "Explosion 2", "Explosion_02.png", 192, 10],
  ["fire01", "Fire 1", "Fire_01.png", 64, 8],
  ["fire02", "Fire 2", "Fire_02.png", 64, 10],
  ["fire03", "Fire 3", "Fire_03.png", 64, 12],
  ["waterSplash", "Water Splash", "Water Splash.png", 192, 9],
];

test("Particle FX catalog captures the inspected Aseprite animation tags", () => {
  assert.deepEqual(PARTICLE_FX_ORDER, EXPECTED.map(([key]) => key));

  for (const [key, name, filename, frameSize, frameCount] of EXPECTED) {
    const descriptor = PARTICLE_FX_CATALOG[key];
    assert.equal(validateAsepriteSpriteDescriptor(descriptor), descriptor);
    assert.equal(descriptor.name, name);
    assert.equal(descriptor.imageUrl, `./assets/particles/${filename}`);
    assert.deepEqual(descriptor.gridSize, [frameSize, frameSize]);
    assert.equal(descriptor.frameCount, frameCount);
    assert.equal(descriptor.direction, "forward");
    assert.equal(descriptor.frameDurationMs, 100);
    assert.equal(descriptor.loop, true);
    assert.deepEqual(descriptor.displaySize, [64, 64]);
    assert.ok(Object.isFrozen(descriptor));
  }

  assert.ok(Object.isFrozen(PARTICLE_FX_CATALOG));
  assert.ok(Object.isFrozen(PARTICLE_FX_ORDER));
});

test("descriptor validation rejects incomplete or unsupported metadata", () => {
  assert.throws(
    () => validateAsepriteSpriteDescriptor({ name: "Broken" }),
    /imageUrl/,
  );
  assert.throws(
    () => validateAsepriteSpriteDescriptor({
      ...PARTICLE_FX_CATALOG.dust01,
      direction: "ping-pong",
    }),
    /direction/,
  );
});
