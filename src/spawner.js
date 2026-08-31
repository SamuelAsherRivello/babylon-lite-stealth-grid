export const DEFAULT_SPAWN_CHECK_INTERVAL_SECONDS = 1;

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
  });

  function spawn(count) {
    let created = 0;
    for (let index = 0; index < count; index += 1) {
      const actor = createActor({ ...config.position });
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
