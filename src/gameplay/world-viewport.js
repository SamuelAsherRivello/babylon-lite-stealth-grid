export function gridCellToWorldCenter(cell, tileSize) {
  if (!cell || !Number.isFinite(cell.x) || !Number.isFinite(cell.y) || !Number.isFinite(tileSize) || tileSize <= 0) throw new TypeError("cell and a positive tileSize are required");
  return { x: (cell.x + 0.5) * tileSize, y: (cell.y + 0.5) * tileSize };
}
