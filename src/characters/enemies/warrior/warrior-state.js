export const WarriorState = Object.freeze({
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
    ? WarriorState.WALKING
    : WarriorState.IDLE;
}

export function selectWarriorAction(name, direction, lastFacing = 1) {
  const facing = direction.x === 0
    ? lastFacing < 0 ? -1 : 1
    : direction.x < 0 ? -1 : 1;
  return { name, facing, flipX: facing < 0 };
}

export function createWarriorStateMachine() {
  let state = WarriorState.IDLE;

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
      return state === WarriorState.ATTACK_1
        || state === WarriorState.ATTACK_2
        || state === WarriorState.GUARD;
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
        || (name !== WarriorState.ATTACK_1 && name !== WarriorState.ATTACK_2)
      ) {
        return { changed: false, state };
      }
      return transition(name);
    },
    startDefense() {
      return transition(WarriorState.GUARD);
    },
    completeDefense(movement) {
      if (state !== WarriorState.GUARD) {
        return { changed: false, state };
      }
      return transition(locomotionState(movement));
    },
    completeAttack(movement) {
      if (
        state !== WarriorState.ATTACK_1
        && state !== WarriorState.ATTACK_2
      ) {
        return { changed: false, state };
      }
      return transition(locomotionState(movement));
    },
    setGuarding(enabled, movement = { x: 0, y: 0 }) {
      if (enabled) {
        if (
          state === WarriorState.ATTACK_1
          || state === WarriorState.ATTACK_2
        ) {
          return { changed: false, state };
        }
        return transition(WarriorState.GUARD);
      }
      if (state !== WarriorState.GUARD) {
        return { changed: false, state };
      }
      return transition(locomotionState(movement));
    },
  };
}
