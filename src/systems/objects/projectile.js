import { collidersOverlap } from "../../gameplay/game-logic.js";
import { GRID } from "../environment/grid-contract.js";

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
    const facing = Math.sign(direction.x) || Math.sign(dx) || 1;
    const distance = Math.max(1, Math.min(4, Math.round(Math.abs(dx) / GRID.tileSizePx))) * GRID.tileSizePx;
    // Preserve the approved release tangent, but use it as elevation rather
    // than letting it move the landing point upwards through the world.
    const initialDirection = options.initialVelocityDirection ?? { x: facing, y: 1 };
    const slope = Math.abs(initialDirection.y) / Math.max(0.001, Math.abs(initialDirection.x));
    projectile.origin = { ...position };
    projectile.range = facing * distance;
    projectile.landingDrop = 0;
    if (Number.isFinite(options.landingCenterY)) {
      // Cropping the tip half leaves a midpoint 16 px back along the shaft.
      // Solve the lower full-sprite endpoint so that remaining midpoint, not
      // the transparent frame or buried tip, finishes at the archer's center.
      projectile.cropOnLanding = true;
      let drop = position.y - options.landingCenterY;
      for (let i = 0; i < 24; i += 1) {
        const descent = slope * distance + 2 * drop;
        drop = position.y - options.landingCenterY + 16 * descent / Math.hypot(distance, descent);
      }
      projectile.landingDrop = drop;
    }
    projectile.arcHeight = (distance * slope + projectile.landingDrop) / 4;
    projectile.flightSeconds = Math.max(0.4, (distance + projectile.landingDrop) / Math.max(1, projectile.speed));
    projectile.elapsedSeconds = 0;
    projectile.active = true;
    projectile.state = "flying";
    projectile.velocity = { x: projectile.range / projectile.flightSeconds, y: 0 };
    projectile.height = 0;
    projectile.verticalVelocity = (4 * projectile.arcHeight - projectile.landingDrop) / projectile.flightSeconds;
    projectile.flightVelocity = { x: projectile.velocity.x, y: projectile.verticalVelocity };
    projectile.direction = { x: facing, y: 0 };
    projectile.arc = true;
  }
  return projectile;
}

export function getProjectileCollider(projectile) {
  if (projectile.arc) {
    const velocity = projectile.flightVelocity;
    const length = Math.hypot(velocity.x, velocity.y) || 1;
    const width = Math.abs(velocity.x / length) * 64 + Math.abs(velocity.y / length) * 10;
    const height = Math.abs(velocity.y / length) * 64 + Math.abs(velocity.x / length) * 10;
    return { x: projectile.position.x - width / 2, y: projectile.position.y + projectile.height - height / 2, width, height };
  }
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

export function advanceProjectile(projectile, deltaSeconds, bounds, obstacles, onFlightStep = () => false) {
  if (projectile.arc) {
    if (!projectile.active) return { alive: true, reason: "landing" };
    const start = projectile.elapsedSeconds;
    const end = Math.min(projectile.flightSeconds, start + Math.max(0, deltaSeconds));
    // The bound on arc speed keeps each collision sample within one world pixel.
    const travelBound = Math.abs(projectile.range) + Math.abs(projectile.landingDrop) + 4 * Math.abs(projectile.arcHeight);
    const steps = Math.max(1, Math.ceil((end - start) / projectile.flightSeconds * travelBound));
    for (let step = 0; step <= steps; step++) {
      projectile.elapsedSeconds = step === steps ? end : start + (end - start) * step / steps;
      const progress = projectile.elapsedSeconds / projectile.flightSeconds;
      projectile.position.x = projectile.origin.x + projectile.range * progress;
      projectile.position.y = projectile.origin.y - projectile.landingDrop * progress;
      projectile.height = 4 * projectile.arcHeight * progress * (1 - progress);
      projectile.verticalVelocity = (4 * projectile.arcHeight * (1 - 2 * progress) - projectile.landingDrop) / projectile.flightSeconds;
      projectile.flightVelocity = { x: projectile.velocity.x, y: projectile.verticalVelocity };
      const collider = getProjectileCollider(projectile);
      if (projectile.collisionEnabled && onFlightStep(collider)) return { alive: false, reason: "hit" };
      if (projectile.collisionEnabled && obstacles.some(obstacle => collidersOverlap(collider, obstacle))) return { alive: false, reason: "collision" };
    }
    if (end === projectile.flightSeconds) {
      projectile.height = 0;
      projectile.active = false;
      projectile.state = "landed";
      projectile.collisionEnabled = false;
      return { alive: true, reason: "landing" };
    }
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
