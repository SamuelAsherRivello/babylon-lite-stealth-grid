export function createSelectionSystem(grid) {
  let selectedGridSpot = null;
  const isValid = (cell) => cell
    && Number.isInteger(cell.x)
    && Number.isInteger(cell.y)
    && cell.x >= 0 && cell.x < grid.columns
    && cell.y >= 0 && cell.y < grid.rows;

  return {
    getSelectedGridSpot() {
      return selectedGridSpot ? { ...selectedGridSpot } : null;
    },
    toggleGridSpot(cell) {
      if (!isValid(cell)) return null;
      if (selectedGridSpot?.x === cell.x && selectedGridSpot?.y === cell.y) {
        selectedGridSpot = null;
      } else {
        selectedGridSpot = { x: cell.x, y: cell.y };
      }
      return selectedGridSpot ? { ...selectedGridSpot } : null;
    },
  };
}

export function gridSpotFromLogicalPoint(point, grid) {
  const cell = {
    x: Math.floor(point.x / grid.tileSizePx),
    y: Math.floor((grid.heightPx - point.y) / grid.tileSizePx),
  };
  return cell.x >= 0 && cell.x < grid.columns && cell.y >= 0 && cell.y < grid.rows
    ? cell
    : null;
}
