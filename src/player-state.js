export const PlayerState = Object.freeze({
  IDLE: "idle",
  RUNNING: "running",
  SHOOTING: "shooting",
});

export function createPlayerStateMachine({ releaseFrame = 5 } = {}) {
  let state = PlayerState.IDLE;
  let facing = 1;
  let shotReleased = false;

  function transition(nextState) {
    const changed = state !== nextState;
    state = nextState;
    return { changed, state };
  }

  function updateFacing(movement) {
    if (movement.x !== 0) {
      facing = movement.x < 0 ? -1 : 1;
    }
  }

  return {
    get state() {
      return state;
    },
    get facing() {
      return facing;
    },
    get movementLocked() {
      return state === PlayerState.SHOOTING;
    },
    updateLocomotion(movement) {
      if (state === PlayerState.SHOOTING) {
        return { changed: false, state };
      }
      updateFacing(movement);
      return transition(
        movement.x !== 0 || movement.y !== 0
          ? PlayerState.RUNNING
          : PlayerState.IDLE,
      );
    },
    startShooting() {
      if (state === PlayerState.SHOOTING) {
        return { changed: false, state };
      }
      shotReleased = false;
      return transition(PlayerState.SHOOTING);
    },
    releaseShot(currentFrame) {
      if (
        state !== PlayerState.SHOOTING
        || shotReleased
        || currentFrame < releaseFrame
      ) {
        return false;
      }
      shotReleased = true;
      return true;
    },
    completeShooting(movement) {
      if (state !== PlayerState.SHOOTING) {
        return { changed: false, state };
      }
      updateFacing(movement);
      return transition(
        movement.x !== 0 || movement.y !== 0
          ? PlayerState.RUNNING
          : PlayerState.IDLE,
      );
    },
  };
}
