export const EnemyState = Object.freeze({
  IDLE: "idle",
  WALKING: "walking",
  ATTACKING: "attacking",
});

function hasMovement(movement) {
  return movement.x !== 0 || movement.y !== 0;
}

export function createEnemyStateMachine() {
  let state = EnemyState.IDLE;

  function transition(nextState) {
    const changed = state !== nextState;
    state = nextState;
    return { changed, state };
  }

  return {
    get state() {
      return state;
    },
    get movementLocked() {
      return state === EnemyState.ATTACKING;
    },
    updateLocomotion(movement) {
      if (state === EnemyState.ATTACKING) {
        return { changed: false, state };
      }
      return transition(
        hasMovement(movement) ? EnemyState.WALKING : EnemyState.IDLE,
      );
    },
    startAttack() {
      if (state === EnemyState.ATTACKING) {
        return { changed: false, state };
      }
      return transition(EnemyState.ATTACKING);
    },
    completeAttack(movement) {
      if (state !== EnemyState.ATTACKING) {
        return { changed: false, state };
      }
      return transition(
        hasMovement(movement) ? EnemyState.WALKING : EnemyState.IDLE,
      );
    },
  };
}
