const PHASES = Object.freeze([
  Object.freeze({ idleDuration: [3, 5], movement: { x: 0, y: 0 } }),
  Object.freeze({ duration: 1.5, movement: { x: 1, y: 0 } }),
  Object.freeze({
    duration: 0.8,
    movement: { x: 0, y: 0 },
    attack: { x: 1, y: 0 },
  }),
  Object.freeze({ duration: 1.5, movement: { x: -1, y: 0 } }),
  Object.freeze({
    duration: 0.8,
    movement: { x: 0, y: 0 },
    attack: { x: -1, y: 0 },
  }),
  Object.freeze({ duration: 1.2, movement: { x: 0, y: 1 } }),
  Object.freeze({
    duration: 0.8,
    movement: { x: 0, y: 0 },
    attack: { x: 0, y: 1 },
  }),
  Object.freeze({ duration: 1.2, movement: { x: 0, y: -1 } }),
  Object.freeze({
    duration: 0.8,
    movement: { x: 0, y: 0 },
    attack: { x: 0, y: -1 },
  }),
]);

function getPhaseDuration(phase, random) {
  if (!phase.idleDuration) {
    return phase.duration;
  }
  const [minimum, maximum] = phase.idleDuration;
  const normalizedRandom = Math.max(0, Math.min(1, random()));
  return minimum + ((maximum - minimum) * normalizedRandom);
}

export function createGoblinDemoController(
  goblin,
  { random = Math.random } = {},
) {
  let phaseIndex = 0;
  let elapsedSeconds = 0;
  let phaseDuration = 0;

  function enterPhase() {
    const phase = PHASES[phaseIndex];
    phaseDuration = getPhaseDuration(phase, random);
    goblin.setMovementIntent(phase.movement);
    if (phase.attack) {
      goblin.attack(phase.attack);
    }
  }

  enterPhase();
  return {
    get phaseIndex() {
      return phaseIndex;
    },
    update(deltaSeconds) {
      elapsedSeconds += Math.max(0, deltaSeconds);
      if (elapsedSeconds < phaseDuration) {
        return;
      }
      elapsedSeconds = 0;
      phaseIndex = (phaseIndex + 1) % PHASES.length;
      enterPhase();
    },
  };
}
