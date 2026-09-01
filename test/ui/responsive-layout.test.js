import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("portrait frame always fills the visible viewport height first", async () => {
  const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");
  const styles = await readFile(new URL("../../src/ui/style.css", import.meta.url), "utf8");
  const stage = styles.match(/\.stage\s*\{([^}]*)\}/s)?.[1] ?? "";
  const frame = styles.match(/\.game-frame\s*\{([^}]*)\}/s)?.[1] ?? "";
  const page = styles.match(/html,\s*body\s*\{([^}]*)\}/s)?.[1] ?? "";
  const uiLayer = styles.match(/\.ui-layer\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(page, /width:\s*100%;/);
  assert.match(page, /min-width:\s*0;/);
  assert.match(stage, /min-height:\s*100dvh;/);
  assert.match(stage, /min-width:\s*0;/);
  assert.match(stage, /grid-template-columns:\s*minmax\(0,\s*1fr\);/);
  assert.match(frame, /width:\s*56\.25dvh;/);
  assert.match(frame, /min-width:\s*0;/);
  assert.match(uiLayer, /min-width:\s*0;/);
  assert.match(styles, /#renderCanvas,\s*\n#debugCanvas\s*\{[^}]*min-width:\s*0;/s);
  assert.match(frame, /height:\s*100dvh;/);
  assert.doesNotMatch(frame, /width:\s*min\(/);
  assert.doesNotMatch(frame, /height:\s*min\(/);
  assert.match(frame, /aspect-ratio:\s*9\s*\/\s*16;/);
  assert.match(html, /content="width=device-width, initial-scale=1\.0, viewport-fit=cover"/);
});

test("world crop and viewport-safe UI use independent sibling layers", async () => {
  const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");
  const styles = await readFile(new URL("../../src/ui/style.css", import.meta.url), "utf8");
  const uiLayer = styles.match(/\.ui-layer\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(html, /<div class="game-frame">[\s\S]*?<\/div>\s*<div id="uiLayer" class="ui-layer">/);
  assert.match(uiLayer, /position:\s*fixed;/);
  assert.match(uiLayer, /container-type:\s*inline-size;/);
  assert.match(uiLayer, /pointer-events:\s*none;/);
  assert.match(styles, /--ui-safe-top:\s*calc\(env\(safe-area-inset-top, 0px\) \+ var\(--screen-margin\)\);/);
  assert.match(styles, /--ui-safe-right:\s*calc\(env\(safe-area-inset-right, 0px\) \+ var\(--screen-margin\)\);/);
  assert.match(styles, /--ui-safe-bottom:\s*calc\(env\(safe-area-inset-bottom, 0px\) \+ var\(--screen-margin\)\);/);
  assert.match(styles, /--ui-safe-left:\s*calc\(env\(safe-area-inset-left, 0px\) \+ var\(--screen-margin\)\);/);
  assert.match(styles, /\.ui-layer:not\(\.is-viewport-ready\)\s*\{[^}]*visibility:\s*hidden;/s);
  assert.match(styles, /\.ui-layer\.is-viewport-ready\s*\{[^}]*visibility:\s*visible;/s);
});

test("collider diagnostics stay above the game render canvas", async () => {
  const styles = await readFile(new URL("../../src/ui/style.css", import.meta.url), "utf8");

  assert.match(styles, /#debugCanvas\s*\{[^}]*z-index:\s*2;/s);
});
