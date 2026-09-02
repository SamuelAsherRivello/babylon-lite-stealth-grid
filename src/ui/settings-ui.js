import {
  RUNTIME_AUDIO_SETTING_KEYS,
  RUNTIME_DEBUG_SETTING_KEYS,
  runtimeSettingsStore,
} from "../runtime-settings/runtime-settings-store.js";
import { applyFullscreenPreference } from "./fullscreen-settings.js";
import { GameWindow } from "./game-window.js";

const ASSET_BASE = import.meta.env?.BASE_URL ?? "/";

function createVolumeControl(documentRef, store, labelText, key) {
  const row = documentRef.createElement("label");
  row.className = "volume-control";
  const label = documentRef.createElement("span");
  label.className = "volume-label menu-label-text";
  label.textContent = labelText;
  const scale = documentRef.createElement("span");
  scale.className = "volume-scale";
  const minimum = documentRef.createElement("span");
  minimum.className = "menu-body-text";
  minimum.textContent = "0";
  const slider = documentRef.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.step = "1";
  slider.value = String(store.get(key));
  slider.setAttribute("aria-label", `${labelText} volume`);
  const maximum = documentRef.createElement("span");
  maximum.className = "menu-body-text";
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
  label.className = "menu-label-text";
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
  particleFxCheckbox.checked = store.get(RUNTIME_DEBUG_SETTING_KEYS.showParticleFxPreview);
  animatedTileCheckbox.checked = store.get(RUNTIME_DEBUG_SETTING_KEYS.showAnimatedTilePreview);
}

function createFullscreenControl(documentRef, applyFullscreen) {
  const row = documentRef.createElement("label");
  row.className = "fullscreen-control";
  const label = documentRef.createElement("span");
  label.className = "menu-label-text";
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
  modalHost = host,
  screenLayer = modalHost,
  pauseController,
  store = runtimeSettingsStore,
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
  let developerWindow = null;
  const close = () => activeWindow?.close();
  const open = () => {
    if (activeWindow) {
      close();
      return;
    }
    const content = documentRef.createElement("div");
    content.className = "settings-controls";
    const musicControl = createVolumeControl(
      documentRef, store, "Music", RUNTIME_AUDIO_SETTING_KEYS.music,
    );
    const sfxControl = createVolumeControl(
      documentRef, store, "SFX", RUNTIME_AUDIO_SETTING_KEYS.sfx,
    );
    const fullscreenControl = createFullscreenControl(documentRef, applyFullscreen);
    const musicSlider = musicControl.slider;
    const sfxSlider = sfxControl.slider;
    const developerButton = documentRef.createElement("button");
    developerButton.className = "developer-settings-button menu-button-text";
    developerButton.type = "button";
    developerButton.textContent = "Developer Settings";

    const developerContent = documentRef.createElement("div");
    developerContent.className = "settings-controls developer-settings-controls";
    const colliderControl = createDebugControl(documentRef, store, "Collider?", RUNTIME_DEBUG_SETTING_KEYS.showColliders);
    const cropMarksControl = createDebugControl(documentRef, store, "Crop Marks", RUNTIME_DEBUG_SETTING_KEYS.showCropMarks);
    const particleFxControl = createDebugControl(documentRef, store, "Particle FX (Preview)?", RUNTIME_DEBUG_SETTING_KEYS.showParticleFxPreview);
    const animatedTileControl = createDebugControl(documentRef, store, "Animated Tile (Preview)", RUNTIME_DEBUG_SETTING_KEYS.showAnimatedTilePreview);
    const resetButton = documentRef.createElement("button");
    resetButton.className = "settings-reset menu-button-text";
    resetButton.type = "button";
    resetButton.textContent = "Reset";
    developerContent.append(colliderControl.row, cropMarksControl.row, particleFxControl.row, animatedTileControl.row, resetButton);
    const colliderCheckbox = colliderControl.checkbox;
    const cropMarksCheckbox = cropMarksControl.checkbox;
    const particleFxCheckbox = particleFxControl.checkbox;
    const animatedTileCheckbox = animatedTileControl.checkbox;
    resetButton.addEventListener("click", () => {
      store.reset();
      musicSlider.value = String(store.get(RUNTIME_AUDIO_SETTING_KEYS.music));
      sfxSlider.value = String(store.get(RUNTIME_AUDIO_SETTING_KEYS.sfx));
      colliderCheckbox.checked = store.get(RUNTIME_DEBUG_SETTING_KEYS.showColliders);
      cropMarksCheckbox.checked = store.get(RUNTIME_DEBUG_SETTING_KEYS.showCropMarks);
      syncDebugPreviewControls(store, particleFxCheckbox, animatedTileCheckbox);
    });

    const openDeveloperSettings = () => {
      if (developerWindow) return;
      activeWindow?.setVisible(false);
      developerWindow = new GameWindow({
        host: modalHost,
        title: "Developer Settings",
        content: developerContent,
        documentRef,
        opener: developerButton,
        closeLabel: "Close developer settings",
        screenLayer,
        onClose: () => {
          developerWindow = null;
          activeWindow?.setVisible(true);
        },
      });
      developerWindow.backdrop.classList.add("developer-settings-backdrop");
      developerWindow.dimmer?.classList.add("developer-settings-dimmer");
    };
    developerButton.addEventListener("click", openDeveloperSettings);
    content.append(
      musicControl.row,
      sfxControl.row,
      fullscreenControl.row,
      developerButton,
    );
    pauseController.pause();
    gear.setAttribute("aria-label", "Close settings");
    activeWindow = new GameWindow({
      host: modalHost,
      title: "Settings Menu",
      content,
      documentRef,
      opener: gear,
      closeLabel: "Close settings",
      screenLayer,
      onClose: () => {
        developerWindow?.close();
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
    get developerWindow() { return developerWindow; },
  };
}
