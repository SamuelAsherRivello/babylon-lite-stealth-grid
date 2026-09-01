import { validateAsepriteSpriteDescriptor } from "../../../../plugins/aseprite-babylon-lite/index.js";

const FRAME = 192;
const EXPECTED = Object.freeze({ idle: [6, true], walking: [4, true], heal: [11, false], "heal-effect": [11, false] });

function descriptor(name, filename, frameCount, loop) {
  const value = { name, imageUrl: `./assets/enemies/monk/${filename}`, gridSize: [FRAME, FRAME], frameCount, direction: "forward", frameDurationMs: 100, loop, displaySize: [FRAME, FRAME], pivot: [0.5, 0.84], sampling: "nearest" };
  validateAsepriteSpriteDescriptor(value);
  return Object.freeze(value);
}

export const MONK_ANIMATION_CATALOG = Object.freeze({
  idle: descriptor("Monk Idle", "monk-idle.png", 6, true),
  walking: descriptor("Monk Run", "monk-run.png", 4, true),
  heal: descriptor("Monk Heal", "monk-heal.png", 11, false),
  "heal-effect": descriptor("Monk Heal Effect", "monk-heal-effect.png", 11, false),
});
export const MONK_ANIMATION_NAMES = Object.freeze(Object.keys(EXPECTED));

export function validateMonkAnimationCatalog(catalog = MONK_ANIMATION_CATALOG) {
  for (const [name, [frames, loop]] of Object.entries(EXPECTED)) {
    const item = catalog[name];
    validateAsepriteSpriteDescriptor(item);
    if (item.frameCount !== frames || item.loop !== loop || item.gridSize[0] !== FRAME || item.gridSize[1] !== FRAME) throw new TypeError(`${name} descriptor is invalid.`);
  }
  return catalog;
}
validateMonkAnimationCatalog();
