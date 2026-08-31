import {
  validateAsepriteSpriteDescriptor,
} from "../../../plugins/aseprite-babylon-lite/index.js";

const FRAME_SIZE = 192;
const FRAME_DURATION_MS = 100;
const PIVOT = Object.freeze([0.5, 0.84]);
const EXPECTED = Object.freeze({
  idle: Object.freeze({ frameCount: 7, loop: true }),
  walking: Object.freeze({ frameCount: 6, loop: true }),
  "attack-right": Object.freeze({ frameCount: 6, loop: false }),
  "attack-down": Object.freeze({ frameCount: 6, loop: false }),
  "attack-up": Object.freeze({ frameCount: 6, loop: false }),
});

function createDescriptor(name, filename, frameCount, loop) {
  const descriptor = {
    name,
    imageUrl: `./assets/enemies/goblin/${filename}`,
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

export const GOBLIN_ANIMATION_CATALOG = Object.freeze({
  idle: createDescriptor("Goblin Idle", "goblin-idle.png", 7, true),
  walking: createDescriptor("Goblin Walk", "goblin-walk.png", 6, true),
  "attack-right": createDescriptor(
    "Goblin Attack Right",
    "goblin-attack-right.png",
    6,
    false,
  ),
  "attack-down": createDescriptor(
    "Goblin Attack Down",
    "goblin-attack-down.png",
    6,
    false,
  ),
  "attack-up": createDescriptor(
    "Goblin Attack Up",
    "goblin-attack-up.png",
    6,
    false,
  ),
});

export const GOBLIN_ANIMATION_NAMES = Object.freeze(Object.keys(EXPECTED));

export function validateGoblinAnimationCatalog(catalog) {
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

validateGoblinAnimationCatalog(GOBLIN_ANIMATION_CATALOG);
