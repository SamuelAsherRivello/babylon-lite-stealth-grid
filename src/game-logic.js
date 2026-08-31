export function getMovementVector(keys) {
  const x = Number(keys.has("KeyD") || keys.has("ArrowRight"))
    - Number(keys.has("KeyA") || keys.has("ArrowLeft"));
  const y = Number(keys.has("KeyW") || keys.has("ArrowUp"))
    - Number(keys.has("KeyS") || keys.has("ArrowDown"));
  const length = Math.hypot(x, y);

  return length > 0 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
}

export function calculateJoystickInput(
  pointer,
  center,
  radius,
  deadZone = 0.15,
) {
  if (radius <= 0) {
    return { x: 0, y: 0 };
  }

  const displacement = {
    x: pointer.x - center.x,
    y: center.y - pointer.y,
  };
  const rawLength = Math.hypot(displacement.x, displacement.y) / radius;
  const safeDeadZone = Math.min(Math.max(deadZone, 0), 0.99);

  if (rawLength <= safeDeadZone) {
    return { x: 0, y: 0 };
  }

  const length = Math.hypot(displacement.x, displacement.y);
  const intensity = Math.min(
    (rawLength - safeDeadZone) / (1 - safeDeadZone),
    1,
  );

  return {
    x: displacement.x / length * intensity,
    y: displacement.y / length * intensity,
  };
}

export function selectMovementInput(keyboardMovement, joystickMovement) {
  return Math.hypot(joystickMovement.x, joystickMovement.y) > 0
    ? joystickMovement
    : keyboardMovement;
}

export function createJumpState(durationSeconds = 0.6, peakHeight = 64) {
  return {
    durationSeconds,
    elapsedSeconds: null,
    isJumping: false,
    peakHeight,
  };
}

export function startJump(state) {
  if (state.isJumping) {
    return false;
  }

  state.elapsedSeconds = 0;
  state.isJumping = true;
  return true;
}

export function updateJump(state, deltaSeconds) {
  if (!state.isJumping || state.elapsedSeconds === null) {
    return 0;
  }

  const elapsedSeconds = Math.min(
    state.elapsedSeconds + Math.max(0, deltaSeconds),
    state.durationSeconds,
  );
  state.elapsedSeconds = elapsedSeconds;

  if (elapsedSeconds >= state.durationSeconds) {
    state.elapsedSeconds = null;
    state.isJumping = false;
    return 0;
  }

  const progress = elapsedSeconds / state.durationSeconds;
  return 4 * state.peakHeight * progress * (1 - progress);
}

export function moveWithinBounds(position, movement, distance, maxX, maxY) {
  return {
    x: Math.min(maxX, Math.max(0, position.x + movement.x * distance)),
    y: Math.min(maxY, Math.max(0, position.y + movement.y * distance)),
  };
}

export function getLogicalViewportScale(
  renderWidth,
  renderHeight,
  logicalWidth,
  logicalHeight,
) {
  return Math.min(renderWidth / logicalWidth, renderHeight / logicalHeight);
}

export function getCharacterCollider(position, frame, pivot, localBounds = null) {
  const bounds = localBounds ?? {
    x: 0,
    y: frame.height / 2,
    width: frame.width,
    height: frame.height / 2,
  };

  if (bounds.type === "circle") {
    return {
      type: "circle",
      x: position.x - frame.width * pivot.x + bounds.x,
      y: position.y + frame.height * pivot.y - bounds.y,
      radius: bounds.radius,
    };
  }

  return {
    x: position.x - frame.width * pivot.x + bounds.x,
    y: position.y + frame.height * pivot.y - bounds.y - bounds.height,
    width: bounds.width,
    height: bounds.height,
  };
}

export function aabbsOverlap(a, b) {
  return a.x < b.x + b.width
    && a.x + a.width > b.x
    && a.y < b.y + b.height
    && a.y + a.height > b.y;
}

