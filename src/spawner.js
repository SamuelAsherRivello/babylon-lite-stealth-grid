export const DEFAULT_SPAWN_CHECK_INTERVAL_SECONDS = 1;
export const SPAWN_MODE_NEARBY = "nearby";
export const SPAWN_MODE_ANYWHERE_WALKABLE = "anywhere-walkable";

function requireNonNegativeInteger(name, value) {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative integer`);
  }
}

export function selectWeightedSpawnCount(remainingCapacity, randomValue) {
  requireNonNegativeInteger("remainingCapacity", remainingCapacity);
  if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
    throw new RangeError("randomValue must be within [0, 1)");
  }
  if (remainingCapacity === 0) {
    return 0;
  }
  return Math.floor((randomValue ** 2) * (remainingCapacity + 1));
}

export function createSpawner({
  type,
  character = type,
  position,
  minimumCount,
  maximumCount,
  checkIntervalSeconds = DEFAULT_SPAWN_CHECK_INTERVAL_SECONDS,
  guaranteeInitialPopulation = false,
  random = Math.random,
  tileSize = null,
  spawnMode = SPAWN_MODE_NEARBY,
  spawnMaxDistance = 1,
  getWalkableCells = null,
  isWalkable = () => true,
  getActorPosition = (actor) => actor?.position ?? actor?.actor?.getPosition?.(),
  createActor,
  disposeActor = (actor) => actor?.dispose?.(),
}) {
  if (typeof type !== "string" || type.length === 0) {
    throw new TypeError("type must be a non-empty string");
  }
  if (
    !position
    || !Number.isFinite(position.x)
    || !Number.isFinite(position.y)
  ) {
    throw new TypeError("position must contain finite x and y values");
  }
  requireNonNegativeInteger("minimumCount", minimumCount);
  requireNonNegativeInteger("maximumCount", maximumCount);
  if (minimumCount > maximumCount) {
    throw new RangeError("minimumCount must not exceed maximumCount");
  }
  if (!Number.isFinite(checkIntervalSeconds) || checkIntervalSeconds <= 0) {
    throw new RangeError("checkIntervalSeconds must be a positive number");
  }
  if (typeof random !== "function") {
    throw new TypeError("random must be a function");
  }
  if (tileSize !== null && (!Number.isFinite(tileSize) || tileSize <= 0)) {
    throw new RangeError("tileSize must be a positive number or null");
  }
  if (![SPAWN_MODE_NEARBY, SPAWN_MODE_ANYWHERE_WALKABLE].includes(spawnMode)) {
    throw new RangeError("spawnMode must be 'nearby' or 'anywhere-walkable'");
  }
  if (!Number.isInteger(spawnMaxDistance) || spawnMaxDistance < 0) {
    throw new RangeError("spawnMaxDistance must be a non-negative integer");
  }
  if (getWalkableCells !== null && typeof getWalkableCells !== "function") {
    throw new TypeError("getWalkableCells must be a function or null");
  }
  if (typeof isWalkable !== "function") {
    throw new TypeError("isWalkable must be a function");
  }
  if (typeof getActorPosition !== "function") {
    throw new TypeError("getActorPosition must be a function");
  }
  if (typeof createActor !== "function") {
    throw new TypeError("createActor must be a function");
  }
  if (typeof disposeActor !== "function") {
    throw new TypeError("disposeActor must be a function");
  }

  const actors = [];
  let initialized = false;
  let disposed = false;
  let elapsedSeconds = 0;

  const config = Object.freeze({
    type,
    character,
    position: Object.freeze({ ...position }),
    minimumCount,
    maximumCount,
    checkIntervalSeconds,
    guaranteeInitialPopulation: Boolean(guaranteeInitialPopulation),
    spawnMode,
    spawnMaxDistance,
  });

  function getNearbySpawnPositions() {
    if (tileSize === null) {
      return [{ ...config.position }];
    }
    const occupiedCells = new Set(actors.map(getActorPosition)
      .filter((actorPosition) => (
        actorPosition
        && Number.isFinite(actorPosition.x)
        && Number.isFinite(actorPosition.y)
      ))
      .map((actorPosition) => (
        `${Math.floor(actorPosition.x / tileSize)},${Math.floor(actorPosition.y / tileSize)}`
      )));
    const centerCell = {
      x: Math.floor(config.position.x / tileSize),
      y: Math.floor(config.position.y / tileSize),
    };
    const candidates = [];
    for (let yOffset = -config.spawnMaxDistance; yOffset <= config.spawnMaxDistance; yOffset += 1) {
      for (let xOffset = -config.spawnMaxDistance; xOffset <= config.spawnMaxDistance; xOffset += 1) {
        const cell = { x: centerCell.x + xOffset, y: centerCell.y + yOffset };
        const candidate = {
          x: (cell.x + 0.5) * tileSize,
          y: (cell.y + 0.5) * tileSize,
        };
        if (!occupiedCells.has(`${cell.x},${cell.y}`) && isWalkable(candidate, cell)) {
          candidates.push(candidate);
        }
      }
    }
    return candidates;
  }

  function getAnywhereSpawnPositions() {
    if (!getWalkableCells) return [];
    return getWalkableCells().map((cell) => ({
      x: (cell.x + 0.5) * tileSize,
      y: (cell.y + 0.5) * tileSize,
    }));
  }

  function spawn(count) {
    let created = 0;
    for (let index = 0; index < count; index += 1) {
      const candidates = tileSize === null
        ? [{ ...config.position }]
        : config.spawnMode === SPAWN_MODE_ANYWHERE_WALKABLE
          ? getAnywhereSpawnPositions().filter((candidate) => isWalkable(
            candidate,
            { x: Math.floor(candidate.x / tileSize), y: Math.floor(candidate.y / tileSize) },
          ))
          : getNearbySpawnPositions();
      if (candidates.length === 0) {
        break;
      }
      const centerIndex = actors.length === 0
        ? candidates.findIndex(({ x, y }) => x === config.position.x && y === config.position.y)
        : -1;
      const selectedIndex = tileSize === null || centerIndex >= 0
        ? Math.max(0, centerIndex)
        : Math.min(Math.floor(random() * candidates.length), candidates.length - 1);
      const actor = createActor(candidates[selectedIndex]);
      if (!actor) {
        throw new Error(`Spawner '${type}' createActor returned no actor`);
      }
      actors.push(actor);
      created += 1;
    }
    return created;
  }

  function evaluate({ guaranteeMinimum = false } = {}) {
    if (disposed || actors.length >= minimumCount) {
      return 0;
    }
    if (guaranteeMinimum) {
      return spawn(Math.min(minimumCount - actors.length, maximumCount - actors.length));
    }
    const remainingCapacity = Math.max(0, maximumCount - actors.length);
    return spawn(selectWeightedSpawnCount(remainingCapacity, random()));
  }

  return {
    config,
    get actors() {
      return [...actors];
    },
    initialize() {
      if (initialized || disposed) {
        return 0;
      }
      initialized = true;
      return evaluate({ guaranteeMinimum: config.guaranteeInitialPopulation });
    },
    update(deltaSeconds) {
      if (disposed) {
        return 0;
      }
      if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
        throw new RangeError("deltaSeconds must be a non-negative number");
      }
      if (!initialized) {
        this.initialize();
      }
      elapsedSeconds += deltaSeconds;
      let created = 0;
      while (elapsedSeconds >= checkIntervalSeconds) {
        elapsedSeconds -= checkIntervalSeconds;
        created += evaluate();
      }
      return created;
    },
    remove(actor) {
      const index = actors.indexOf(actor);
      if (index === -1) {
        return false;
      }
      actors.splice(index, 1);
      disposeActor(actor);
      return true;
    },
    dispose() {
      if (disposed) {
        return;
      }
      disposed = true;
      for (const actor of actors.splice(0)) {
        disposeActor(actor);
      }
    },
  };
}
