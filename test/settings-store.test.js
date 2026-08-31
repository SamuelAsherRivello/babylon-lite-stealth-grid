import test from "node:test";
import assert from "node:assert/strict";

import {
  AUDIO_SETTING_KEYS,
  DEBUG_SETTING_KEYS,
  SETTINGS_STORAGE_KEY,
  SETTINGS_VERSION,
  createSettingsStore,
} from "../src/settings/settings-store.js";
import { applyCategoryVolume, normalizeVolume } from "../src/settings/audio-settings.js";

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    has(key) { return values.has(key); },
    read(key) { return values.get(key); },
  };
}

test("settings default to music 100, SFX 100, and debug previews off", () => {
  const store = createSettingsStore(createStorage());
  assert.equal(store.get(AUDIO_SETTING_KEYS.music), 100);
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 100);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showColliders), false);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showParticleFxPreview), false);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showAnimatedTilePreview), false);
});

test("preview debug settings persist independently and notify subscribers", () => {
  const storage = createStorage();
  const store = createSettingsStore(storage);
  const observed = [];
  store.subscribe(
    DEBUG_SETTING_KEYS.showParticleFxPreview,
    (value) => observed.push(["particles", value]),
  );
  store.subscribe(
    DEBUG_SETTING_KEYS.showAnimatedTilePreview,
    (value) => observed.push(["animated-tile", value]),
  );

  assert.equal(store.set(DEBUG_SETTING_KEYS.showParticleFxPreview, true), true);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showAnimatedTilePreview), false);
  assert.equal(store.set(DEBUG_SETTING_KEYS.showAnimatedTilePreview, true), true);
  assert.deepEqual(observed, [
    ["particles", true],
    ["animated-tile", true],
  ]);
  assert.deepEqual(JSON.parse(storage.read(SETTINGS_STORAGE_KEY)), {
    version: SETTINGS_VERSION,
    values: {
      [DEBUG_SETTING_KEYS.showParticleFxPreview]: true,
      [DEBUG_SETTING_KEYS.showAnimatedTilePreview]: true,
    },
  });
});

test("valid settings persist in one versioned document and notify subscribers", () => {
  const storage = createStorage({
    unrelated: "keep",
    [SETTINGS_STORAGE_KEY]: JSON.stringify({
      version: SETTINGS_VERSION,
      values: { "display.fullScreen": true },
    }),
  });
  const store = createSettingsStore(storage);
  const observed = [];
  store.subscribe(AUDIO_SETTING_KEYS.music, (value) => observed.push(value));

  assert.equal(store.set(AUDIO_SETTING_KEYS.music, 42), 42);
  assert.deepEqual(observed, [42]);
  assert.equal(storage.read("unrelated"), "keep");
  assert.deepEqual(JSON.parse(storage.read(SETTINGS_STORAGE_KEY)), {
    version: SETTINGS_VERSION,
    values: { [AUDIO_SETTING_KEYS.music]: 42 },
  });
});

test("invalid, malformed, and wrong-version settings recover per key", () => {
  const malformed = createSettingsStore(createStorage({
    [SETTINGS_STORAGE_KEY]: "not json",
  }));
  assert.equal(malformed.get(AUDIO_SETTING_KEYS.music), 100);

  const wrongVersion = createSettingsStore(createStorage({
    [SETTINGS_STORAGE_KEY]: JSON.stringify({ version: 99, values: {
      [AUDIO_SETTING_KEYS.music]: 10,
    } }),
  }));
  assert.equal(wrongVersion.get(AUDIO_SETTING_KEYS.music), 100);

  const invalidValues = createSettingsStore(createStorage({
    [SETTINGS_STORAGE_KEY]: JSON.stringify({ version: SETTINGS_VERSION, values: {
      [AUDIO_SETTING_KEYS.music]: -1,
      [AUDIO_SETTING_KEYS.sfx]: 75,
      [DEBUG_SETTING_KEYS.showColliders]: "yes",
      [DEBUG_SETTING_KEYS.showParticleFxPreview]: "yes",
      [DEBUG_SETTING_KEYS.showAnimatedTilePreview]: 1,
    } }),
  }));
  assert.equal(invalidValues.get(AUDIO_SETTING_KEYS.music), 100);
  assert.equal(invalidValues.get(AUDIO_SETTING_KEYS.sfx), 75);
  assert.equal(invalidValues.get(DEBUG_SETTING_KEYS.showColliders), false);
  assert.equal(invalidValues.get(DEBUG_SETTING_KEYS.showParticleFxPreview), false);
  assert.equal(invalidValues.get(DEBUG_SETTING_KEYS.showAnimatedTilePreview), false);
});

test("unavailable storage falls back to an authoritative in-memory session", () => {
  const storage = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("full"); },
    removeItem() { throw new Error("blocked"); },
  };
  const store = createSettingsStore(storage);
  assert.doesNotThrow(() => store.set(AUDIO_SETTING_KEYS.sfx, 35));
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 35);
  assert.doesNotThrow(() => store.reset());
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 100);
});

test("reset removes only game settings, restores defaults, and notifies", () => {
  const storage = createStorage({ unrelated: "keep" });
  const store = createSettingsStore(storage);
  store.set(AUDIO_SETTING_KEYS.music, 10);
  store.set(AUDIO_SETTING_KEYS.sfx, 20);
  store.set(DEBUG_SETTING_KEYS.showColliders, true);
  store.set(DEBUG_SETTING_KEYS.showParticleFxPreview, true);
  store.set(DEBUG_SETTING_KEYS.showAnimatedTilePreview, true);
  const observed = [];
  store.subscribe(AUDIO_SETTING_KEYS.music, (value) => observed.push(["music", value]));
  store.subscribe(AUDIO_SETTING_KEYS.sfx, (value) => observed.push(["sfx", value]));
  store.subscribe(DEBUG_SETTING_KEYS.showColliders, (value) => observed.push(["debug", value]));
  store.subscribe(DEBUG_SETTING_KEYS.showParticleFxPreview, (value) => observed.push(["particles", value]));
  store.subscribe(DEBUG_SETTING_KEYS.showAnimatedTilePreview, (value) => observed.push(["animated-tile", value]));

  store.reset();

  assert.equal(storage.has(SETTINGS_STORAGE_KEY), false);
  assert.equal(storage.read("unrelated"), "keep");
  assert.equal(store.get(AUDIO_SETTING_KEYS.music), 100);
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 100);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showColliders), false);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showParticleFxPreview), false);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showAnimatedTilePreview), false);
  assert.deepEqual(observed, [
    ["music", 100],
    ["sfx", 100],
    ["debug", false],
    ["particles", false],
    ["animated-tile", false],
  ]);
});

test("category volume normalizes, clamps, mutes, and tolerates no playback", () => {
  assert.equal(normalizeVolume(40), 0.4);
  assert.equal(normalizeVolume(-2), 0);
  assert.equal(normalizeVolume(120), 1);
  assert.equal(normalizeVolume("invalid"), 0);
  assert.equal(applyCategoryVolume(0.5, 40), 0.2);
  assert.equal(applyCategoryVolume(2, 100), 1);
  assert.equal(applyCategoryVolume(0.7, 0), 0);
  assert.doesNotThrow(() => applyCategoryVolume(undefined, undefined));
});