export function aabbOverlapsPolygon(aabb, polygon) {
  const rectangle = [
    { x: aabb.x, y: aabb.y },
    { x: aabb.x + aabb.width, y: aabb.y },
    { x: aabb.x + aabb.width, y: aabb.y + aabb.height },
    { x: aabb.x, y: aabb.y + aabb.height },
  ];
  const axes = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    ...polygon.map((point, index) => {
      const next = polygon[(index + 1) % polygon.length];
      return { x: -(next.y - point.y), y: next.x - point.x };
    }),
  ];

  return axes.every((axis) => {
    const rectangleProjection = rectangle.map(
      (point) => point.x * axis.x + point.y * axis.y,
    );
    const polygonProjection = polygon.map(
      (point) => point.x * axis.x + point.y * axis.y,
    );
    const rectangleMin = Math.min(...rectangleProjection);
    const rectangleMax = Math.max(...rectangleProjection);
    const polygonMin = Math.min(...polygonProjection);
    const polygonMax = Math.max(...polygonProjection);

    return rectangleMax > polygonMin && polygonMax > rectangleMin;
  });
}

export function aabbOverlapsObstacle(aabb, obstacle) {
  return obstacle.type === "polygon"
    ? aabbOverlapsPolygon(aabb, obstacle.points)
    : aabbsOverlap(aabb, obstacle);
}

function normalizeAxis(axis) {
  const length = Math.hypot(axis.x, axis.y);
  return length > 0
    ? { x: axis.x / length, y: axis.y / length }
    : null;
}

export function getCirclePolygonResolution(circle, polygon) {
  const closestVertex = polygon.reduce((closest, point) => {
    const distance = (point.x - circle.x) ** 2 + (point.y - circle.y) ** 2;
    return distance < closest.distance ? { point, distance } : closest;
  }, { point: polygon[0], distance: Number.POSITIVE_INFINITY }).point;
  const axes = [
    ...polygon.map((point, index) => {
      const next = polygon[(index + 1) % polygon.length];
      return normalizeAxis({ x: -(next.y - point.y), y: next.x - point.x });
    }),
    normalizeAxis({
      x: circle.x - closestVertex.x,
      y: circle.y - closestVertex.y,
    }),
  ].filter(Boolean);
  const polygonCenter = polygon.reduce(
    (center, point) => ({ x: center.x + point.x, y: center.y + point.y }),
    { x: 0, y: 0 },
  );
  polygonCenter.x /= polygon.length;
  polygonCenter.y /= polygon.length;
  let minimumTranslation = null;

  for (let axis of axes) {
    const polygonProjection = polygon.map(
      (point) => point.x * axis.x + point.y * axis.y,
    );
    const polygonMin = Math.min(...polygonProjection);
    const polygonMax = Math.max(...polygonProjection);
    const circleCenter = circle.x * axis.x + circle.y * axis.y;
    const circleMin = circleCenter - circle.radius;
    const circleMax = circleCenter + circle.radius;
    const overlap = Math.min(polygonMax, circleMax) - Math.max(polygonMin, circleMin);

    if (overlap <= 0) {
      return null;
    }

    const centerDirection = (circle.x - polygonCenter.x) * axis.x
      + (circle.y - polygonCenter.y) * axis.y;
    if (centerDirection < 0) {
      axis = { x: -axis.x, y: -axis.y };
    }
    if (!minimumTranslation || overlap < minimumTranslation.overlap) {
      minimumTranslation = { x: axis.x, y: axis.y, overlap };
    }
  }

  return {
    x: minimumTranslation.x * (minimumTranslation.overlap + 1e-7),
    y: minimumTranslation.y * (minimumTranslation.overlap + 1e-7),
  };
}

export function circleOverlapsPolygon(circle, polygon) {
  return getCirclePolygonResolution(circle, polygon) !== null;
}

export function circleOverlapsAabb(circle, aabb) {
  const closestX = Math.max(aabb.x, Math.min(circle.x, aabb.x + aabb.width));
  const closestY = Math.max(aabb.y, Math.min(circle.y, aabb.y + aabb.height));
  return (circle.x - closestX) ** 2 + (circle.y - closestY) ** 2
    < circle.radius ** 2;
}

export function collidersOverlap(a, b) {
  if (a.type === "circle" && b.type === "circle") {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 < (a.radius + b.radius) ** 2;
  }
  if (a.type === "circle") {
    return b.type === "polygon"
      ? circleOverlapsPolygon(a, b.points)
      : circleOverlapsAabb(a, b);
  }
  if (b.type === "circle") {
    return a.type === "polygon"
      ? circleOverlapsPolygon(b, a.points)
      : circleOverlapsAabb(b, a);
  }
  return aabbOverlapsObstacle(a, b);
}

export function colliderOverlapsObstacle(collider, obstacle) {
  return collidersOverlap(collider, obstacle);
}

