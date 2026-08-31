export const SETTINGS_STORAGE_KEY = "babylon-lite-stealth-grid.settings";
export const SETTINGS_VERSION = 1;

export const AUDIO_SETTING_KEYS = Object.freeze({
  music: "audio.musicVolume",
  sfx: "audio.sfxVolume",
});

export const DEBUG_SETTING_KEYS = Object.freeze({
  showColliders: "debug.showColliders",
});

const KNOWN_KEYS = Object.freeze([
  AUDIO_SETTING_KEYS.music,
  AUDIO_SETTING_KEYS.sfx,
  DEBUG_SETTING_KEYS.showColliders,
]);

function defaultFor(key) {
  if (key === DEBUG_SETTING_KEYS.showColliders) {
    return false;
  }
  if (key === AUDIO_SETTING_KEYS.music || key === AUDIO_SETTING_KEYS.sfx) {
    return 100;
  }
  return undefined;
}

function isValid(key, value) {
  if (key === DEBUG_SETTING_KEYS.showColliders) {
    return typeof value === "boolean";
  }
  if (key === AUDIO_SETTING_KEYS.music || key === AUDIO_SETTING_KEYS.sfx) {
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

export function createSettingsStore(storage = browserStorage()) {
  let values = {};
  const listeners = new Map();

  try {
    const parsed = JSON.parse(storage?.getItem?.(SETTINGS_STORAGE_KEY) ?? "null");
    if (parsed?.version === SETTINGS_VERSION
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
        storage?.setItem?.(SETTINGS_STORAGE_KEY, JSON.stringify({
          version: SETTINGS_VERSION,
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
        storage?.removeItem?.(SETTINGS_STORAGE_KEY);
      } catch {
        // Defaults remain authoritative when persistence is unavailable.
      }
      for (const key of new Set([...KNOWN_KEYS, ...listeners.keys()])) {
        listeners.get(key)?.forEach((listener) => listener(get(key)));
      }
    },
  };
}

export const settingsStore = createSettingsStore();
