/** Bounded active-time progress tracking shared by autonomous movement policies. */
export function createMovementRecovery({ stallSeconds = 1, retrySeconds = 3, epsilon = 1 } = {}) {
  if (![stallSeconds, retrySeconds, epsilon].every(value => Number.isFinite(value) && value > 0)) {
    throw new RangeError('Recovery timings and epsilon must be positive finite values.');
  }
  let state = 'idle', reason = null, elapsed = 0, remaining = 0, best = Infinity, targetKey = null;
  return {
    observe(position, target, delta, permitted = true) {
      if (!permitted || delta <= 0) { this.suspend(); return false; }
      const key = `${target.x},${target.y}`;
      const distance = Math.hypot(target.x - position.x, target.y - position.y);
      if (key !== targetKey) { targetKey = key; best = distance; elapsed = 0; }
      else if (distance < best - epsilon) { best = distance; elapsed = 0; }
      else elapsed += delta;
      state = 'moving';
      if (elapsed + 1e-9 >= stallSeconds) { this.fail('no-progress'); return true; }
      return false;
    },
    fail(value = 'blocked-segment') { reason = value; state = 'replanning'; remaining = 0; targetKey = null; },
    accept() { state = 'moving'; elapsed = 0; remaining = 0; best = Infinity; targetKey = null; },
    wait() { state = 'waiting'; remaining = retrySeconds; elapsed = 0; targetKey = null; },
    tickWait(delta) {
      if (state !== 'waiting' || delta <= 0) return false;
      remaining = Math.max(0, remaining - delta);
      return remaining <= 1e-9;
    },
    suspend() { elapsed = 0; best = Infinity; targetKey = null; },
    cancel() { state = 'idle'; elapsed = 0; remaining = 0; best = Infinity; targetKey = null; },
    snapshot() { return { recoveryState: state, recoveryReason: reason, noProgressSeconds: elapsed, retryRemaining: remaining }; },
  };
}

export const CARDINAL_STEPS = Object.freeze([{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]);
export const cellKey = cell => `${cell.x},${cell.y}`;
export const cellCenter = (cell, size) => ({ x: (cell.x + 0.5) * size, y: (cell.y + 0.5) * size });
export const cardinalIntent = (position, target) => Math.abs(target.x - position.x) >= Math.abs(target.y - position.y)
  ? { x: Math.sign(target.x - position.x), y: 0 } : { x: 0, y: Math.sign(target.y - position.y) };
export function chooseRoute(routes, random = Math.random) {
  return routes[Math.min(routes.length - 1, Math.floor(Math.max(0, Math.min(1, random())) * routes.length))] ?? [];
}

/** One finite BFS, including segment validation; no per-destination repeated searches. */
export function reachableRoutes(start, grid, isWalkable, maximum = grid.columns * grid.rows, excludedFirst = null) {
  const queue = [{ cell: start, route: [] }], visited = new Set([cellKey(start)]), routes = [];
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    if (current.route.length >= maximum) continue;
    for (const step of CARDINAL_STEPS) {
      const cell = { x: current.cell.x + step.x, y: current.cell.y + step.y };
      if (cell.x < 0 || cell.y < 0 || cell.x >= grid.columns || cell.y >= grid.rows) continue;
      if (current.route.length === 0 && excludedFirst && cellKey(cell) === cellKey(excludedFirst)) continue;
      if (visited.has(cellKey(cell)) || !isWalkable(cell) || isWalkable.canTraverse?.(current.cell, cell) === false) continue;
      visited.add(cellKey(cell));
      const route = [...current.route, cell];
      routes.push(route); queue.push({ cell, route });
    }
  }
  return routes;
}
