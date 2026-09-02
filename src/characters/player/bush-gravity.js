import { GRID } from '../../systems/environment/grid-contract.js';

export function createBushGravity({ gridWidth = GRID.tileSizePx } = {}) {
  // User-facing name: gravity starts only when closer than this minimum distance.
  const minimumDistance = gridWidth * 0.75;
  let overlaps = new Set();
  let consumed = new Set();
  let pull = null;
  let hold = null;
  let steppedPull = false;
  return {
    get active() { return pull !== null; },
    get movementLocked() { return pull !== null || hold !== null; },
    cancel() { pull = null; hold = null; },
    observe(bushes, position, enabled = true) {
      overlaps = new Set(bushes.map(bush => bush.id));
      consumed = new Set([...consumed].filter(id => overlaps.has(id)));
      if (pull || hold || steppedPull || !enabled) for (const bush of bushes) consumed.add(bush.id);
      steppedPull = false;
      if (pull && (!enabled || !bushes.includes(pull.bush))) pull = null;
      if (hold && (!enabled || !bushes.includes(hold.bush))) hold = null;
      const entered = bushes.find(bush => !consumed.has(bush.id)
        && Math.hypot(position.x - bush.interactionPosition.x, position.y - bush.interactionPosition.y) < minimumDistance);
      if (!enabled || pull || hold || !entered) return;
      for (const bush of bushes) consumed.add(bush.id);
      const target = entered.interactionPosition;
      if (position.x === target.x && position.y === target.y) return;
      pull = { bush: entered, start: { ...position }, target: { ...target }, elapsed: 0 };
    },
    step(delta) {
      if (hold) {
        hold.remaining -= Math.max(0, delta);
        if (hold.remaining <= 1e-9 || hold.bush.isAlive === false) hold = null;
        return null;
      }
      if (!pull) return null;
      steppedPull = true;
      if (pull.bush.isAlive === false) { pull = null; return null; }
      pull.elapsed += Math.max(0, delta);
      const t = Math.min(1, pull.elapsed / .125);
      const result = t === 1 ? { ...pull.target } : {
        x: pull.start.x + (pull.target.x - pull.start.x) * t * t,
        y: pull.start.y + (pull.target.y - pull.start.y) * t * t,
      };
      if (t === 1) {
        const remaining = 0.25 - Math.max(0, pull.elapsed - 0.125);
        if (remaining > 1e-9) hold = { bush: pull.bush, remaining };
        pull = null;
      }
      return result;
    },
  };
}


