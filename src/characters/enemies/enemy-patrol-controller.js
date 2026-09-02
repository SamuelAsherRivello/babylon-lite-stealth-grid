const DEFAULT_DIRECTIONS = Object.freeze([
  Object.freeze({ x: 1, y: 0 }), Object.freeze({ x: -1, y: 0 }),
  Object.freeze({ x: 0, y: 1 }), Object.freeze({ x: 0, y: -1 }),
]);

function randomDuration(range, random) {
  const [minimum, maximum] = range;
  const value = Math.max(0, Math.min(1, random()));
  return minimum + (maximum - minimum) * value;
}

export function createEnemyPatrolController(actor, {
  random = Math.random, idleRange = [3, 5], patrolRange = [2, 5],
  directions = DEFAULT_DIRECTIONS,
  isDirectionWalkable = () => true,
} = {}) {
  let mode = "idle";
  let remaining = randomDuration(idleRange, random);
  let currentDirection = null;
  let lastPosition = typeof actor.getPosition === "function" ? actor.getPosition() : null;
  function enterIdle() {
    mode = "idle";
    remaining = randomDuration(idleRange, random);
    actor.setMovementIntent({ x: 0, y: 0 });
  }
  function enterPatrol() {
    mode = "patrolling";
    remaining = randomDuration(patrolRange, random);
    const availableDirections = directions.filter((direction) => (
      (!currentDirection || direction.x !== currentDirection.x || direction.y !== currentDirection.y)
      && isDirectionWalkable(direction, actor.getPosition?.())
    ));
    const value = Math.max(0, Math.min(1, random()));
    currentDirection = availableDirections[Math.min(
      Math.floor(value * availableDirections.length), availableDirections.length - 1,
    )] ?? null;
    if (!currentDirection) {
      actor.setMovementIntent({ x: 0, y: 0 });
      remaining = Math.min(0.1, patrolRange[0]);
      return;
    }
    actor.setMovementIntent(currentDirection);
  }
  actor.setMovementIntent({ x: 0, y: 0 });
  return {
    get mode() { return mode; },
    update(deltaSeconds) {
      const position = typeof actor.getPosition === "function" ? actor.getPosition() : null;
      const movementStalled = mode === "patrolling" && currentDirection
        && lastPosition && position
        && position.x === lastPosition.x && position.y === lastPosition.y;
      if (movementStalled) enterPatrol();
      lastPosition = position;
      remaining -= Math.max(0, deltaSeconds);
      if (remaining > 0) return;
      if (mode === "idle") enterPatrol(); else enterIdle();
    },
  };
}
