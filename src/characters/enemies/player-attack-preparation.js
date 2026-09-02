import { getColliderCenter } from '../character-spatial.js';
import { getGridSpotCenter } from '../../systems/environment/grid-spot.js';
import { cardinalIntent, createMovementRecovery } from '../movement-recovery.js';
import { canEnemyTargetPlayer } from '../../systems/perception/player-hidden.js';

// Actor updates own the clock and physics; decision controllers only request.
const preparations = new WeakMap();
// Production actors expose their authoritative world center directly. Collider
// reconstruction can introduce pivot arithmetic roundoff (224 -> 223.999...).
const positionOf = actor => actor.getPosition?.() ?? getColliderCenter(actor.getMovementCollider());
const stop = actor => actor.setMovementIntent({ x: 0, y: 0 });
const centered = (position, center) => position.x === center.x && position.y === center.y;
export function hasPlayerAttackPreparation(actor) { return preparations.has(actor); }
export function cancelPlayerAttackPreparation(actor) {
  if (preparations.delete(actor)) stop(actor);
}
export function getPlayerAttackPreparationSnapshot(actor) {
  const pending = preparations.get(actor);
  return pending ? { center: { ...pending.center }, ...pending.recovery.snapshot() } : null;
}
function commitIfCentered(actor, pending) {
  if (!centered(positionOf(actor), pending.center)) return false;
  const target = pending.getTarget();
  if (!canEnemyTargetPlayer(target) || !pending.eligible(target)) {
    cancelPlayerAttackPreparation(actor); return false;
  }
  preparations.delete(actor);
  stop(actor);
  const direction = cardinalIntent(positionOf(actor), target.position);
  actor.faceDirection?.(direction);
  return pending.commit(target, direction);
}
export function requestPlayerAttack(actor, { grid, getTarget, eligible, commit }) {
  if (actor.isMovementLocked?.()) return null;
  if (preparations.has(actor)) return 'preparing';
  const target = getTarget();
  if (!canEnemyTargetPlayer(target) || !eligible(target)) return null;
  const pending = { getTarget, eligible, commit,
    center: getGridSpotCenter(actor.getGridPosition(grid?.tileSizePx), grid),
    recovery: createMovementRecovery() };
  preparations.set(actor, pending);
  if (centered(positionOf(actor), pending.center)) return commitIfCentered(actor, pending) ? 'attacking' : null;
  actor.setMovementIntent(cardinalIntent(positionOf(actor), pending.center));
  return 'preparing';
}
/** Returns true while preparation owns this update, including cancellation. */
export function updatePlayerAttackPreparation(actor, delta, moveToCenter) {
  const pending = preparations.get(actor);
  if (!pending) return false;
  if (delta <= 0) return true;
  const target = pending.getTarget();
  if (actor.isMovementLocked?.() || !canEnemyTargetPlayer(target) || !pending.eligible(target)) {
    cancelPlayerAttackPreparation(actor); return true;
  }
  if (pending.recovery.snapshot().recoveryState === 'waiting') {
    stop(actor);
    if (pending.recovery.tickWait(delta)) cancelPlayerAttackPreparation(actor);
    return true;
  }
  if (centered(positionOf(actor), pending.center)) {
    commitIfCentered(actor, pending); return true;
  }
  if (pending.recovery.observe(positionOf(actor), pending.center, delta)) {
    pending.recovery.wait(); stop(actor); return true;
  }
  actor.setMovementIntent(cardinalIntent(positionOf(actor), pending.center));
  moveToCenter(pending.center);
  commitIfCentered(actor, pending);
  return true;
}
