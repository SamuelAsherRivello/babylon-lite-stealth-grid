export const PERCEPTION_STATES = Object.freeze({
  NONE: "NONE",
  SUSPICIOUS: "SUSPICIOUS",
  INVESTIGATING: "INVESTIGATING",
  ALERT: "ALERT",
});

const TYPES = Object.freeze({ VISUAL: "visual", AUDIO: "audio" });
const STATE_SEVERITY = Object.freeze({
  [PERCEPTION_STATES.NONE]: 0,
  [PERCEPTION_STATES.SUSPICIOUS]: 1,
  [PERCEPTION_STATES.INVESTIGATING]: 2,
  [PERCEPTION_STATES.ALERT]: 3,
});
const DEFAULT_PROFILE = Object.freeze({
  suspiciousDuration: Object.freeze([1, 3]),
  investigationDuration: 8,
  searchDirectionDuration: 2,
  alertedDuration: Object.freeze([3, 5]),
  suspiciousThreshold: 0.25,
  investigatingThreshold: 0.5,
  alertedThreshold: 1,
  audioCanAlert: false,
});

function assertRange(value, name) {
  if (!Array.isArray(value) || value.length !== 2 || !value.every(Number.isFinite)
    || value[0] < 0 || value[1] < value[0]) throw new TypeError(`${name} must be a non-negative [min, max] range`);
  return Object.freeze([...value]);
}

function assertDuration(value, name) {
  if (!Number.isFinite(value) || value < 0) throw new TypeError(`${name} must be non-negative`);
  return value;
}

function copyCell(cell) {
  if (cell == null) return null;
  if (!Number.isInteger(cell.x) || !Number.isInteger(cell.y)) throw new TypeError("cells require integer x and y");
  return { x: cell.x, y: cell.y };
}

function freezeSnapshot(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freezeSnapshot);
    Object.freeze(value);
  }
  return value;
}

function durationFrom(value, random) {
  return value[0] + (value[1] - value[0]) * random();
}

