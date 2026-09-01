export const PERCEPTION_TYPES = Object.freeze({ VISUAL: "visual", AUDIO: "audio" });

export const CARDINAL_DIRECTIONS = Object.freeze({
  up: Object.freeze({ x: 0, y: -1 }),
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 }),
  right: Object.freeze({ x: 1, y: 0 }),
});

const VISUAL_STRENGTHS = Object.freeze([1, 0.75, 0.5, 0.25]);
export const PERCEPTION_MEMORY_SECONDS = 5;

function cellKey(cell) { return `${cell.x},${cell.y}`; }
function copyCell(cell) { return { x: cell.x, y: cell.y }; }

export function getVisualCells(origin, heading, range = 4) {
  const direction = typeof heading === "string" ? CARDINAL_DIRECTIONS[heading] : heading;
  if (!direction || !Number.isInteger(direction.x) || !Number.isInteger(direction.y)
    || Math.abs(direction.x) + Math.abs(direction.y) !== 1
    || !Number.isInteger(range) || range < 0) throw new TypeError("valid cardinal heading and non-negative range are required");
  return Array.from({ length: range }, (_, index) => ({
    x: origin.x + direction.x * (index + 1),
    y: origin.y + direction.y * (index + 1),
  }));
}

export function getAudioCells(origin) {
  const cells = [];
  for (let y = origin.y - 1; y <= origin.y + 1; y += 1) {
    for (let x = origin.x - 1; x <= origin.x + 1; x += 1) {
      if (x !== origin.x || y !== origin.y) cells.push({ x, y });
    }
  }
  return cells;
}

export function getVisualStrength(distance) {
  return VISUAL_STRENGTHS[distance - 1] ?? 0;
}

export function evaluatePerception({ detector, target, isWalkable = () => true, visualRange = 4 }) {
  const origin = detector.cell;
  const targetCell = target.cell;
  const visual = getVisualCells(origin, detector.heading, visualRange);
  const visualIndex = visual.findIndex((cell) => cellKey(cell) === cellKey(targetCell));
  const detections = [];
  if (visualIndex >= 0 && visual.slice(0, visualIndex).every(isWalkable)) {
    detections.push({ type: PERCEPTION_TYPES.VISUAL, strength: getVisualStrength(visualIndex + 1), cell: copyCell(targetCell) });
  }
  if (getAudioCells(origin).some((cell) => cellKey(cell) === cellKey(targetCell))) {
    detections.push({ type: PERCEPTION_TYPES.AUDIO, strength: 1, cell: copyCell(targetCell) });
  }
  return detections;
}

export function createCharacterPerception({ isWalkable = () => true, visualRange = 4, random = Math.random } = {}) {
  const actors = new Map();
  const detections = [];
  const alertState = new Map();
  const knownCells = new Map();
  function register(actor) {
    if (!actor?.id) throw new TypeError("actor with stable id is required");
    actors.set(actor.id, { ...actor });
    alertState.delete(actor.id);
    return () => actors.delete(actor.id);
  }
  function unregister(id) { return actors.delete(id); }
  function updateActor(id, patch) {
    const actor = actors.get(id);
    if (!actor) return false;
    actors.set(id, { ...actor, ...patch });
    return true;
  }
  function snapshot() { return Object.freeze([...actors.values()].map((actor) => Object.freeze({ ...actor, cell: copyCell(actor.cell) }))); }
  function update(deltaSeconds = 0) {
    const elapsed = Math.max(0, Number.isFinite(deltaSeconds) ? deltaSeconds : 0);
    for (const [detectorId, known] of knownCells) {
      known.remaining -= elapsed;
      if (known.remaining <= 0) knownCells.delete(detectorId);
    }
    detections.length = 0;
    const player = [...actors.values()].find((actor) => actor.type === "player" && actor.isAlive !== false);
    if (!player) return [];
    for (const detector of actors.values()) {
      if (detector.type !== "enemy" || detector.isAlive === false) continue;
      for (const detection of evaluatePerception({ detector, target: player, isWalkable, visualRange })) {
        const event = Object.freeze({ detectorId: detector.id, ...detection });
        detections.push(event);
        knownCells.set(detector.id, {
          cell: copyCell(detection.cell),
          remaining: PERCEPTION_MEMORY_SECONDS,
        });
        const state = alertState.get(detector.id) ?? { active: false };
        if (!state.active && detector.onDetection) {
          state.active = true;
          alertState.set(detector.id, state);
          detector.onDetection?.(event, { random });
        }
      }
    }
    return detections.slice();
  }
  function getSnapshot() {
    const known = [...knownCells.entries()].map(([detectorId, { cell }]) => ({
      detectorId,
      cell: copyCell(cell),
    }));
    return Object.freeze({ actors: snapshot(), detections: Object.freeze(detections.slice()), knownDetections: Object.freeze(known) });
  }
  function recover(id) { const state = alertState.get(id); if (state) state.active = false; }
  return Object.freeze({ register, unregister, updateActor, update, recover, snapshot, getSnapshot });
}
