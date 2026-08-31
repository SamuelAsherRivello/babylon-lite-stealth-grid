import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  applyAnimatedTilePreviewSetting,
  applyParticleFxPreviewSetting,
} from "../src/preview-settings.js";

test("particle preview visibility and playback are toggled together", () => {
  const calls = [];
  const effects = Array.from({ length: 8 }, (_, index) => ({
    layer: { visible: true },
    play() { calls.push(["play", index]); },
    stop() { calls.push(["stop", index]); },
  }));

  applyParticleFxPreviewSetting(effects, false);
  assert.ok(effects.every((effect) => effect.layer.visible === false));
  assert.deepEqual(calls, Array.from({ length: 8 }, (_, index) => ["stop", index]));

  calls.length = 0;
  applyParticleFxPreviewSetting(effects, true);
  assert.ok(effects.every((effect) => effect.layer.visible === true));
  assert.deepEqual(calls, Array.from({ length: 8 }, (_, index) => ["play", index]));
});

test("animated tile preview controls its layer and animation independently", () => {
  const layer = { visible: true };
  const animation = { current: 5 };
  const calls = [];
  const api = {
    playSpriteFrameAnimation(...args) { calls.push(["play", ...args]); },
    stopSpriteAnimation(...args) { calls.push(["stop", ...args]); },
  };

  applyAnimatedTilePreviewSetting(layer, animation, false, api, {
    from: 0, to: 15, loop: true, frameDurationMs: 100,
  });
  assert.equal(layer.visible, false);
  assert.deepEqual(calls, [["stop", animation]]);

  calls.length = 0;
  applyAnimatedTilePreviewSetting(layer, animation, true, api, {
    from: 0, to: 15, loop: true, frameDurationMs: 100,
  });
  assert.equal(layer.visible, true);
  assert.deepEqual(calls, [["play", animation, 0, 15, true, 100]]);
});

test("main initializes and subscribes both previews independently", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

  assert.match(source, /visible:\s*false/);
  assert.match(source, /DEBUG_SETTING_KEYS\.showParticleFxPreview/);
  assert.match(source, /DEBUG_SETTING_KEYS\.showAnimatedTilePreview/);
  assert.match(source, /applyParticleFxPreviewSetting/);
  assert.match(source, /applyAnimatedTilePreviewSetting/);
  assert.match(source, /unsubscribeParticleFxPreview/);
  assert.match(source, /unsubscribeAnimatedTilePreview/);
});
