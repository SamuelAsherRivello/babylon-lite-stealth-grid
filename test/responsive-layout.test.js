import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("portrait frame scales against the visible embed viewport", async () => {
  const styles = await readFile(new URL("../src/ui/style.css", import.meta.url), "utf8");
  const stage = styles.match(/\.stage\s*\{([^}]*)\}/s)?.[1] ?? "";
  const frame = styles.match(/\.game-frame\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(stage, /min-height:\s*100dvh;/);
  assert.match(frame, /width:\s*min\(100(?:d)?vw,\s*56\.25dvh\);/);
  assert.match(frame, /height:\s*min\(177\.777(?:8)?dvw,\s*100dvh\);/);
  assert.match(frame, /aspect-ratio:\s*9\s*\/\s*16;/);
});
