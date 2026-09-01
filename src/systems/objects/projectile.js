import { collidersOverlap } from "../../gameplay/game-logic.js";

// Tight gameplay bounds for the opaque arrow artwork after proportional scaling.
export const ARROW_SIZE = { width: 72, height: 20 };
export const ARROW_SPEED = 600;

export function createProjectile(position, direction, options = {}) {
  const projectile = {
    direction: { x: direction.x, y: direction.y },
    position: { ...position },
    speed: ARROW_SPEED
      * (options.speedMultiplier ?? 1)
      * (options.initialVelocityMultiplier ?? 1),
    collisionEnabled: options.collisionEnabled ?? true,
    rotationEnabled: options.rotationEnabled ?? true,
  };
  if (options.target) {
    const dx = options.target.x - position.x;
    const dy = options.target.y - position.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const initialDirection = options.initialVelocityDirection ?? { x: dx / distance, y: dy / distance };
    const initialLength = Math.hypot(initialDirection.x, initialDirection.y) || 1;
    projectile.velocity = { x: initialDirection.x / initialLength * projectile.speed, y: initialDirection.y / initialLength * projectile.speed };
    projectile.height = 0;
    const flightSeconds = distance / ARROW_SPEED;
    projectile.verticalVelocity = 4 * 64 / flightSeconds;
    projectile.gravity = 8 * 64 / (flightSeconds ** 2);
    projectile.flightVelocity = { x: projectile.velocity.x, y: projectile.verticalVelocity };
    projectile.arc = true;
  }
  return projectile;
}

export function getProjectileCollider(projectile) {
  const vertical = projectile.direction.y !== 0;
  const width = vertical ? ARROW_SIZE.height : ARROW_SIZE.width;
  const height = vertical ? ARROW_SIZE.width : ARROW_SIZE.height;
  return {
    x: projectile.position.x - width / 2,
    y: projectile.position.y - height / 2,
    width,
    height,
  };
}

export function advanceProjectile(projectile, deltaSeconds, bounds, obstacles) {
  if (projectile.arc) {
    const delta = Math.max(0, deltaSeconds);
    projectile.position.x += projectile.velocity.x * delta;
    projectile.position.y += projectile.velocity.y * delta;
    projectile.height += projectile.verticalVelocity * delta;
    projectile.verticalVelocity -= projectile.gravity * delta;
    projectile.flightVelocity = { x: projectile.velocity.x, y: projectile.verticalVelocity };
    projectile.direction = { x: projectile.velocity.x, y: projectile.velocity.y };
    if (projectile.height <= 0 && projectile.verticalVelocity < 0) {
      projectile.height = 0;
      return { alive: false, reason: "landing" };
    }
    const collider = getProjectileCollider(projectile);
    if (projectile.collisionEnabled && obstacles.some((obstacle) => collidersOverlap(collider, obstacle))) return { alive: false, reason: "collision" };
    return { alive: true, reason: null };
  }
  const distance = (projectile.speed ?? ARROW_SPEED) * Math.max(0, deltaSeconds);
  const leadingSize = projectile.direction.x !== 0
    ? ARROW_SIZE.width
    : ARROW_SIZE.height;
  const stepCount = Math.max(1, Math.ceil(distance / (leadingSize / 2)));
  const stepDistance = distance / stepCount;

  for (let step = 0; step < stepCount; step += 1) {
    projectile.position.x += stepDistance * projectile.direction.x;
    projectile.position.y += stepDistance * projectile.direction.y;
    const collider = getProjectileCollider(projectile);

    if (projectile.collisionEnabled && obstacles.some((obstacle) => collidersOverlap(collider, obstacle))) {
      return { alive: false, reason: "collision" };
    }

    if (
      collider.x >= bounds.width
      || collider.x + collider.width <= 0
      || collider.y >= bounds.height
      || collider.y + collider.height <= 0
    ) {
      return { alive: false, reason: "offscreen" };
    }
  }

  return { alive: true, reason: null };
}
