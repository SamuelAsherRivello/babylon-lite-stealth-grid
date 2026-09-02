const SPAWN_ANIMATION_DURATION_SECONDS = 0.25;
const DEATH_ANIMATION_DURATION_SECONDS = 0.25;
const DAMAGE_FLASH_DURATION_SECONDS = 0.6;
const DEATH_ROTATION_DEGREES = 20;
const MAX_HEALTH = 100;
const KNOCKBACK_DURATION_SECONDS = 0.2;
const KNOCKBACK_SPEED_PIXELS_PER_SECOND = 17.28;
const DEGREES_TO_RADIANS = Math.PI / 180;

export function createCombatActorState({
  label,
  getCombatCollider,
  setVisualTransform,
  onDeathStart,
  onDeathComplete,
  onDeathProgress,
  onSpawnProgress,
  onHitFlashStart,
  onKnockback,
}) {
  let health = MAX_HEALTH;
  let isDying = false;
  let isDead = false;
  // A sprite must have a valid visible transform before its first renderer
  // update.  Initializing at zero size/opacity can leave Lite's saved sprite
  // size at zero, making the actor permanently invisible.
  let spawnElapsedSeconds = SPAWN_ANIMATION_DURATION_SECONDS;
  let deathElapsedSeconds = 0;
  let deathRotation = 0;
  let hitFlashRemainingSeconds = 0;

  if (onSpawnProgress) {
    onSpawnProgress(1);
  }

  function startDeath() {
    if (isDying || isDead) {
      return;
    }
    isDying = true;
    deathElapsedSeconds = 0;
    deathRotation = (Math.random() < 0.5 ? -1 : 1) * DEATH_ROTATION_DEGREES;
    if (onDeathStart) {
      onDeathStart();
    }
  }

  function startHitFlash() {
    hitFlashRemainingSeconds = DAMAGE_FLASH_DURATION_SECONDS;
  }

  function getActiveCombatCollider() {
    if (!isDying && !isDead) {
      return getCombatCollider();
    }
    return null;
  }

  return {
    label,
    get health() {
      return health;
    },
    get isAlive() {
      return !isDying && !isDead;
    },
    get isDying() {
      return isDying;
    },
    get isDead() {
      return isDead;
    },
    getCombatCollider: getActiveCombatCollider,
    setVisualTransform,
    beginSpawn() {
      spawnElapsedSeconds = 0;
      if (onSpawnProgress) {
        onSpawnProgress(0);
      }
    },
    updateSpawn(deltaSeconds) {
      if (spawnElapsedSeconds >= SPAWN_ANIMATION_DURATION_SECONDS) {
        return;
      }

      spawnElapsedSeconds = Math.min(
        SPAWN_ANIMATION_DURATION_SECONDS,
        spawnElapsedSeconds + Math.max(0, deltaSeconds),
      );
      const progress = spawnElapsedSeconds / SPAWN_ANIMATION_DURATION_SECONDS;
      if (onSpawnProgress) {
        onSpawnProgress(progress);
      }
    },
    applyDamage(amount, hitDirection = { x: 1, y: 0 }, knockbackOptions = {}) {
      if (!this.isAlive || amount <= 0) {
        return;
      }

      health -= amount;
      if (onKnockback && hitDirection) {
        onKnockback(hitDirection, {
          duration: KNOCKBACK_DURATION_SECONDS,
          speed: KNOCKBACK_SPEED_PIXELS_PER_SECOND,
          ...knockbackOptions,
        });
      }
      if (health <= 0) {
        startDeath();
        return;
      }
      if (onHitFlashStart) {
        onHitFlashStart();
      }
      startHitFlash();
    },
    updateDamageFlash(deltaSeconds) {
      if (hitFlashRemainingSeconds <= 0) {
        return;
      }

      const progress = Math.max(
        0,
        hitFlashRemainingSeconds / DAMAGE_FLASH_DURATION_SECONDS,
      );
      const whiteBoost = 0.6 * progress;
      hitFlashRemainingSeconds -= Math.max(0, deltaSeconds);
      setVisualTransform({
        color: [1 + whiteBoost, 1 + whiteBoost, 1 + whiteBoost, 1],
      });
      if (hitFlashRemainingSeconds <= 0) {
        setVisualTransform({
          color: [1, 1, 1, 1],
        });
      }
    },
    updateDeath(deltaSeconds) {
      if (!isDying) {
        this.updateDamageFlash(deltaSeconds);
        return;
      }

      deathElapsedSeconds += Math.max(0, deltaSeconds);
      const progress = Math.min(
        1,
        deathElapsedSeconds / DEATH_ANIMATION_DURATION_SECONDS,
      );
      const value = 1 - progress;
      if (onDeathProgress) {
        onDeathProgress(value);
      }
      const rotation = (deathRotation * DEGREES_TO_RADIANS) * progress;
      setVisualTransform({
        scaleX: value,
        scaleY: value,
        alpha: value,
        rotation,
      });

      if (progress >= 1) {
        isDying = false;
        isDead = true;
        onDeathComplete?.();
      }
    },
  };
}

