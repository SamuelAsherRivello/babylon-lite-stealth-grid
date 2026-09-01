import {
  validateAsepriteSpriteDescriptor,
} from "../../../../plugins/aseprite-babylon-lite/index.js";

const FRAME_SIZE = 320;
const FRAME_HEIGHT = 320;
const FRAME_DURATION_MS = 100;
const PIVOT = Object.freeze([0.5, 0.84]);
const EXPECTED = Object.freeze({
  idle: Object.freeze({ frameCount: 12, loop: true }),
  walking: Object.freeze({ frameCount: 6, loop: true }),
  "attack-1": Object.freeze({ frameCount: 3, loop: false }),
  "attack-2": Object.freeze({ frameCount: 3, loop: false }),
  guard: Object.freeze({ frameCount: 6, loop: true }),
});

function createDescriptor(name, filename, frameCount, loop) {
  const descriptor = {
    name,
    imageUrl: `./assets/enemies/lancer/${filename}`,
    gridSize: Object.freeze([FRAME_SIZE, FRAME_HEIGHT]),
    frameCount,
    direction: "forward",
    frameDurationMs: FRAME_DURATION_MS,
    loop,
    displaySize: Object.freeze([FRAME_SIZE, FRAME_HEIGHT]),
    pivot: PIVOT,
    sampling: "nearest",
  };
  validateAsepriteSpriteDescriptor(descriptor);
  return Object.freeze(descriptor);
}

export const LANCER_ANIMATION_CATALOG = Object.freeze({
  idle: createDescriptor("Lancer Idle", "Lancer_Idle.png", 12, true),
  walking: createDescriptor("Lancer Run", "Lancer_Run.png", 6, true),
  "attack-1": createDescriptor("Lancer Down Attack", "Lancer_Down_Attack.png", 3, false),
  "attack-2": createDescriptor("Lancer Right Attack", "Lancer_Right_Attack.png", 3, false),
  guard: createDescriptor("Lancer Down Defence", "Lancer_Down_Defence.png", 6, true),
  "attack-down-right": createDescriptor("Lancer DownRight Attack", "Lancer_DownRight_Attack.png", 3, false),
  "attack-up": createDescriptor("Lancer Up Attack", "Lancer_Up_Attack.png", 3, false),
  "attack-up-right": createDescriptor("Lancer UpRight Attack", "Lancer_UpRight_Attack.png", 3, false),
  "defence-down-right": createDescriptor("Lancer DownRight Defence", "Lancer_DownRight_Defence.png", 6, true),
  "defence-right": createDescriptor("Lancer Right Defence", "Lancer_Right_Defence.png", 6, true),
  "defence-up": createDescriptor("Lancer Up Defence", "Lancer_Up_Defence.png", 6, true),
  "defence-up-right": createDescriptor("Lancer UpRight Defence", "Lancer_UpRight_Defence.png", 6, true),
});

export const LANCER_ANIMATION_NAMES = Object.freeze(Object.keys(LANCER_ANIMATION_CATALOG));

export function validateLancerAnimationCatalog(catalog) {
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
      || descriptor.gridSize[1] !== FRAME_HEIGHT
    ) {
      throw new TypeError(`${name} gridSize must be 320 by 320.`);
    }
    if (descriptor.frameDurationMs !== FRAME_DURATION_MS) {
      throw new TypeError(`${name} frameDurationMs must be 100.`);
    }
  }
  return catalog;
}

validateLancerAnimationCatalog(LANCER_ANIMATION_CATALOG);
