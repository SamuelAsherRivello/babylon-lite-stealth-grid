import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("portrait frame always fills the visible viewport height first", async () => {
  const styles = await readFile(new URL("../src/ui/style.css", import.meta.url), "utf8");
  const stage = styles.match(/\.stage\s*\{([^}]*)\}/s)?.[1] ?? "";
  const frame = styles.match(/\.game-frame\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(stage, /min-height:\s*100dvh;/);
  assert.match(stage, /grid-template-columns:\s*minmax\(0,\s*1fr\);/);
  assert.match(frame, /width:\s*56\.25dvh;/);
  assert.match(frame, /height:\s*100dvh;/);
  assert.doesNotMatch(frame, /width:\s*min\(/);
  assert.doesNotMatch(frame, /height:\s*min\(/);
  assert.match(frame, /aspect-ratio:\s*9\s*\/\s*16;/);
});

test("collider diagnostics stay above the game render canvas", async () => {
  const styles = await readFile(new URL("../src/ui/style.css", import.meta.url), "utf8");

  assert.match(styles, /#debugCanvas\s*\{[^}]*z-index:\s*2;/s);
});
