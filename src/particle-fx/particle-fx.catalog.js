import { validateAsepriteSpriteDescriptor } from "../../plugins/aseprite-babylon-lite/index.js";

function createDescriptor(name, filename, frameSize, frameCount) {
  const descriptor = {
    name,
    imageUrl: `./assets/particles/${filename}`,
    gridSize: Object.freeze([frameSize, frameSize]),
    frameCount,
    direction: "forward",
    frameDurationMs: 100,
    loop: true,
    displaySize: Object.freeze([64, 64]),
    pivot: Object.freeze([0, 0]),
    sampling: "nearest",
  };

  validateAsepriteSpriteDescriptor(descriptor);
  return Object.freeze(descriptor);
}

export const PARTICLE_FX_CATALOG = Object.freeze({
  dust01: createDescriptor("Dust 1", "Dust_01.png", 64, 8),
  dust02: createDescriptor("Dust 2", "Dust_02.png", 64, 10),
  explosion01: createDescriptor("Explosion 1", "Explosion_01.png", 192, 8),
  explosion02: createDescriptor("Explosion 2", "Explosion_02.png", 192, 10),
  fire01: createDescriptor("Fire 1", "Fire_01.png", 64, 8),
  fire02: createDescriptor("Fire 2", "Fire_02.png", 64, 10),
  fire03: createDescriptor("Fire 3", "Fire_03.png", 64, 12),
  waterSplash: createDescriptor("Water Splash", "Water Splash.png", 192, 9),
});

export const PARTICLE_FX_ORDER = Object.freeze([
  "dust01",
  "dust02",
  "explosion01",
  "explosion02",
  "fire01",
  "fire02",
  "fire03",
  "waterSplash",
]);
