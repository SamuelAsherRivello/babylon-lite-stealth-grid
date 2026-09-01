import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Lancer uses the 320 by 320 frame geometry from the supplied Aseprite", async () => {
  const source = await readFile(new URL("../src/characters/enemies/lancer/lancer-animation-catalog.js", import.meta.url), "utf8");
  assert.match(source, /const FRAME_SIZE = 320/);
  assert.match(source, /gridSize: Object\.freeze\(\[FRAME_SIZE, FRAME_HEIGHT\]\)/);
});

test("Tiled runtime accepts the authored Lancer enemy type", async () => {
  const source = await readFile(new URL("../plugins/tiled-babylon-lite/index.js", import.meta.url), "utf8");
  assert.match(source, /supportedTypes = new Set\(\[[^\]]*"LANCER"/s);
});

test("Lancer keeps the lowercase code-facing character identity", async () => {
  const source = await readFile(new URL("../src/systems/spawners/spawner-catalog.js", import.meta.url), "utf8");
  assert.match(source, /LANCER:\s*"lancer"/);
});

test("Lancer remains on its looping idle animation for now", async () => {
  const [catalog, main] = await Promise.all([
    readFile(new URL("../src/characters/enemies/lancer/lancer-animation-catalog.js", import.meta.url), "utf8"),
    readFile(new URL("../src/main.js", import.meta.url), "utf8"),
  ]);
  assert.match(catalog, /idle: createDescriptor\("Lancer Idle", "Lancer_Idle\.png", 12, true\)/);
  assert.match(main, /character: SpawnerCharacter\.LANCER, actor, combat, controller: \{ update\(\) \{\} \}/);
});
