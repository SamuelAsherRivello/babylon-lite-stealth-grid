import { collidersOverlap } from './game-logic.js';
import { GRID } from '../systems/environment/grid-contract.js';

export const PLAYER_KNOCKBACK_CELLS = Object.freeze({ goblin: .25, archer: .5, warrior: .75, lancer: 1 });

export function createDistanceImpulse() {
  let impulse = null;
  return {
    get active() { return impulse !== null; },
    start(direction, { distance, duration = .2 }) {
      const length = Math.hypot(direction.x, direction.y) || 1;
      impulse = { x: direction.x / length, y: direction.y / length, distance, duration: Math.max(.0001, duration), elapsed: 0 };
    },
    step(delta) {
      if (!impulse) return null;
      const before = impulse.elapsed / impulse.duration;
      impulse.elapsed = Math.min(impulse.duration, impulse.elapsed + Math.max(0, delta));
      const after = impulse.elapsed / impulse.duration;
      const distance = impulse.distance * ((2*after-after*after) - (2*before-before*before));
      const result = { x: impulse.x * distance, y: impulse.y * distance };
      if (after === 1) impulse = null;
      return result;
    },
  };
}

export function damagePlayer(player, source, direction) {
  if (!player?.combat.isAlive || !(source in PLAYER_KNOCKBACK_CELLS)) return false;
  player.combat.applyDamage(25, direction, { distance: PLAYER_KNOCKBACK_CELLS[source] * GRID.tileSizePx });
  return true;
}

export function resolveEnemyArrowPlayerHit({ ownerId, collider, direction }, player) {
  if (!ownerId || !player?.combat.isAlive || ownerId === player.combat.label) return false;
  const target = player.combat.getCombatCollider();
  return Boolean(target && collidersOverlap(collider, target) && damagePlayer(player, 'archer', direction));
}

export function resolveMeleeImpacts(enemies, player, tileSize = GRID.tileSizePx) {
  for (const record of enemies) {
    for (const impact of record.actor.drainAttackImpacts?.() ?? []) {
      if (!record.combat.isAlive || !player?.combat.isAlive) continue;
      const cell = record.actor.getGridPosition(tileSize);
      const d = impact.direction;
      const dx = Math.abs(d.x) >= Math.abs(d.y) ? Math.sign(d.x) : 0;
      const dy = dx ? 0 : Math.sign(d.y);
      const area = { x: (cell.x + Math.min(0, dx)) * tileSize, y: (cell.y + Math.min(0, dy)) * tileSize,
        width: (1 + Math.abs(dx)) * tileSize, height: (1 + Math.abs(dy)) * tileSize };
      const collider = player.combat.getCombatCollider();
      if (!collider || !collidersOverlap(area, collider)) continue;
      const from = record.actor.getPosition(), to = player.actor.getPosition();
      const length = Math.hypot(to.x - from.x, to.y - from.y);
      damagePlayer(player, record.character, length ? { x: (to.x-from.x)/length, y: (to.y-from.y)/length } : d);
    }
  }
}
