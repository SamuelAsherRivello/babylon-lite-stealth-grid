import { collidersOverlap } from "../../gameplay/game-logic.js";

// Tight gameplay bounds for the opaque arrow artwork after proportional scaling.
export const ARROW_SIZE = { width: 72, height: 20 };
export const ARROW_SPEED = 600;

export function createProjectile(position, direction) {
  return {
    direction: { x: direction.x, y: direction.y },
    position: { ...position },
  };
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
  const distance = ARROW_SPEED * Math.max(0, deltaSeconds);
  const leadingSize = projectile.direction.x !== 0
    ? ARROW_SIZE.width
    : ARROW_SIZE.height;
  const stepCount = Math.max(1, Math.ceil(distance / (leadingSize / 2)));
  const stepDistance = distance / stepCount;

  for (let step = 0; step < stepCount; step += 1) {
    projectile.position.x += stepDistance * projectile.direction.x;
    projectile.position.y += stepDistance * projectile.direction.y;
    const collider = getProjectileCollider(projectile);

    if (obstacles.some((obstacle) => collidersOverlap(collider, obstacle))) {
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
