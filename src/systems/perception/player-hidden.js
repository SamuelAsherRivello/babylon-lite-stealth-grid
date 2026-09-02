import { collidersOverlap } from "../../gameplay/game-logic.js";

const HIDDEN_OPACITY = 0.6;

export function canEnemyTargetPlayer(player, reaction = null) {
  return Boolean(player && player.isAlive !== false && player.targetable !== false
    && (!player.hidden || player.targetable === true || reaction?.canTrackHiddenPlayer?.()));
}

// The whole occupied bush cell blocks movement, even at partial player overlap.
export function getOccupiedBushBlockers(playerCombatCollider, bushes, tileSize, canTrack = false) {
  if (canTrack || !playerCombatCollider) return [];
  return bushes.filter(bush => bush?.isAlive !== false && bush?.cell
    && bush.getCombatCollider?.() && collidersOverlap(playerCombatCollider, bush.getCombatCollider()))
    .map(bush => ({ id: bush.id, type: 'bush', cell: { ...bush.cell }, collider: {
      x: bush.cell.x * tileSize, y: bush.cell.y * tileSize, width: tileSize, height: tileSize,
    } }));
}

export function isPlayerHidden(playerCombatCollider, bushes) {
  return getPlayerHidingBush(playerCombatCollider, bushes) !== null;
}

export function getPlayerHidingBush(playerCombatCollider, bushes, requiredCell = null) {
  if (!playerCombatCollider) return null;
  return bushes.find((bush) => (
    bush?.isAlive !== false
    && (!requiredCell || (bush?.cell?.x === requiredCell.x && bush?.cell?.y === requiredCell.y))
    && bush?.getCombatCollider?.()
    && collidersOverlap(playerCombatCollider, bush.getCombatCollider())
  )) ?? null;
}

export function stepHiddenOpacity(current, hidden, delta, duration) {
  const target = hidden ? HIDDEN_OPACITY : 1;
  if (duration <= 0) return target;
  const step = (1 - HIDDEN_OPACITY) * delta / duration;
  return hidden ? Math.max(target, current - step) : Math.min(target, current + step);
}
