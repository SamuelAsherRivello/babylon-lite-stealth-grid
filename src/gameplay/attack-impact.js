// Each accepted swing owns one immutable direction and one midpoint event.
export function createAttackImpactQueue() {
  let nextId = 0;
  let pending = null;
  const events = [];
  return {
    start(direction, durationSeconds) {
      pending = { id: ++nextId, direction: { ...direction }, remaining: durationSeconds / 2 };
    },
    advance(delta) {
      if (!pending) return;
      pending.remaining -= Math.max(0, delta);
      if (pending.remaining <= 1e-9) {
        events.push({ id: pending.id, direction: pending.direction });
        pending = null;
      }
    },
    cancel() { pending = null; },
    drain() { return events.splice(0); },
  };
}
