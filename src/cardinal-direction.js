export const CardinalDirection = Object.freeze({
  RIGHT: Object.freeze({ x: 1, y: 0 }),
  LEFT: Object.freeze({ x: -1, y: 0 }),
  UP: Object.freeze({ x: 0, y: 1 }),
  DOWN: Object.freeze({ x: 0, y: -1 }),
});

const CODE_DIRECTIONS = new Map([
  ["KeyD", CardinalDirection.RIGHT],
  ["ArrowRight", CardinalDirection.RIGHT],
  ["KeyA", CardinalDirection.LEFT],
  ["ArrowLeft", CardinalDirection.LEFT],
  ["KeyW", CardinalDirection.UP],
  ["ArrowUp", CardinalDirection.UP],
  ["KeyS", CardinalDirection.DOWN],
  ["ArrowDown", CardinalDirection.DOWN],
]);

export function isCardinalDirection(direction) {
  return direction != null
    && Number.isFinite(direction.x)
    && Number.isFinite(direction.y)
    && Math.abs(direction.x) + Math.abs(direction.y) === 1;
}

export function getCardinalDirectionForCode(code) {
  return CODE_DIRECTIONS.get(code) ?? null;
}

export function resolveCardinalDirection(
  movement,
  rememberedDirection = CardinalDirection.RIGHT,
) {
  const remembered = isCardinalDirection(rememberedDirection)
    ? rememberedDirection
    : CardinalDirection.RIGHT;
  const x = Number.isFinite(movement?.x) ? movement.x : 0;
  const y = Number.isFinite(movement?.y) ? movement.y : 0;
  const absoluteX = Math.abs(x);
  const absoluteY = Math.abs(y);

  if (absoluteX === 0 && absoluteY === 0) {
    return { ...remembered };
  }
  if (absoluteX > absoluteY) {
    return { x: Math.sign(x), y: 0 };
  }
  if (absoluteY > absoluteX) {
    return { x: 0, y: Math.sign(y) };
  }

  const horizontal = { x: Math.sign(x), y: 0 };
  const vertical = { x: 0, y: Math.sign(y) };
  if (
    (remembered.x === horizontal.x && remembered.y === horizontal.y)
    || (remembered.x === vertical.x && remembered.y === vertical.y)
  ) {
    return { ...remembered };
  }
  return horizontal;
}

export function cardinalDirectionsEqual(left, right) {
  return left?.x === right?.x && left?.y === right?.y;
}

export function createCardinalDirectionMemory(
  initialDirection = CardinalDirection.RIGHT,
) {
  let remembered = isCardinalDirection(initialDirection)
    ? { ...initialDirection }
    : { ...CardinalDirection.RIGHT };

  return {
    get() {
      return { ...remembered };
    },
    rememberCode(code, repeat = false) {
      const direction = getCardinalDirectionForCode(code);
      if (!repeat && direction) {
        remembered = { ...direction };
      }
      return this.get();
    },
    rememberMovement(movement) {
      if (movement?.x !== 0 || movement?.y !== 0) {
        remembered = resolveCardinalDirection(movement, remembered);
      }
      return this.get();
    },
    resolve(movement) {
      return resolveCardinalDirection(movement, remembered);
    },
  };
}
