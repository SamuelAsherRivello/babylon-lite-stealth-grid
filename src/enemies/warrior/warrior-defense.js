import { collidersOverlap } from "../../game-logic.js";
import { ARROW_SPEED } from "../../projectile.js";

export const DEFAULT_WARRIOR_DEFENSE_CONFIG = Object.freeze({
  reactionLookaheadSeconds: 0.4,
  defenseDurationSeconds: 0.25,
});

function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

export function createWarriorDefenseConfig(overrides = {}) {
  return Object.freeze({
    reactionLookaheadSeconds: Math.max(0, finiteOr(
      overrides.reactionLookaheadSeconds,
      DEFAULT_WARRIOR_DEFENSE_CONFIG.reactionLookaheadSeconds,
    )),
    defenseDurationSeconds: Math.max(0, finiteOr(
      overrides.defenseDurationSeconds,
      DEFAULT_WARRIOR_DEFENSE_CONFIG.defenseDurationSeconds,
    )),
  });
}

function getSweptCollider(projectile, lookaheadSeconds) {
  const distance = ARROW_SPEED * lookaheadSeconds;
  const dx = projectile.direction.x * distance;
  const dy = projectile.direction.y * distance;
  const collider = projectile.collider;
  return {
    x: Math.min(collider.x, collider.x + dx),
    y: Math.min(collider.y, collider.y + dy),
    width: collider.width + Math.abs(dx),
    height: collider.height + Math.abs(dy),
  };
}

export function selectIncomingProjectile(
  projectiles,
  warriorCollider,
  warriorFacing,
  config,
  attemptedProjectileIds,
) {
  for (const projectile of projectiles) {
    if (attemptedProjectileIds.has(projectile.id)) continue;
    if (!collidersOverlap(
      getSweptCollider(projectile, config.reactionLookaheadSeconds),
      warriorCollider,
    )) continue;

    attemptedProjectileIds.add(projectile.id);
    if (projectile.direction.x === -warriorFacing) return projectile;
  }
  return null;
}
