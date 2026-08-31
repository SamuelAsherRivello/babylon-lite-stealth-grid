export function createLevelTerrainTiles(
  placements,
  tileSize,
  screenHeight,
  emptyFrames,
) {
  return placements.map(({ frame, gameCell, collisionShapes = [], ...placement }) => {
    const screenPosition = {
      x: gameCell.x * tileSize,
      y: screenHeight - (gameCell.y + 1) * tileSize,
    };
    const valid = !emptyFrames.has(frame);
    const collider = valid && collisionShapes.length > 0
      ? collisionShapeToWorld(collisionShapes[0], screenPosition.x, gameCell.y * tileSize, tileSize)
      : null;
    return {
      ...placement,
      frame,
      gameCell,
      collisionShapes,
      screenPosition,
      valid,
      blocked: collider !== null,
      collider,
    };
  });
}

function collisionShapeToWorld(shape, tileLeftX, tileBottomY, tileSize) {
  if (shape.type === "rectangle") {
    return {
      x: tileLeftX + shape.x * tileSize,
      y: tileBottomY + shape.y * tileSize,
      width: shape.width * tileSize,
      height: shape.height * tileSize,
    };
  }
  if (shape.type === "polygon") {
    return {
      type: "polygon",
      points: shape.points.map((point) => ({
        x: tileLeftX + point.x * tileSize,
        y: tileBottomY + point.y * tileSize,
      })),
    };
  }
  return null;
}