export function createEnemyPerceptionReaction({ profile = {}, random = Math.random,
  onStateChange = () => {}, onFace = () => {}, onMoveTo = () => {} } = {}) {
  if (typeof random !== "function") throw new TypeError("random must be a function");
  const merged = { ...DEFAULT_PROFILE, ...profile };
  const config = Object.freeze({
    ...merged,
    suspiciousDuration: assertRange(merged.suspiciousDuration, "suspiciousDuration"),
    alertedDuration: assertRange(merged.alertedDuration, "alertedDuration"),
    investigationDuration: assertDuration(merged.investigationDuration, "investigationDuration"),
    searchDirectionDuration: assertDuration(merged.searchDirectionDuration, "searchDirectionDuration"),
  });
  ["suspiciousThreshold", "investigatingThreshold", "alertedThreshold"].forEach((key) => {
    if (!Number.isFinite(config[key]) || config[key] < 0 || config[key] > 1) throw new TypeError(`${key} must be between 0 and 1`);
  });
  let state = PERCEPTION_STATES.NONE;
  let suspicionCell = null;
  let alertedCell = null;
  let lastKnownCell = null;
  let remainingSeconds = 0;
  let searchDirectionIndex = 0;

  function setState(next, duration = 0) {
    if (state !== next) { const previous = state; state = next; onStateChange(next, previous); }
    remainingSeconds = duration;
  }
  function snapshot() {
    return freezeSnapshot({ state, suspicionCell: copyCell(suspicionCell), alertedCell: copyCell(alertedCell),
      lastKnownCell: copyCell(lastKnownCell), remainingSeconds, searchDirectionIndex });
  }
  function acceptDetection(event) {
    if (!event || !event.cell || !Number.isFinite(event.strength)) throw new TypeError("detection requires a cell and finite strength");
    const type = event.type ?? TYPES.VISUAL;
    if (type !== TYPES.VISUAL && type !== TYPES.AUDIO) throw new TypeError("unsupported detection type");
    const cell = copyCell(event.cell);
    const strength = Math.max(0, Math.min(1, event.strength));
    const candidate = strength >= config.alertedThreshold && (type === TYPES.VISUAL || config.audioCanAlert)
      ? PERCEPTION_STATES.ALERT
      : strength >= config.investigatingThreshold
        ? PERCEPTION_STATES.INVESTIGATING
        : strength >= config.suspiciousThreshold
          ? PERCEPTION_STATES.SUSPICIOUS
          : PERCEPTION_STATES.NONE;

    if (state === PERCEPTION_STATES.ALERT && type === TYPES.VISUAL
      && candidate === PERCEPTION_STATES.ALERT) {
      lastKnownCell = cell;
      alertedCell = cell;
      remainingSeconds = durationFrom(config.alertedDuration, random);
      onMoveTo(cell);
      return snapshot();
    }

    if (STATE_SEVERITY[candidate] <= STATE_SEVERITY[state]) return snapshot();

    lastKnownCell = cell;
    if (candidate === PERCEPTION_STATES.ALERT) {
      alertedCell = cell;
      setState(PERCEPTION_STATES.ALERT, durationFrom(config.alertedDuration, random));
      onMoveTo(cell);
    } else if (candidate === PERCEPTION_STATES.INVESTIGATING) {
      suspicionCell = cell;
      searchDirectionIndex = 0;
      setState(PERCEPTION_STATES.INVESTIGATING, config.investigationDuration);
      onMoveTo(cell);
    } else if (candidate === PERCEPTION_STATES.SUSPICIOUS) {
      suspicionCell = cell;
      setState(PERCEPTION_STATES.SUSPICIOUS, durationFrom(config.suspiciousDuration, random));
      onFace(cell);
    }
    return snapshot();
  }
  function update(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) throw new TypeError("deltaSeconds must be non-negative and finite");
    if (state === PERCEPTION_STATES.NONE) return snapshot();
    remainingSeconds = Math.max(0, remainingSeconds - deltaSeconds);
    if (state === PERCEPTION_STATES.INVESTIGATING && config.searchDirectionDuration > 0) {
      const elapsed = config.investigationDuration - remainingSeconds;
      const nextDirection = Math.min(3, Math.floor(elapsed / config.searchDirectionDuration));
      if (nextDirection !== searchDirectionIndex) {
        searchDirectionIndex = nextDirection;
        if (suspicionCell ?? lastKnownCell) onFace(suspicionCell ?? lastKnownCell, searchDirectionIndex);
      }
    }
    if (remainingSeconds > 0) return snapshot();
    if (state === PERCEPTION_STATES.ALERT) {
      setState(PERCEPTION_STATES.INVESTIGATING, config.investigationDuration);
      searchDirectionIndex = 0;
      if (lastKnownCell) onMoveTo(lastKnownCell);
    } else if (state === PERCEPTION_STATES.INVESTIGATING) {
      setState(PERCEPTION_STATES.SUSPICIOUS, durationFrom(config.suspiciousDuration, random));
      if (suspicionCell) onFace(suspicionCell);
    } else {
      state = PERCEPTION_STATES.NONE;
      suspicionCell = null; alertedCell = null; lastKnownCell = null; remainingSeconds = 0;
      onStateChange(PERCEPTION_STATES.NONE, PERCEPTION_STATES.SUSPICIOUS);
    }
    return snapshot();
  }
  function reset() { state = PERCEPTION_STATES.NONE; suspicionCell = null; alertedCell = null; lastKnownCell = null; remainingSeconds = 0; searchDirectionIndex = 0; }
  function forceState(nextState) {
    if (!Object.values(PERCEPTION_STATES).includes(nextState)) throw new TypeError("unsupported perception state");
    if (nextState === PERCEPTION_STATES.NONE) { reset(); return snapshot(); }
    setState(nextState, 999999);
    return snapshot();
  }
  return Object.freeze({ acceptDetection, update, reset, forceState, getSnapshot: snapshot });
}
