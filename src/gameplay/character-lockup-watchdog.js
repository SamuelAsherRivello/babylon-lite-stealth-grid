import { collidersOverlap } from "./game-logic.js";

export function createCharacterLockupWatchdog({ stallSeconds = 0.35 } = {}) {
  let stalledSeconds = 0;
  let lastPositions = new Map();
  let lastReport = null;

  return {
    inspect(records, deltaSeconds) {
      const overlapping = [];
      for (let index = 0; index < records.length; index += 1) {
        for (let otherIndex = index + 1; otherIndex < records.length; otherIndex += 1) {
          const first = records[index];
          const second = records[otherIndex];
          if (first.combat?.isAlive === false || second.combat?.isAlive === false) continue;
          if (collidersOverlap(first.actor.getMovementCollider(), second.actor.getMovementCollider())) {
            overlapping.push([first, second]);
          }
        }
      }
      const moving = records.some((record) => {
        const position = record.actor.getPosition();
        const previous = lastPositions.get(record.combat.label);
        lastPositions.set(record.combat.label, position);
        return previous && (position.x !== previous.x || position.y !== previous.y);
      });
      stalledSeconds = overlapping.length > 0 && !moving
        ? stalledSeconds + Math.max(0, deltaSeconds) : 0;
      if (stalledSeconds < stallSeconds || overlapping.length === 0) return null;
      const pair = overlapping[0];
      const [first, second] = pair;
      const firstPosition = first.actor.getPosition();
      const secondPosition = second.actor.getPosition();
      const dx = firstPosition.x - secondPosition.x;
      const dy = firstPosition.y - secondPosition.y;
      const direction = Math.abs(dx) >= Math.abs(dy)
        ? { x: dx === 0 ? -1 : Math.sign(dx), y: 0 }
        : { x: 0, y: dy === 0 ? -1 : Math.sign(dy) };
      second.actor.setMovementIntent?.({ x: 0, y: 0 });
      first.actor.setMovementIntent?.(direction);
      stalledSeconds = 0;
      lastReport = [first.combat.label, second.combat.label];
      return { labels: lastReport, direction };
    },
    get lastReport() { return lastReport; },
  };
}