export function isAabbWithinBounds(aabb, maxX, maxY) {
  return aabb.x >= 0
    && aabb.y >= 0
    && aabb.x + aabb.width <= maxX
    && aabb.y + aabb.height <= maxY;
}

export function isColliderWithinBounds(collider, maxX, maxY) {
  if (collider.type === "circle") {
    return collider.x - collider.radius >= 0
      && collider.y - collider.radius >= 0
      && collider.x + collider.radius <= maxX
      && collider.y + collider.radius <= maxY;
  }

  return isAabbWithinBounds(collider, maxX, maxY);
}

export function moveWithCollisions(
  position,
  movement,
  distance,
  bounds,
  character,
  obstacles,
) {
  let nextPosition = { ...position };

  for (const axis of ["x", "y"]) {
    if (movement[axis] === 0) {
      continue;
    }

    const candidate = {
      ...nextPosition,
      [axis]: nextPosition[axis] + movement[axis] * distance,
    };
    let resolvedCandidate = candidate;

    for (const obstacle of obstacles) {
      const collider = getCharacterCollider(
        resolvedCandidate,
        character.frame,
        character.pivot,
        character.collider,
      );
      if (collider.type === "circle" && obstacle.type === "polygon") {
        const resolution = getCirclePolygonResolution(collider, obstacle.points);
        if (resolution) {
          resolvedCandidate = {
            x: resolvedCandidate.x + resolution.x,
            y: resolvedCandidate.y + resolution.y,
          };
        }
      }
    }

    const resolvedCollider = getCharacterCollider(
      resolvedCandidate,
      character.frame,
      character.pivot,
      character.collider,
    );
    const isBlocked = !isColliderWithinBounds(
      resolvedCollider,
      bounds.width,
      bounds.height,
    ) || obstacles.some(
      (obstacle) => colliderOverlapsObstacle(resolvedCollider, obstacle),
    );

    if (!isBlocked) {
      nextPosition = resolvedCandidate;
    }
  }

  return nextPosition;
}

export function createTerrainReviewTiles(
  frameCount,
  columns,
  tileSize,
  screenHeight,
  blockedFrames,
  emptyFrames = new Set(),
  partialColliders = new Map(),
) {
  return Array.from({ length: frameCount }, (_, frame) => {
    const screenPosition = {
      x: (frame % columns) * tileSize,
      y: Math.floor(frame / columns) * tileSize,
    };
    const valid = !emptyFrames.has(frame);
    const partialCollider = valid ? partialColliders.get(frame) : null;
    const blocked = valid && (blockedFrames.has(frame) || Boolean(partialCollider));
    const tileBottomY = screenHeight - screenPosition.y - tileSize;

    return {
      frame,
      screenPosition,
      valid,
      blocked,
      collider: partialCollider
        ? {
            type: "polygon",
            points: partialCollider.map((point) => ({
              x: screenPosition.x + point.x * tileSize,
              y: tileBottomY + point.y * tileSize,
            })),
          }
        : blocked
        ? {
            x: screenPosition.x,
            y: tileBottomY,
            width: tileSize,
            height: tileSize,
          }
        : null,
    };
  });
}

export function worldToScreen(position, pixelsPerUnit, screenHeight) {
  return {
    x: position.x * pixelsPerUnit,
    y: screenHeight - position.y * pixelsPerUnit,
  };
}

export function gridCellToScreen(cell, tileSize, screenHeight) {
  return {
    x: cell.x * tileSize,
    y: screenHeight - (cell.y + 1) * tileSize,
  };
}

export function gridCellToScreenForFrame(
  cell,
  tileSize,
  frameSize,
  screenHeight,
) {
  const cellPosition = gridCellToScreen(cell, tileSize, screenHeight);
  const overflow = (frameSize - tileSize) / 2;

  return {
    x: cellPosition.x - overflow,
    y: cellPosition.y - overflow,
  };
}

export function worldToGrid(position, tileSize, artwork) {
  const artworkLeftX = position.x - artwork.width * artwork.pivotX;
  const artworkBottomY = position.y - artwork.height * (1 - artwork.pivotY);

  return {
    x: Math.max(0, Math.floor(artworkLeftX / tileSize)),
    y: Math.max(0, Math.floor(artworkBottomY / tileSize)),
  };
}

export function formatPositionReadout(pixelPosition, gridPosition) {
  return `X ${Math.round(pixelPosition.x)} · Y ${Math.round(pixelPosition.y)}\nC ${gridPosition.x} · R ${gridPosition.y}`;
}
