export const TILE_MAP_SUB_Z = Object.freeze({
  backgroundWater: 0, animatedWaterFoam: 10, ground: 20,
  elevationShadows: 30, elevatedTerrain: 40, groundDecorations: 50,
  ySortedProps: 60, foregroundArtwork: 70,
});

export const GAME_DEPTH = Object.freeze({
  tileMap: 0, npcs: 100, player: 200, projectiles: 300, effects: 400,
  foreground: 500,
});

export const DOM_Z = Object.freeze({
  coordinateGuide: 1000, coordinates: 1010, releaseMetadata: 1020,
  settingsGear: 1030, virtualController: 1040, settingsBackdrop: 2000,
  settingsWindow: 2010, settingsClose: 2020, error: 3000,
});

export function getYSortedLayerOrder(worldY, screenHeight) {
  if (!Number.isFinite(worldY) || !Number.isFinite(screenHeight) || screenHeight <= 0) {
    throw new TypeError("worldY and a positive screenHeight are required");
  }
  const normalizedScreenY = Math.min(1, Math.max(0, (screenHeight - worldY) / screenHeight));
  return GAME_DEPTH.npcs + normalizedScreenY * (GAME_DEPTH.player - GAME_DEPTH.npcs - 1);
}
