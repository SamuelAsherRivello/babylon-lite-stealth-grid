import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("characters use a quarter-second scale and opacity spawn animation", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

  assert.match(source, /const SPAWN_ANIMATION_DURATION_SECONDS = 0\.25;/);
  assert.match(source, /spawnElapsedSeconds/);
  assert.match(source, /onSpawnProgress/);
  assert.match(source, /beginSpawn\(\)/);
  assert.match(source, /record\.combat\.beginSpawn\(\)/);
  assert.match(source, /let spawnElapsedSeconds = SPAWN_ANIMATION_DURATION_SECONDS;/);
  assert.match(source, /onSpawnProgress\(1\);/);
  assert.match(source, /sizePx: \[size \* Math\.max\(progress, 0\.001\),/);
  assert.match(source, /layer\.opacity = progress/);
  assert.match(source, /Math\.max\(progress, 0\.001\)/);
});

test("spawn animation begins even when actors attach before renderer creation", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  const attachActor = source.match(/function attachActor\(record\) \{[\s\S]*?\n  \}/)?.[0];

  assert.ok(attachActor);
  assert.match(attachActor, /if \(renderer\) \{[\s\S]*?\n    \}\n    \/\/ Initial actors/);
  assert.match(attachActor, /\n    record\.combat\.beginSpawn\(\);/);
  assert.ok(attachActor.indexOf("record.combat.beginSpawn();") > attachActor.indexOf("if (renderer)"));
});
