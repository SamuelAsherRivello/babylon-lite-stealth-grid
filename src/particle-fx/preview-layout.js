import { PARTICLE_FX_CATALOG, PARTICLE_FX_ORDER } from "./particle-fx.catalog.js";

export function createParticleFxPreviewLayout(viewportWidth, viewportHeight) {
  const cellSize = 64;
  const rowWidth = PARTICLE_FX_ORDER.length * cellSize;
  const startX = (viewportWidth - rowWidth) / 2;
  const startY = (viewportHeight - cellSize) / 2;

  return PARTICLE_FX_ORDER.map((key, index) => ({
    key,
    position: [startX + index * cellSize, startY],
    displaySize: PARTICLE_FX_CATALOG[key].displaySize,
    order: 3,
  }));
}
