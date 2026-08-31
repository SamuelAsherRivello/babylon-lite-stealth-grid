import {
  AUDIO_SETTING_KEYS,
  DEBUG_SETTING_KEYS,
  settingsStore,
} from "../settings/settings-store.js";
import { applyFullscreenPreference } from "./fullscreen-settings.js";
import { GameWindow } from "./game-window.js";

const ASSET_BASE = import.meta.env?.BASE_URL ?? "/";

function createVolumeControl(documentRef, store, labelText, key) {
  const row = documentRef.createElement("label");
  row.className = "volume-control";
  const label = documentRef.createElement("span");
  label.className = "volume-label";
  label.textContent = labelText;
  const scale = documentRef.createElement("span");
  scale.className = "volume-scale";
  const minimum = documentRef.createElement("span");
  minimum.textContent = "0";
  const slider = documentRef.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.step = "1";
  slider.value = String(store.get(key));
  slider.setAttribute("aria-label", `${labelText} volume`);
  const maximum = documentRef.createElement("span");
  maximum.textContent = "100";
  slider.addEventListener("input", () => store.set(key, Number(slider.value)));
  scale.append(minimum, slider, maximum);
  row.append(label, scale);
  return { row, slider };
}

export function createDebugControl(documentRef, store, labelText, key) {
  const row = documentRef.createElement("label");
  row.className = "collider-control";
  const label = documentRef.createElement("span");
  label.textContent = labelText;
  const checkbox = documentRef.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = store.get(key);
  checkbox.addEventListener("change", () => {
    store.set(key, checkbox.checked);
  });
  row.append(label, checkbox);
  return { row, checkbox };
}

export function syncDebugPreviewControls(
  store,
  particleFxCheckbox,
  animatedTileCheckbox,
) {
  particleFxCheckbox.checked = store.get(DEBUG_SETTING_KEYS.showParticleFxPreview);
  animatedTileCheckbox.checked = store.get(DEBUG_SETTING_KEYS.showAnimatedTilePreview);
}

function createFullscreenControl(documentRef, applyFullscreen) {
  const row = documentRef.createElement("label");
  row.className = "fullscreen-control";
  const label = documentRef.createElement("span");
  label.textContent = "FullScreen";
  const checkbox = documentRef.createElement("input");
  checkbox.type = "checkbox";
  const syncWithDocument = () => {
    checkbox.checked = Boolean(documentRef.fullscreenElement);
  };
  syncWithDocument();
  checkbox.addEventListener("change", async () => {
    await applyFullscreen(checkbox.checked, documentRef);
    syncWithDocument();
  });
  documentRef.addEventListener?.("fullscreenchange", syncWithDocument);
  row.append(label, checkbox);
  return {
    row,
    checkbox,
    dispose: () => documentRef.removeEventListener?.("fullscreenchange", syncWithDocument),
  };
}

export function createSettingsUi({
  host,
  pauseController,
  store = settingsStore,
  documentRef = globalThis.document,
  applyFullscreen = applyFullscreenPreference,
}) {
  const gear = documentRef.createElement("button");
  gear.className = "settings-gear";
  gear.type = "button";
  gear.setAttribute("aria-label", "Open settings");
  const icon = documentRef.createElement("img");
  icon.src = `${ASSET_BASE}ui/gear.svg`;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  gear.append(icon);
  host.append(gear);

  let activeWindow = null;
  const close = () => activeWindow?.close();
  const open = () => {
    if (activeWindow) {
      close();
      return;
    }
    const content = documentRef.createElement("div");
    content.className = "settings-controls";
    const musicControl = createVolumeControl(
      documentRef, store, "Music", AUDIO_SETTING_KEYS.music,
    );
    const sfxControl = createVolumeControl(
      documentRef, store, "SFX", AUDIO_SETTING_KEYS.sfx,
    );
    const developerTitle = documentRef.createElement("h2");
    developerTitle.className = "settings-section-title";
    developerTitle.textContent = "Developer";
    const colliderControl = createDebugControl(
      documentRef,
      store,
      "Collider?",
      DEBUG_SETTING_KEYS.showColliders,
    );
    const particleFxControl = createDebugControl(
      documentRef,
      store,
      "Particle FX (Preview)?",
      DEBUG_SETTING_KEYS.showParticleFxPreview,
    );
    const animatedTileControl = createDebugControl(
      documentRef,
      store,
      "Animated Tile (Preview)",
      DEBUG_SETTING_KEYS.showAnimatedTilePreview,
    );
    const fullscreenControl = createFullscreenControl(documentRef, applyFullscreen);
    const musicSlider = musicControl.slider;
    const sfxSlider = sfxControl.slider;
    const colliderCheckbox = colliderControl.checkbox;
    const particleFxCheckbox = particleFxControl.checkbox;
    const animatedTileCheckbox = animatedTileControl.checkbox;
    const resetButton = documentRef.createElement("button");
    resetButton.className = "settings-reset";
    resetButton.type = "button";
    resetButton.textContent = "Reset";
    resetButton.addEventListener("click", () => {
      store.reset();
      musicSlider.value = String(store.get(AUDIO_SETTING_KEYS.music));
      sfxSlider.value = String(store.get(AUDIO_SETTING_KEYS.sfx));
      colliderCheckbox.checked = store.get(DEBUG_SETTING_KEYS.showColliders);
      syncDebugPreviewControls(store, particleFxCheckbox, animatedTileCheckbox);
    });
    content.append(
      musicControl.row,
      sfxControl.row,
      developerTitle,
      colliderControl.row,
      particleFxControl.row,
      animatedTileControl.row,
      fullscreenControl.row,
      resetButton,
    );
    pauseController.pause();
    gear.setAttribute("aria-label", "Close settings");
    activeWindow = new GameWindow({
      host,
      title: "Settings Menu",
      content,
      documentRef,
      opener: gear,
      closeLabel: "Close settings",
      onClose: () => {
        fullscreenControl.dispose();
        activeWindow = null;
        gear.setAttribute("aria-label", "Open settings");
        pauseController.resume();
      },
    });
  };
  gear.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.key === " ") {
      event.preventDefault();
    }
  });
  gear.addEventListener("click", open);

  return {
    gear,
    open,
    close,
    get activeWindow() { return activeWindow; },
  };
}
