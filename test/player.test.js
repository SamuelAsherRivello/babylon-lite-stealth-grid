import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { PLAYER_COLLIDER, PLAYER_FRAME } from "../src/player.js";

test("player uses a circle collider centered on the previous body box", () => {
  assert.deepEqual(PLAYER_FRAME, { width: 192, height: 192 });
  assert.deepEqual(PLAYER_COLLIDER, {
    type: "circle",
    x: 93,
    y: 126,
    radius: 26,
  });
});

test("player module owns archer input and animation", async () => {
  const [mainSource, playerSource] = await Promise.all([
    readFile(new URL("../src/main.js", import.meta.url), "utf8"),
    readFile(new URL("../src/player.js", import.meta.url), "utf8"),
  ]);

  assert.match(playerSource, /createVirtualController/);
  assert.match(playerSource, /playSprite2DAnimation/);
  assert.match(playerSource, /window\.addEventListener\("keydown"/);
  assert.match(playerSource, /KeyC/);
  assert.match(playerSource, /KeyV/);
  assert.match(playerSource, /onShoot/);
  assert.match(playerSource, /Archer_Idle\.png/);
  assert.match(playerSource, /Archer_Run\.png/);
  assert.match(playerSource, /Archer_Shoot\.png/);
  assert.match(playerSource, /name === "idle" \? 5 : name === "run" \? 3 : 7/);
  assert.match(playerSource, /name !== "shoot"/);
  assert.match(playerSource, /createPlayerStateMachine/);
  assert.match(playerSource, /PlayerState\.SHOOTING/);
  assert.match(playerSource, /stateMachine\.releaseShot\(activeAnimation\.current\)/);
  assert.match(mainSource, /\.\.\.player\.layers/);
  assert.doesNotMatch(mainSource, /createVirtualController/);
  assert.doesNotMatch(mainSource, /playSprite2DAnimation\(animationManager, archer/);
});
