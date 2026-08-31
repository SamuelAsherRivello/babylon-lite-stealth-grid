import { SpawnerCharacter, SpawnerType } from "./spawner-catalog.js";

export function resolveProjectileHit(projectiles, projectile, target) {
  if (
    target.character === SpawnerCharacter.WARRIOR
    && target.actor.isDefending
  ) {
    projectiles.deflect(projectile.id);
    return "deflected";
  }

  target.combat.applyDamage(
    target.type === SpawnerType.SHEEP ? 100 : 50,
    projectile.direction,
  );
  projectiles.markHit(projectile.id);
  return "damaged";
}
