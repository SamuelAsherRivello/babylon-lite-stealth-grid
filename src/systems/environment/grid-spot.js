import { GRID } from "./grid-contract.js";

function positive(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive finite number`);
  }
  return value;
}

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  return value;
}

function getGridSize(grid) {
  const source = grid ?? GRID;
  return {
    width: positive(source.width ?? source.tileSizePx, "grid.width"),
    height: positive(source.height ?? source.tileSizePx, "grid.height"),
  };
}

// Cell boundaries fall between adjacent cell centers. The ceiling form keeps
// an exact boundary in the lower/current cell and changes only after crossing.
function quantizeAxis(position, size) {
  const cell = Math.ceil(position / size - 1);
  return Object.is(cell, -0) ? 0 : cell;
}

export class GridSpot {
  constructor(initialCenter, grid = GRID) {
    this.grid = getGridSize(grid);
    this.update(initialCenter);
  }

  update(center) {
    const x = finite(center?.x, "center.x");
    const y = finite(center?.y, "center.y");
    this.center = Object.freeze({ x, y });
    this.cell = Object.freeze({
      x: quantizeAxis(x, this.grid.width),
      y: quantizeAxis(y, this.grid.height),
    });
    return this;
  }

  get cellCenter() {
    return Object.freeze({
      x: (this.cell.x + 0.5) * this.grid.width,
      y: (this.cell.y + 0.5) * this.grid.height,
    });
  }

  getMarkerCommand() {
    const center = this.cellCenter;
    return { x: center.x, y: center.y };
  }
}

export function getQuantizedGridCell(center, grid = GRID) {
  return new GridSpot(center, grid).cell;
}

export function getGridSpotCenter(cell, grid = GRID) {
  const size = getGridSize(grid);
  if (!Number.isInteger(cell?.x) || !Number.isInteger(cell?.y)) {
    throw new TypeError("grid cell coordinates must be integers");
  }
  return {
    x: (cell.x + 0.5) * size.width,
    y: (cell.y + 0.5) * size.height,
  };
}
