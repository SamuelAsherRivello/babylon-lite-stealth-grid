export function selectGoblinAttackAnimation(direction, lastFacing = 1) {
  const horizontalMagnitude = Math.abs(direction.x);
  const verticalMagnitude = Math.abs(direction.y);

  if (verticalMagnitude > horizontalMagnitude) {
    return {
      name: direction.y > 0 ? "attack-up" : "attack-down",
      flipX: false,
      facing: lastFacing < 0 ? -1 : 1,
    };
  }

  const facing = direction.x === 0
    ? lastFacing < 0 ? -1 : 1
    : direction.x < 0 ? -1 : 1;
  return {
    name: "attack-right",
    flipX: facing < 0,
    facing,
  };
}
