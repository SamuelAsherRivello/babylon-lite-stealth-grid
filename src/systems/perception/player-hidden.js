import { collidersOverlap } from "../../gameplay/game-logic.js";

const HIDDEN_OPACITY = 0.6;

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
