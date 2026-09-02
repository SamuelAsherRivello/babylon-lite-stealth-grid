export const GameState = Object.freeze({ LEVEL_START: "LEVEL_START", LEVEL_PLAYING: "LEVEL_PLAYING", LEVEL_COMPLETE: "LEVEL_COMPLETE", LEVEL_DYING: "LEVEL_DYING", LEVEL_LOST: "LEVEL_LOST" });
export function createGameStateMachine() {
  let state = GameState.LEVEL_START;
  return {
    get state() { return state; },
    assetsLoaded() { if (state === GameState.LEVEL_START) state = GameState.LEVEL_PLAYING; return state; },
    goalReached() { if (state === GameState.LEVEL_PLAYING) state = GameState.LEVEL_COMPLETE; return state; },
    playerDefeated() { if (state === GameState.LEVEL_PLAYING) state = GameState.LEVEL_DYING; return state; },
    deathCompleted() { if (state === GameState.LEVEL_DYING) state = GameState.LEVEL_LOST; return state; },
    shouldShowLevelCompletePrompt() { return state === GameState.LEVEL_COMPLETE; },
  };
}
