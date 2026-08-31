// Provisional: non-empty cliff and rock frames that fill their cells.
export const NON_WALKABLE_TERRAIN_FRAMES = new Set([
  41, 42, 43, 44,
  50, 51, 52, 53,
]);

export const PARTIAL_TERRAIN_COLLIDERS = new Map([
  [48, [
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 0, y: 0 },
  ]],
  [45, [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 0 },
  ]],
]);
