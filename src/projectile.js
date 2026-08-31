import { aabbOverlapsObstacle } from "./game-logic.js";

// Tight gameplay bounds for the opaque arrow artwork after proportional scaling.
export const ARROW_SIZE = { width: 144, height: 40 };
export const ARROW_SPEED = 600;

export function createProjectile(position, direction) {
  return {
    direction: direction < 0 ? -1 : 1,
    position: { ...position },
  };
}

export function getProjectileCollider(projectile) {
  return {
    x: projectile.position.x - ARROW_SIZE.width / 2,
    y: projectile.position.y - ARROW_SIZE.height / 2,
    width: ARROW_SIZE.width,
    height: ARROW_SIZE.height,
  };
}

export function advanceProjectile(projectile, deltaSeconds, bounds, obstacles) {
  const distance = ARROW_SPEED * Math.max(0, deltaSeconds);
  const stepCount = Math.max(1, Math.ceil(distance / (ARROW_SIZE.width / 2)));
  const stepDistance = distance / stepCount * projectile.direction;

  for (let step = 0; step < stepCount; step += 1) {
    projectile.position.x += stepDistance;
    const collider = getProjectileCollider(projectile);

    if (obstacles.some((obstacle) => aabbOverlapsObstacle(collider, obstacle))) {
      return { alive: false, reason: "collision" };
    }

    if (collider.x >= bounds.width || collider.x + collider.width <= 0) {
      return { alive: false, reason: "offscreen" };
    }
  }

  return { alive: true, reason: null };
}
