export const CharacterType = Object.freeze({
  PLAYER: "player",
  ENEMY: "enemy",
});

export const SheepState = Object.freeze({
  IDLE: "idle",
  BOUNCING: "bouncing",
  RUNNING: "running",
});

const VALID_CHARACTER_TYPES = new Set(Object.values(CharacterType));

export function createFearProfile({
  scareDistanceCells = 3,
  frighteningTypes = [CharacterType.PLAYER],
} = {}) {
  if (!Number.isInteger(scareDistanceCells) || scareDistanceCells < 0) {
    throw new RangeError("scareDistanceCells must be a non-negative integer.");
  }
  const types = new Set(frighteningTypes);
  if ([...types].some((type) => !VALID_CHARACTER_TYPES.has(type))) {
    throw new TypeError("frighteningTypes may contain only player and enemy.");
  }
  return Object.freeze({ scareDistanceCells, frighteningTypes: types });
}

export function chebyshevDistance(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function findNearestThreat(sheepCell, characters, fearProfile) {
  let nearest = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const character of characters) {
    if (!fearProfile.frighteningTypes.has(character.type)) {
      continue;
    }
    const distance = chebyshevDistance(sheepCell, character.cell);
    if (distance <= fearProfile.scareDistanceCells && distance < nearestDistance) {
      nearest = character;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function createSheepStateMachine({ fearProfile = createFearProfile() } = {}) {
  let state = SheepState.IDLE;
  let threat = null;

  return {
    get state() {
      return state;
    },
    get threat() {
      return threat;
    },
    updateFear(sheepCell, characters) {
      if (state !== SheepState.IDLE) {
        return { changed: false, state };
      }
      const detectedThreat = findNearestThreat(sheepCell, characters, fearProfile);
      if (!detectedThreat) {
        return { changed: false, state };
      }
      threat = detectedThreat;
      state = SheepState.BOUNCING;
      return { changed: true, state, threat };
    },
    completeBouncing(hasRoute) {
      if (state !== SheepState.BOUNCING) {
        return { changed: false, state };
      }
      state = hasRoute ? SheepState.RUNNING : SheepState.IDLE;
      if (!hasRoute) {
        threat = null;
      }
      return { changed: true, state };
    },
    completeRunning() {
      if (state !== SheepState.RUNNING) {
        return { changed: false, state };
      }
      state = SheepState.IDLE;
      threat = null;
      return { changed: true, state };
    },
  };
}

