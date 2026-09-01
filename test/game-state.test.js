import test from "node:test";
import assert from "node:assert/strict";
import { createGameStateMachine, GameState } from "../src/gameplay/game-state.js";
test("level lifecycle is start, playing after assets, then complete after goal", () => {
  const game = createGameStateMachine();
  assert.equal(game.state, GameState.LEVEL_START);
  assert.equal(game.shouldShowLevelCompletePrompt(), false);
  game.assetsLoaded();
  assert.equal(game.state, GameState.LEVEL_PLAYING);
  assert.equal(game.shouldShowLevelCompletePrompt(), false);
  game.goalReached();
  assert.equal(game.state, GameState.LEVEL_COMPLETE);
  assert.equal(game.shouldShowLevelCompletePrompt(), true);
});
test("goal cannot complete before assets load", () => {
  const game = createGameStateMachine();
  game.goalReached();
  assert.equal(game.state, GameState.LEVEL_START);
  assert.equal(game.shouldShowLevelCompletePrompt(), false);
});
