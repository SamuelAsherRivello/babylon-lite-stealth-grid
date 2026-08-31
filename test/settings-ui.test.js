import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { DEBUG_SETTING_KEYS } from "../src/settings-store.js";
import { GameWindow } from "../src/ui/game-window.js";
import {
  createDebugControl,
  createSettingsUi,
  syncDebugPreviewControls,
} from "../src/ui/settings-ui.js";

class FakeClassList {
  values = new Set();
  add(value) { this.values.add(value); }
}

class FakeElement extends EventTarget {
  children = [];
  attributes = new Map();
  classList = new FakeClassList();
  parentNode = null;
  isConnected = false;
  focused = false;
  append(...children) {
    for (const child of children) {
      child.parentNode = this;
      child.isConnected = this.isConnected;
      this.children.push(child);
    }
  }
  remove() {
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    }
    this.parentNode = null;
    this.isConnected = false;
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  focus() { this.focused = true; }
}

function createDocument() {
  return { createElement: () => new FakeElement() };
}

function click(target, eventTarget = target) {
  const event = new Event("click");
  Object.defineProperty(event, "target", { value: eventTarget });
  target.dispatchEvent(event);
}

test("Space does not activate the settings gear", () => {
  const documentRef = createDocument();
  const host = new FakeElement();
  host.isConnected = true;
  const store = { get: () => 100 };
  const pauseController = { pause() {}, resume() {} };
  const settingsUi = createSettingsUi({
    host,
    pauseController,
    store,
    documentRef,
  });
  const event = new Event("keydown", { cancelable: true });
  Object.defineProperty(event, "code", { value: "Space" });

  settingsUi.gear.dispatchEvent(event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(settingsUi.activeWindow, null);
});

test("preview debug controls use exact labels and write independent keys", () => {
  const documentRef = createDocument();
  const values = new Map([
    [DEBUG_SETTING_KEYS.showParticleFxPreview, true],
    [DEBUG_SETTING_KEYS.showAnimatedTilePreview, false],
  ]);
  const writes = [];
  const store = {
    get: (key) => values.get(key),
    set(key, value) {
      writes.push([key, value]);
      values.set(key, value);
    },
  };
  const particles = createDebugControl(
    documentRef,
    store,
    "Particle FX Preview?",
    DEBUG_SETTING_KEYS.showParticleFxPreview,
  );
  const animatedTile = createDebugControl(
    documentRef,
    store,
    "Animated Tile (Preview)",
    DEBUG_SETTING_KEYS.showAnimatedTilePreview,
  );

  assert.equal(particles.row.children[0].textContent, "Particle FX Preview?");
  assert.equal(animatedTile.row.children[0].textContent, "Animated Tile (Preview)");
  assert.equal(particles.checkbox.checked, true);
  assert.equal(animatedTile.checkbox.checked, false);
  particles.checkbox.checked = false;
  particles.checkbox.dispatchEvent(new Event("change"));
  animatedTile.checkbox.checked = true;
  animatedTile.checkbox.dispatchEvent(new Event("change"));
  assert.deepEqual(writes, [
    [DEBUG_SETTING_KEYS.showParticleFxPreview, false],
    [DEBUG_SETTING_KEYS.showAnimatedTilePreview, true],
  ]);

  values.set(DEBUG_SETTING_KEYS.showParticleFxPreview, false);
  values.set(DEBUG_SETTING_KEYS.showAnimatedTilePreview, false);
  syncDebugPreviewControls(store, particles.checkbox, animatedTile.checkbox);
  assert.equal(particles.checkbox.checked, false);
  assert.equal(animatedTile.checkbox.checked, false);
});

test("game window provides dialog labelling, focus, and exact dismissal paths", () => {
  const documentRef = createDocument();
  const host = new FakeElement();
  host.isConnected = true;
  const opener = new FakeElement();
  const content = new FakeElement();
  let closed = 0;
  const gameWindow = new GameWindow({
    host, title: "Settings Menu", content, documentRef, opener,
    onClose: () => { closed += 1; },
  });

  assert.equal(gameWindow.panel.attributes.get("role"), "dialog");
  assert.equal(gameWindow.panel.attributes.get("aria-modal"), "true");
  assert.match(gameWindow.panel.attributes.get("aria-labelledby"), /^game-window-title-/);
  assert.equal(gameWindow.closeButton.focused, true);

  click(gameWindow.backdrop, gameWindow.panel);
  assert.equal(closed, 0);
  click(gameWindow.backdrop);
  assert.equal(closed, 1);
  assert.equal(opener.focused, true);
  gameWindow.close();
  assert.equal(closed, 1);
});

test("X closes the window once and returns focus", () => {
  const documentRef = createDocument();
  const host = new FakeElement();
  host.isConnected = true;
  const opener = new FakeElement();
  const gameWindow = new GameWindow({
    host, title: "Settings Menu", content: new FakeElement(), documentRef, opener,
  });
  click(gameWindow.closeButton);
  assert.equal(gameWindow.backdrop.isConnected, false);
  assert.equal(opener.focused, true);
});

test("settings source composes required controls, persistence, and pause lifecycle", async () => {
  const [source, main] = await Promise.all([
    readFile(new URL("../src/ui/settings-ui.js", import.meta.url), "utf8"),
    readFile(new URL("../src/main.js", import.meta.url), "utf8"),
  ]);
  assert.match(source, /gear\.setAttribute\("aria-label", "Open settings"\)/);
  assert.match(source, /icon\.src = `\$\{ASSET_BASE\}ui\/gear\.svg`/);
  assert.match(source, /title:\s*"Settings Menu"/);
  assert.match(source, /"Music", AUDIO_SETTING_KEYS\.music/);
  assert.match(source, /"SFX", AUDIO_SETTING_KEYS\.sfx/);
  assert.match(source, /"Collider\?"/);
  assert.match(source, /"Particle FX Preview\?"/);
  assert.match(source, /"Animated Tile \(Preview\)"/);
  assert.match(source, /label\.textContent = "FullScreen"/);
  assert.match(source, /checkbox\.checked = Boolean\(documentRef\.fullscreenElement\)/);
  assert.match(source, /applyFullscreen\(checkbox\.checked, documentRef\)/);
  assert.doesNotMatch(source, /DISPLAY_SETTING_KEYS/);
  assert.match(source, /slider\.min = "0"/);
  assert.match(source, /slider\.max = "100"/);
  assert.match(source, /addEventListener\("input"/);
  assert.match(source, /resetButton\.textContent = "Reset"/);
  assert.match(source, /store\.reset\(\)/);
  assert.match(source, /pauseController\.pause\(\)/);
  assert.match(source, /pauseController\.resume\(\)/);
  assert.doesNotMatch(source, /Skip Start Menu/);
  assert.match(main, /createSettingsUi\(\{ host: gameUi, pauseController \}\)/);
  assert.match(main, /updateSpriteAnimationManager\(animationManager, activeDelta \* 1000\)/);
  assert.match(main, /player\.update\(activeDelta\)/);
  assert.match(main, /showColliders = settingsStore\.get\(DEBUG_SETTING_KEYS\.showColliders\)/);
  assert.match(main, /drawDiagnostics\(terrainTiles, player\.getCollider\(\), (?:projectiles\.getColliders\(\), )?showColliders\)/);
  assert.doesNotMatch(main, /DISPLAY_SETTING_KEYS|applyFullscreenPreference/);
});

test("settings chrome follows inspiration frame-relative measurements", async () => {
  const styles = await readFile(new URL("../src/ui/style.css", import.meta.url), "utf8");
  for (const selector of [
    ".settings-gear", ".game-window-backdrop", ".game-window",
    ".game-window-title", ".game-window-close", ".settings-controls",
    ".volume-control", ".volume-scale", ".settings-reset", ".collider-control",
  ]) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const declarations = styles.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "s"))?.[1] ?? "";
    assert.ok(declarations, `missing ${selector}`);
    assert.doesNotMatch(declarations, /(?:\d|\.)(?:px|vw|vh)\b/);
  }
  assert.match(styles, /\.settings-gear\s*\{[^}]*top:\s*8\.75cqw;[^}]*right:\s*8\.75cqw;[^}]*width:\s*8cqw;[^}]*height:\s*8cqw;/s);
  assert.match(styles, /\.game-window-backdrop\s*\{[^}]*inset:\s*0;[^}]*place-items:\s*center;[^}]*rgb\(0 0 0 \/ 50%\)/s);
});

test("gear icon is transparent vector artwork", async () => {
  const icon = await readFile(new URL("../public/ui/gear.svg", import.meta.url), "utf8");
  assert.match(icon, /viewBox="0 0 64 64"/);
  assert.doesNotMatch(icon, /<rect[^>]+(?:fill|style)=/);
});
