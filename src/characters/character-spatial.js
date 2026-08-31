import { getYSortedLayerOrder } from "../systems/environment/render-depth.js";

export function getColliderCenter(collider) {
  if (!collider || !Number.isFinite(collider.x) || !Number.isFinite(collider.y)) {
    throw new TypeError("collider with finite x and y is required");
  }
  if (collider.type === "circle") return { x: collider.x, y: collider.y };
  if (!Number.isFinite(collider.width) || !Number.isFinite(collider.height)) {
    throw new TypeError("rectangle collider requires finite width and height");
  }
  return {
    x: collider.x + collider.width / 2,
    y: collider.y + collider.height / 2,
  };
}

export function getCharacterGridCell(movementCollider, tileSize) {
  if (!Number.isFinite(tileSize) || tileSize <= 0) {
    throw new TypeError("positive tileSize is required");
  }
  const center = getColliderCenter(movementCollider);
  return {
    x: Math.floor(center.x / tileSize),
    y: Math.floor(center.y / tileSize),
  };
}

export function getCharacterLayerOrder(movementCollider, screenHeight) {
  return getYSortedLayerOrder(getColliderCenter(movementCollider).y, screenHeight);
}
