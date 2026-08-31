import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Coordinates UI lives in src/ui and contains separate pixel and grid output lines", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/ui/style.css", import.meta.url), "utf8");
  const source = await readFile(new URL("../src/ui/coordinates-ui.js", import.meta.url), "utf8");

  assert.match(html, /id="coordinates-ui" class="coordinates-ui"/);
  assert.match(html, /id="coordinates-ui-pixel"/);
  assert.match(html, /id="coordinates-ui-grid"/);
  assert.match(html, />C 3 · R 7<\/output>/);
  assert.match(css, /\.coordinates-ui\s*\{[^}]*right:\s*var\(--ui-safe-right\)/s);
  assert.match(css, /\.coordinates-ui\s*\{[^}]*top:\s*max\(18cqw, var\(--ui-safe-top\)\);[^}]*text-align:\s*center;/s);
  assert.match(source, /export function createCoordinatesUi/);
  assert.doesNotMatch(html, /id="coordinates"|class="coordinates"/);
  assert.doesNotMatch(css, /\.coordinates(?:\s|,|\{)/);
});

test("virtual controller contains matching Move, Jump (C), and Shoot (V) labels", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const jumpIndex = html.indexOf('id="jump-action"');
  const shootIndex = html.indexOf('id="shoot-action"');

  assert.match(html, /id="movement-joystick"/);
  assert.ok(jumpIndex >= 0);
  assert.ok(shootIndex > jumpIndex);
  assert.match(html, /<span class="control-label">Jump \(C\)<\/span>/);
  assert.match(html, /<span class="control-label">Shoot \(V\)<\/span>/);
  assert.match(html, /<div class="movement-control action-control-layout">/);
  assert.doesNotMatch(html, /class="controls"/);
});

test("archer uses the circular body collider", async () => {
  const player = await readFile(new URL("../src/player.js", import.meta.url), "utf8");

  assert.match(
    player,
    /PLAYER_COLLIDER = \{[\s\S]*type: "circle",[\s\S]*x: 93,[\s\S]*y: 126,[\s\S]*radius: 26,/,
  );
});
