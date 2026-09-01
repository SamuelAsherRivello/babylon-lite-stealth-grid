import { GRID } from "../systems/environment/grid-contract.js";

const DEFAULT_ART_OFFSET = Object.freeze({ x: 0, y: 0 });
const DEFAULT_ART_PIVOT = Object.freeze({ x: 0.5, y: 1 });

function finite(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be finite`);
  }
  return value;
}

function positive(value, name) {
  finite(value, name);
  if (value <= 0) throw new RangeError(`${name} must be positive`);
  return value;
}

export function createCharacterDefinition({
  id,
  frame,
  displaySize = frame,
  movementCollider,
  artOffset = DEFAULT_ART_OFFSET,
  artPivot = DEFAULT_ART_PIVOT,
  animations = null,
}) {
  if (typeof id !== "string" || id.length === 0) {
    throw new TypeError("character id is required");
  }
  const frameWidth = positive(frame?.width, "frame.width");
  const frameHeight = positive(frame?.height, "frame.height");
  const displayWidth = positive(displaySize?.width, "displaySize.width");
  const displayHeight = positive(displaySize?.height, "displaySize.height");
  const pivot = {
    x: finite(artPivot?.x, "artPivot.x"),
    y: finite(artPivot?.y, "artPivot.y"),
  };
  if (pivot.x < 0 || pivot.x > 1 || pivot.y < 0 || pivot.y > 1) {
    throw new RangeError("artPivot values must be between 0 and 1");
  }
  const offset = {
    x: finite(artOffset?.x, "artOffset.x"),
    y: finite(artOffset?.y, "artOffset.y"),
  };
  if (!movementCollider || !Number.isFinite(movementCollider.radius)
    || movementCollider.radius <= 0) {
    throw new TypeError("movementCollider.radius must be positive");
  }
  if (animations !== null) {
    if (typeof animations !== "object") throw new TypeError("animations must be an object");
    for (const [name, descriptor] of Object.entries(animations)) {
      if (!descriptor || !Number.isInteger(descriptor.frameCount) || descriptor.frameCount < 1) {
        throw new TypeError(`animation ${name} must have a positive frameCount`);
      }
      if (!Array.isArray(descriptor.gridSize)
        || descriptor.gridSize[0] !== frameWidth || descriptor.gridSize[1] !== frameHeight) {
        throw new TypeError(`animation ${name} gridSize must match the frame`);
      }
    }
  }
  return Object.freeze({
    id,
    frame: Object.freeze({ width: frameWidth, height: frameHeight }),
    displaySize: Object.freeze({ width: displayWidth, height: displayHeight }),
    movementCollider: Object.freeze({
      type: "circle",
      radius: movementCollider.radius,
    }),
    artOffset: Object.freeze(offset),
    artPivot: Object.freeze(pivot),
    animations,
  });
}

export function getCharacterMovementCollider(position, definition) {
  return {
    type: "circle",
    x: finite(position?.x, "position.x"),
    y: finite(position?.y, "position.y"),
    radius: definition.movementCollider.radius,
  };
}

export function getGridCellCenter(cell, tileSize = GRID.tileSizePx) {
  const size = positive(tileSize, "tileSize");
  if (!Number.isInteger(cell?.x) || !Number.isInteger(cell?.y)) {
    throw new TypeError("grid cell coordinates must be integers");
  }
  return { x: (cell.x + 0.5) * size, y: (cell.y + 0.5) * size };
}

export function getCharacterCombatCollider(position, tileSize = GRID.tileSizePx) {
  const x = finite(position?.x, "position.x");
  const y = finite(position?.y, "position.y");
  const size = positive(tileSize, "tileSize");
  return {
    x: x - size / 2,
    y: y - size / 2,
    width: size,
    height: size,
  };
}

export function getCharacterArtTransform(
  position,
  definition,
  screenHeight,
  tileSize = GRID.tileSizePx,
  size = definition.displaySize,
) {
  const x = finite(position?.x, "position.x");
  const y = finite(position?.y, "position.y");
  const height = positive(screenHeight, "screenHeight");
  const cellBottom = height - (Math.floor(y / tileSize) + 1) * tileSize;
  const pivot = definition.artPivot;
  return {
    positionPx: [
      x + definition.artOffset.x - (0.5 - pivot.x) * size.width,
      cellBottom + definition.artOffset.y - (1 - pivot.y) * size.height,
    ],
    sizePx: [size.width, size.height],
    pivot: [pivot.x, pivot.y],
  };
}
