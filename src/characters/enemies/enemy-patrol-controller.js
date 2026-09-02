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
} = {}) {
  let mode = "idle";
  let remaining = randomDuration(idleRange, random);
  function enterIdle() {
    mode = "idle";
    remaining = randomDuration(idleRange, random);
    actor.setMovementIntent({ x: 0, y: 0 });
  }
  function enterPatrol() {
    mode = "patrolling";
    remaining = randomDuration(patrolRange, random);
    const value = Math.max(0, Math.min(1, random()));
    actor.setMovementIntent(directions[Math.min(Math.floor(value * directions.length), directions.length - 1)]);
  }
  actor.setMovementIntent({ x: 0, y: 0 });
  return {
    get mode() { return mode; },
    update(deltaSeconds) {
      remaining -= Math.max(0, deltaSeconds);
      if (remaining > 0) return;
      if (mode === "idle") enterPatrol(); else enterIdle();
    },
  };
}
