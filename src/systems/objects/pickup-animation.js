export const PICKUP_ANIMATION_SECONDS = 0.18;
export const PICKUP_ANIMATION_RISE = 50;

export function getPickupAnimation(elapsedSeconds) {
  const progress = Math.min(1, Math.max(0, elapsedSeconds) / PICKUP_ANIMATION_SECONDS);
  return { rise: PICKUP_ANIMATION_RISE * progress, opacity: 1 - progress, complete: progress === 1 };
}
