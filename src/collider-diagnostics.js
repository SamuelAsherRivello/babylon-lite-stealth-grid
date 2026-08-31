export const COMBAT_COLLIDER_STYLE = Object.freeze({
  fillStyle: "rgb(255 70 70 / 22%)",
  strokeStyle: "#ff4646",
});

export const MOVEMENT_COLLIDER_STYLE = Object.freeze({
  fillStyle: "rgb(64 208 112 / 22%)",
  strokeStyle: "#40d070",
});

export function createCharacterColliderDrawCommands(characters) {
  return [
    ...characters
      .filter(({ combatCollider }) => Boolean(combatCollider))
      .map(({ combatCollider }) => ({
        collider: combatCollider,
        style: COMBAT_COLLIDER_STYLE,
      })),
    ...characters
      .filter(({ movementCollider }) => Boolean(movementCollider))
      .map(({ movementCollider }) => ({
        collider: movementCollider,
        style: MOVEMENT_COLLIDER_STYLE,
      })),
  ];
}
