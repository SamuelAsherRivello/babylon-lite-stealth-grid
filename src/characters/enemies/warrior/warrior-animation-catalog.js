import {
  validateAsepriteSpriteDescriptor,
} from "../../../../plugins/aseprite-babylon-lite/index.js";

const FRAME_SIZE = 192;
const FRAME_DURATION_MS = 100;
const PIVOT = Object.freeze([0.5, 0.84]);
const EXPECTED = Object.freeze({
  idle: Object.freeze({ frameCount: 8, loop: true }),
  walking: Object.freeze({ frameCount: 6, loop: true }),
  "attack-1": Object.freeze({ frameCount: 4, loop: false }),
  "attack-2": Object.freeze({ frameCount: 4, loop: false }),
  guard: Object.freeze({ frameCount: 6, loop: true }),
});

function createDescriptor(name, filename, frameCount, loop) {
  const descriptor = {
    name,
    imageUrl: `./assets/enemies/warrior/${filename}`,
    gridSize: Object.freeze([FRAME_SIZE, FRAME_SIZE]),
    frameCount,
    direction: "forward",
    frameDurationMs: FRAME_DURATION_MS,
    loop,
    displaySize: Object.freeze([FRAME_SIZE, FRAME_SIZE]),
    pivot: PIVOT,
    sampling: "nearest",
  };
  validateAsepriteSpriteDescriptor(descriptor);
  return Object.freeze(descriptor);
}

export const WARRIOR_ANIMATION_CATALOG = Object.freeze({
  idle: createDescriptor("Warrior Idle", "warrior-idle.png", 8, true),
  walking: createDescriptor("Warrior Run", "warrior-run.png", 6, true),
  "attack-1": createDescriptor(
    "Warrior Attack 1",
    "warrior-attack-1.png",
    4,
    false,
  ),
  "attack-2": createDescriptor(
    "Warrior Attack 2",
    "warrior-attack-2.png",
    4,
    false,
  ),
  guard: createDescriptor("Warrior Guard", "warrior-guard.png", 6, true),
});

export const WARRIOR_ANIMATION_NAMES = Object.freeze(Object.keys(EXPECTED));

export function validateWarriorAnimationCatalog(catalog) {
  for (const [name, expected] of Object.entries(EXPECTED)) {
    const descriptor = catalog?.[name];
    validateAsepriteSpriteDescriptor(descriptor);
    if (descriptor.frameCount !== expected.frameCount) {
      throw new TypeError(`${name} frameCount must be ${expected.frameCount}.`);
    }
    if (descriptor.loop !== expected.loop) {
      throw new TypeError(`${name} loop must be ${expected.loop}.`);
    }
    if (
      descriptor.gridSize[0] !== FRAME_SIZE
      || descriptor.gridSize[1] !== FRAME_SIZE
    ) {
      throw new TypeError(`${name} gridSize must be 192 by 192.`);
    }
    if (descriptor.frameDurationMs !== FRAME_DURATION_MS) {
      throw new TypeError(`${name} frameDurationMs must be 100.`);
    }
  }
  return catalog;
}

validateWarriorAnimationCatalog(WARRIOR_ANIMATION_CATALOG);
