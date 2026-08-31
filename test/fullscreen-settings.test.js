import test from "node:test";
import assert from "node:assert/strict";

import { applyFullscreenPreference } from "../src/ui/fullscreen-settings.js";

test("fullscreen preference enters and exits fullscreen when supported", async () => {
  let requested = 0;
  let exited = 0;
  const root = { requestFullscreen: async () => { requested += 1; } };
  const documentRef = {
    documentElement: root,
    fullscreenElement: null,
    exitFullscreen: async () => { exited += 1; },
  };

  assert.equal(await applyFullscreenPreference(true, documentRef), true);
  assert.equal(requested, 1);

  documentRef.fullscreenElement = root;
  assert.equal(await applyFullscreenPreference(false, documentRef), true);
  assert.equal(exited, 1);
});

test("fullscreen preference fails safely when the browser blocks a request", async () => {
  const documentRef = {
    documentElement: { requestFullscreen: async () => { throw new Error("gesture required"); } },
    fullscreenElement: null,
  };

  assert.equal(await applyFullscreenPreference(true, documentRef), false);
  assert.equal(await applyFullscreenPreference(false, {}), true);
});
