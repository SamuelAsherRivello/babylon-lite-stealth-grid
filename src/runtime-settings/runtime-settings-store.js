export const RUNTIME_SETTINGS_STORAGE_KEY = "babylon-lite-stealth-grid.settings";
export const RUNTIME_SETTINGS_VERSION = 1;

export const RUNTIME_AUDIO_SETTING_KEYS = Object.freeze({
  music: "audio.musicVolume",
  sfx: "audio.sfxVolume",
});

export const RUNTIME_DEBUG_SETTING_KEYS = Object.freeze({
  showColliders: "debug.showColliders",
  showParticleFxPreview: "debug.showParticleFxPreview",
  showAnimatedTilePreview: "debug.showAnimatedTilePreview",
});

const DEBUG_BOOLEAN_KEYS = Object.freeze(Object.values(RUNTIME_DEBUG_SETTING_KEYS));

const KNOWN_KEYS = Object.freeze([
  RUNTIME_AUDIO_SETTING_KEYS.music,
  RUNTIME_AUDIO_SETTING_KEYS.sfx,
  ...DEBUG_BOOLEAN_KEYS,
]);

function defaultFor(key) {
  if (DEBUG_BOOLEAN_KEYS.includes(key)) {
    return false;
  }
  if (key === RUNTIME_AUDIO_SETTING_KEYS.music || key === RUNTIME_AUDIO_SETTING_KEYS.sfx) {
    return 100;
  }
  return undefined;
}

function isValid(key, value) {
  if (DEBUG_BOOLEAN_KEYS.includes(key)) {
    return typeof value === "boolean";
  }
  if (key === RUNTIME_AUDIO_SETTING_KEYS.music || key === RUNTIME_AUDIO_SETTING_KEYS.sfx) {
    return Number.isFinite(value) && value >= 0 && value <= 100;
  }
  return false;
}

function browserStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createRuntimeSettingsStore(storage = browserStorage()) {
  let values = {};
  const listeners = new Map();

  try {
    const parsed = JSON.parse(storage?.getItem?.(RUNTIME_SETTINGS_STORAGE_KEY) ?? "null");
    if (parsed?.version === RUNTIME_SETTINGS_VERSION
      && parsed.values
      && typeof parsed.values === "object") {
      values = Object.fromEntries(
        KNOWN_KEYS
          .filter((key) => Object.hasOwn(parsed.values, key))
          .map((key) => [key, parsed.values[key]]),
      );
    }
  } catch {
    values = {};
  }

  function get(key, fallback = defaultFor(key)) {
    return isValid(key, values[key]) ? values[key] : fallback;
  }

  return {
    get,
    set(key, value) {
      values[key] = isValid(key, value) ? value : defaultFor(key);
      try {
        storage?.setItem?.(RUNTIME_SETTINGS_STORAGE_KEY, JSON.stringify({
          version: RUNTIME_SETTINGS_VERSION,
          values,
        }));
      } catch {
        // The in-memory value remains authoritative for this session.
      }
      listeners.get(key)?.forEach((listener) => listener(get(key)));
      return get(key);
    },
    subscribe(key, listener) {
      if (!listeners.has(key)) {
        listeners.set(key, new Set());
      }
      listeners.get(key).add(listener);
      return () => listeners.get(key)?.delete(listener);
    },
    reset() {
      values = {};
      try {
        storage?.removeItem?.(RUNTIME_SETTINGS_STORAGE_KEY);
      } catch {
        // Defaults remain authoritative when persistence is unavailable.
      }
      for (const key of new Set([...KNOWN_KEYS, ...listeners.keys()])) {
        listeners.get(key)?.forEach((listener) => listener(get(key)));
      }
    },
  };
}

export const runtimeSettingsStore = createRuntimeSettingsStore();

// Transitional aliases keep external integrations source-compatible while the runtime-settings boundary settles.
export const SETTINGS_STORAGE_KEY = RUNTIME_SETTINGS_STORAGE_KEY;
export const SETTINGS_VERSION = RUNTIME_SETTINGS_VERSION;
export const AUDIO_SETTING_KEYS = RUNTIME_AUDIO_SETTING_KEYS;
export const DEBUG_SETTING_KEYS = RUNTIME_DEBUG_SETTING_KEYS;
export const createSettingsStore = createRuntimeSettingsStore;
