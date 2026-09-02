import { runtimeSettingsStore, RUNTIME_AUDIO_SETTING_KEYS } from "../runtime-settings/runtime-settings-store.js";
import { normalizeVolume } from "../runtime-settings/runtime-audio-settings.js";

export const SFX_FILES = Object.freeze({
  click: "Click01.mp3", pickup: "Pickup01.mp3", win: "LevelWin.wav", lose: "LevelLose.wav",
  archer: "Arrow01.mp3", goblin: "Attack01.mp3", warrior: "Attack02.mp3",
  lancer: "Attack03.wav", monk: "Attack04.mp3",
  alert: "Alert01.mp3", bush: "Bush01.mp3",
});

export const PERCEPTION_PITCH = Object.freeze({ SUSPICIOUS: 0.65, INVESTIGATING: 0.82, ALERT: 1 });

export function playPerceptionSfx(state, play = playSfx) {
  if (Object.hasOwn(PERCEPTION_PITCH, state)) play("alert", { pitch: PERCEPTION_PITCH[state], volume: 0.2 });
}

export function createSfxPlayer({ context, baseUrl, fetchAudio = fetch, volume = () => 100 }) {
  const buffers = new Map();
  const gain = context.createGain();
  gain.connect(context.destination);
  const ready = Promise.all(Object.entries(SFX_FILES).map(async ([name, file]) => {
    try {
      const response = await fetchAudio(`${baseUrl}audio/sfx/${file}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      buffers.set(name, await context.decodeAudioData(await response.arrayBuffer()));
    } catch (error) {
      console.warn(`Unable to load sound ${file}`, error);
    }
  }));
  return {
    ready,
    unlock() { return context.resume().catch(() => {}); },
    setVolume(value) { gain.gain.value = normalizeVolume(value); },
    play(name, { pitch = 1, volume: soundVolume = 1 } = {}) {
      const buffer = buffers.get(name);
      if (!buffer || context.state !== "running" || normalizeVolume(volume()) === 0) return false;
      gain.gain.value = normalizeVolume(volume());
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = Number.isFinite(pitch) && pitch > 0 ? pitch : 1;
      const soundGain = context.createGain();
      soundGain.gain.value = normalizeVolume(soundVolume * 100);
      source.connect(soundGain);
      soundGain.connect(gain);
      source.onended = () => { source.disconnect(); soundGain.disconnect(); };
      source.start();
      return true;
    },
    dispose() { void context.close(); },
  };
}

export function isInteractiveButton(target) {
  const button = target?.closest?.('button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]');
  return Boolean(button && !button.matches(':disabled')
    && !button.closest('.virtual-controller, [inert], [hidden], [aria-disabled="true"]'));
}

let player;
export function playSfx(name, options) { return player?.play(name, options) ?? false; }

export function installSfx(documentRef = document) {
  if (player) return;
  const Context = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!Context) return;
  player = createSfxPlayer({ context: new Context(), baseUrl: import.meta.env.BASE_URL,
    volume: () => runtimeSettingsStore.get(RUNTIME_AUDIO_SETTING_KEYS.sfx) });
  const unlock = () => { void player.unlock(); };
  const click = (event) => {
    if (isInteractiveButton(event.target)) {
      void player.unlock().then(() => player.play("click"));
    }
  };
  documentRef.addEventListener("pointerdown", unlock, true);
  documentRef.addEventListener("keydown", unlock, true);
  documentRef.addEventListener("click", click, true);
  const unsubscribe = runtimeSettingsStore.subscribe(RUNTIME_AUDIO_SETTING_KEYS.sfx, (value) => player.setVolume(value));
  window.addEventListener("pagehide", () => {
    documentRef.removeEventListener("pointerdown", unlock, true);
    documentRef.removeEventListener("keydown", unlock, true);
    documentRef.removeEventListener("click", click, true);
    unsubscribe();
    player.dispose();
  }, { once: true });
}
