export function createPauseController({
  onPause = () => {},
  onResume = () => {},
  now = () => performance.now(),
} = {}) {
  let paused = false;
  let lastResumeTime = null;

  return {
    get isPaused() {
      return paused;
    },
    get lastResumeTime() {
      return lastResumeTime;
    },
    getDelta(deltaSeconds) {
      return paused ? 0 : Math.max(0, deltaSeconds);
    },
    pause() {
      if (paused) {
        return false;
      }
      paused = true;
      onPause();
      return true;
    },
    resume() {
      if (!paused) {
        return lastResumeTime;
      }
      paused = false;
      lastResumeTime = now();
      onResume();
      return lastResumeTime;
    },
  };
}
