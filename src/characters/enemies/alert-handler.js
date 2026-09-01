export const ALERT_RESPONSES = Object.freeze({ WALK: "walk", FACE: "face", NONE: "none" });

export function createAlertHandler({ random = Math.random, alertSeconds = 1, cooldownSeconds = 1, onWalk = () => {}, onFace = () => {}, onStop = () => {}, onComplete = () => {} } = {}) {
  if (!Number.isFinite(alertSeconds) || alertSeconds < 0 || !Number.isFinite(cooldownSeconds) || cooldownSeconds < 0) throw new TypeError("alert durations must be non-negative");
  let remaining = 0;
  let priorState = null;
  let active = false;
  return {
    get isAlerted() { return active; },
    get remainingSeconds() { return remaining; },
    accept(event, state = null) {
      if (active) return false;
      active = true; priorState = state; remaining = Math.max(0, alertSeconds + cooldownSeconds);
      if (event.strength >= 1) onWalk(event.cell);
      else if (event.strength >= 0.5) { if (random() < 0.75) onWalk(event.cell); else onStop(); }
      else { onStop(); onFace(event.cell); }
      return true;
    },
    update(deltaSeconds) {
      if (!active) return false;
      if (!Number.isFinite(deltaSeconds)) throw new TypeError("deltaSeconds must be finite");
      remaining = Math.max(0, remaining - Math.max(0, deltaSeconds));
      if (remaining === 0) { active = false; onComplete(priorState); priorState = null; return true; }
      return false;
    },
  };
}
