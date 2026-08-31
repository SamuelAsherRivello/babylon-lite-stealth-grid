const PHASES = Object.freeze([
  Object.freeze({ duration: 3, movement: { x: 0, y: 0 } }),
  Object.freeze({ duration: 1.5, movement: { x: 1, y: 0 } }),
  Object.freeze({
    duration: 0.8,
    movement: { x: 0, y: 0 },
    attack: "attack-1",
  }),
  Object.freeze({
    duration: 0.8,
    movement: { x: 0, y: 0 },
    attack: "attack-2",
  }),
  Object.freeze({
    duration: 1.2,
    movement: { x: 0, y: 0 },
    guarding: true,
  }),
  Object.freeze({
    duration: 1,
    movement: { x: -1, y: 0 },
    guarding: false,
  }),
]);

export function createWarriorDemoController(warrior) {
  let phaseIndex = 0;
  let elapsedSeconds = 0;

  function enterPhase() {
    const phase = PHASES[phaseIndex];
    warrior.setMovementIntent(phase.movement);
    if (phase.attack) warrior.attack(phase.attack, { x: 1, y: 0 });
    if (phase.guarding !== undefined) warrior.setGuarding(phase.guarding);
  }

  enterPhase();
  return {
    get phaseIndex() {
      return phaseIndex;
    },
    update(deltaSeconds) {
      elapsedSeconds += Math.max(0, deltaSeconds);
      if (elapsedSeconds < PHASES[phaseIndex].duration) return;
      elapsedSeconds = 0;
      phaseIndex = (phaseIndex + 1) % PHASES.length;
      enterPhase();
    },
  };
}
