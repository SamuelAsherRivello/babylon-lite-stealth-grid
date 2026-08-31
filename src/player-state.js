export const PlayerState = Object.freeze({
  IDLE: "idle",
  RUNNING: "running",
  ATTACKING: "attacking",
  SHOOTING: "attacking",
});

export function createPlayerStateMachine({ releaseFrame = 5 } = {}) {
  let state = PlayerState.IDLE;
  let facing = 1;
  let shotReleased = false;
  let shotDirection = { x: 1, y: 0 };
  let attackWeapon = null;

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
    get shotDirection() {
      return { ...shotDirection };
    },
    get movementLocked() {
      return false;
    },
    updateLocomotion(movement) {
      if (state === PlayerState.ATTACKING) return { changed: false, state };
      updateFacing(movement);
      return transition(
        movement.x !== 0 || movement.y !== 0
          ? PlayerState.RUNNING
          : PlayerState.IDLE,
      );
    },
    startShooting(direction = { x: facing, y: 0 }, weapon = null) {
      if (state === PlayerState.ATTACKING) {
        return { changed: false, state };
      }
      attackWeapon = weapon;
      shotDirection = { x: direction.x, y: direction.y };
      shotReleased = false;
      return transition(PlayerState.ATTACKING);
    },
    startAttack(weapon) {
      if (!weapon || state === PlayerState.ATTACKING) {
        return { changed: false, state };
      }
      attackWeapon = weapon;
      return transition(PlayerState.ATTACKING);
    },
    get attackWeapon() {
      return attackWeapon;
    },
    get canChangeLoadout() {
      return state !== PlayerState.ATTACKING;
    },
    releaseShot(currentFrame) {
      if (
        state !== PlayerState.ATTACKING
        || shotReleased
        || currentFrame < releaseFrame
      ) {
        return false;
      }
      shotReleased = true;
      return true;
    },
    completeShooting(movement) {
      if (state !== PlayerState.ATTACKING) {
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
