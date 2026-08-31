const FRAME_SIZE = 192;
const FRAME_DURATION_MS = 100;

export const PLAYER_PAWN_FRAME = Object.freeze({
  width: FRAME_SIZE,
  height: FRAME_SIZE,
});

export const PLAYER_WEAPONS = Object.freeze([
  "axe",
  "hammer",
  "knife",
  "pickaxe",
]);

export const PLAYER_ITEMS = Object.freeze(["gold", "meat", "wood"]);

export const PLAYER_WEAPON_DAMAGE = Object.freeze({
  knife: 10,
  pickaxe: 20,
  axe: 30,
  hammer: 40,
});

const frameCounts = Object.freeze({ idle: 8, run: 6 });

function imageUrl(filename) {
  return `./assets/player/pawn/${filename}`;
}

function descriptor(name, filename, frameCount, loop) {
  return Object.freeze({
    name,
    imageUrl: imageUrl(filename),
    gridSize: Object.freeze([FRAME_SIZE, FRAME_SIZE]),
    frameCount,
    direction: "forward",
    frameDurationMs: FRAME_DURATION_MS,
    loop,
    displaySize: Object.freeze([FRAME_SIZE, FRAME_SIZE]),
    pivot: Object.freeze([0.5, 0.78]),
    sampling: "nearest",
  });
}

function createLoadoutAnimations(kind, value) {
  const suffix = value ? ` ${value[0].toUpperCase()}${value.slice(1)}` : "";
  const fileSuffix = value ? ` ${value[0].toUpperCase()}${value.slice(1)}` : "";
  return {
    idle: descriptor(`Pawn Idle${suffix}`, `Pawn_Idle${fileSuffix}.png`, frameCounts.idle, true),
    run: descriptor(`Pawn Run${suffix}`, `Pawn_Run${fileSuffix}.png`, frameCounts.run, true),
    ...(kind === "weapon" && value ? {
      attack: descriptor(`Pawn ${value} Attack`, `Pawn_Interact ${value[0].toUpperCase()}${value.slice(1)}.png`,
        value === "hammer" ? 3 : value === "knife" ? 4 : 6, false),
    } : {}),
  };
}

export const PLAYER_PAWN_ANIMATION_CATALOG = Object.freeze({
  empty: Object.freeze(createLoadoutAnimations("empty", "")),
  items: Object.freeze(Object.fromEntries(
    PLAYER_ITEMS.map((item) => [item, Object.freeze(createLoadoutAnimations("item", item))]),
  )),
  weapons: Object.freeze(Object.fromEntries(
    PLAYER_WEAPONS.map((weapon) => [weapon, Object.freeze(createLoadoutAnimations("weapon", weapon))]),
  )),
});

export function cycleLoadout(current, values) {
  const cycle = [null, ...values];
  const index = cycle.indexOf(current);
  return cycle[(index + 1) % cycle.length];
}

export function validatePlayerPawnCatalog(catalog = PLAYER_PAWN_ANIMATION_CATALOG) {
  for (const animation of Object.values(catalog.empty)) {
    if (animation.gridSize[0] !== FRAME_SIZE || animation.gridSize[1] !== FRAME_SIZE) {
      throw new TypeError("Pawn animations must use 192x192 cells.");
    }
  }
  return catalog;
}

validatePlayerPawnCatalog();
