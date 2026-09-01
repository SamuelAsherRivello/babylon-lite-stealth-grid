export const ARCHER_FACING_RANGE = 5 * 64;
export const ARCHER_ATTACK_RANGE = 4 * 64;
export const ARCHER_RECOVERY_SECONDS = 0.75;

export function getDistanceSquared(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return dx * dx + dy * dy;
}

export function chooseArcherAction(position, player, state = "ready") {
  if (!player || player.isAlive === false) return { state, facing: 0, target: null };
  const distanceSquared = getDistanceSquared(position, player.position);
  const facing = player.position.x < position.x ? -1 : 1;
  if (state === "ready" && distanceSquared <= ARCHER_ATTACK_RANGE ** 2) {
    return { state: "shooting", facing, target: { ...player.position } };
  }
  return {
    state,
    facing: distanceSquared <= ARCHER_FACING_RANGE ** 2 ? facing : 0,
    target: null,
  };
}
