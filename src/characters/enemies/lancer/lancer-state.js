export const LancerState = Object.freeze({
  IDLE: "idle",
  WALKING: "walking",
  ATTACK_1: "attack-1",
  ATTACK_2: "attack-2",
  GUARD: "guard",
});

function hasMovement(movement) {
  return movement.x !== 0 || movement.y !== 0;
}

function locomotionState(movement) {
  return hasMovement(movement)
    ? LancerState.WALKING
    : LancerState.IDLE;
}

export function selectLancerAction(name, direction, lastFacing = 1) {
  const facing = direction.x === 0
    ? lastFacing < 0 ? -1 : 1
    : direction.x < 0 ? -1 : 1;
  return { name, facing, flipX: facing < 0 };
}

export function createLancerStateMachine() {
  let state = LancerState.IDLE;

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
      return state === LancerState.ATTACK_1
        || state === LancerState.ATTACK_2
        || state === LancerState.GUARD;
    },
    updateLocomotion(movement) {
      if (this.movementLocked) {
        return { changed: false, state };
      }
      return transition(locomotionState(movement));
    },
    startAttack(name) {
      if (
        this.movementLocked
        || (name !== LancerState.ATTACK_1 && name !== LancerState.ATTACK_2)
      ) {
        return { changed: false, state };
      }
      return transition(name);
    },
    startDefense() {
      return transition(LancerState.GUARD);
    },
    completeDefense(movement) {
      if (state !== LancerState.GUARD) {
        return { changed: false, state };
      }
      return transition(locomotionState(movement));
    },
    completeAttack(movement) {
      if (
        state !== LancerState.ATTACK_1
        && state !== LancerState.ATTACK_2
      ) {
        return { changed: false, state };
      }
      return transition(locomotionState(movement));
    },
    setGuarding(enabled, movement = { x: 0, y: 0 }) {
      if (enabled) {
        if (
          state === LancerState.ATTACK_1
          || state === LancerState.ATTACK_2
        ) {
          return { changed: false, state };
        }
        return transition(LancerState.GUARD);
      }
      if (state !== LancerState.GUARD) {
        return { changed: false, state };
      }
      return transition(locomotionState(movement));
    },
  };
}
