export function getMovementVector(keys) {
  const x = Number(keys.has("KeyD") || keys.has("ArrowRight"))
    - Number(keys.has("KeyA") || keys.has("ArrowLeft"));
  const y = Number(keys.has("KeyW") || keys.has("ArrowUp"))
    - Number(keys.has("KeyS") || keys.has("ArrowDown"));
  const length = Math.hypot(x, y);

  return length > 0 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
}

export function moveWithinBounds(position, movement, distance, maxX, maxY) {
  return {
    x: Math.min(maxX, Math.max(0, position.x + movement.x * distance)),
    y: Math.min(maxY, Math.max(0, position.y + movement.y * distance)),
  };
}

export function worldToScreen(position, pixelsPerUnit, screenHeight) {
  return {
    x: position.x * pixelsPerUnit,
    y: screenHeight - position.y * pixelsPerUnit,
  };
}
