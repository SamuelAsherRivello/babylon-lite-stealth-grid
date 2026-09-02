import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createCoordinatesUi } from "../../src/ui/coordinates-ui.js";

test("Coordinates UI lives in src/ui and contains separate pixel and grid output lines", async () => {
  const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");
  const css = await readFile(new URL("../../src/ui/style.css", import.meta.url), "utf8");
  const source = await readFile(new URL("../../src/ui/coordinates-ui.js", import.meta.url), "utf8");

  assert.match(html, /id="coordinates-ui" class="coordinates-ui"/);
  assert.match(html, /id="coordinates-ui-pixel"/);
  assert.match(html, /id="coordinates-ui-grid"/);
  assert.match(html, />Pos:  \(288,512\)<\/output>/);
  assert.match(html, />Grid: \(7,3\)<\/output>/);
  assert.match(css, /\.gold-counter,\s*\.coordinates-ui\s*\{/);
  assert.match(css, /\.coordinates-ui\s*\{[^}]*top:\s*calc\(var\(--ui-safe-top\) \+ 3em\);/s);
  assert.doesNotMatch(css, /\.coordinates-ui\s*\{[^}]*white-space:\s*pre;/s);
  assert.match(css, /\.coordinates-ui output\s*\{[^}]*white-space:\s*pre;/s);
  assert.match(source, /export function createCoordinatesUi/);
  assert.doesNotMatch(html, /id="coordinates"|class="coordinates"/);
  assert.doesNotMatch(css, /\.coordinates(?:\s|,|\{)/);
});

test("Coordinates UI visibility follows the collider diagnostic setting", () => {
  const container = { hidden: false };
  const pixelOutput = { value: "" };
  const gridOutput = { value: "" };
  const elements = new Map([
    ["#coordinates-ui", container],
    ["#coordinates-ui-pixel", pixelOutput],
    ["#coordinates-ui-grid", gridOutput],
  ]);
  const ui = createCoordinatesUi({
    querySelector: (selector) => elements.get(selector),
  });

  ui.setVisible(false);
  assert.equal(container.hidden, true);

  ui.setVisible(true);
  assert.equal(container.hidden, false);
  ui.update({ x: 317.2, y: 641.8 }, { x: 4, y: 10 });
  assert.equal(pixelOutput.value, "Pos:  (317,642)");
  assert.equal(gridOutput.value, "Grid: (10,4)");
});

test("virtual controller contains matching Move, Item (C), and Attack (V) labels", async () => {
  const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");
  const itemIndex = html.indexOf('id="item-action"');
  const attackIndex = html.indexOf('id="attack-action"');

  assert.match(html, /id="movement-joystick"/);
  assert.ok(itemIndex >= 0);
  assert.ok(attackIndex > itemIndex);
  assert.match(html, /<span class="control-label">Item \(C\)<\/span>/);
  assert.match(html, /<span class="control-label">Attack \(V\)<\/span>/);
  assert.doesNotMatch(html, /Jump|jump-action/);
  assert.match(html, /<div class="movement-control action-control-layout">/);
  assert.doesNotMatch(html, /class="controls"/);
});

test("archer uses the circular body collider", async () => {
  const player = await readFile(new URL("../../src/characters/player/player.js", import.meta.url), "utf8");

  assert.match(
    player,
    /PLAYER_MOVEMENT_COLLIDER = \{[\s\S]*type: "circle",[\s\S]*x: PLAYER_FRAME\.width \* PLAYER_PIVOT\.x,[\s\S]*y: PLAYER_FRAME\.height \* PLAYER_PIVOT\.y,[\s\S]*radius: 18\.2,/,
  );
});
