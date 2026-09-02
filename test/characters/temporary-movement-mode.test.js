import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ROOT = new URL("../../src/", import.meta.url);

test("enemy movement is not disabled by a temporary QA flag", async () => {
  const sources = await Promise.all([
    readFile(new URL("characters/enemies/goblin/goblin.js", ROOT), "utf8"),
    readFile(new URL("characters/enemies/warrior/warrior.js", ROOT), "utf8"),
    readFile(new URL("characters/enemies/archer/archer.js", ROOT), "utf8"),
  ]);
  for (const source of sources) {
    assert.doesNotMatch(source, /IS_MOVEMENT_ENABLED|movementEnabled/);
  }
});

test("temporary bush-burning QA mode is removed", async () => {
  const source = await readFile(new URL("main.js", ROOT), "utf8");
  assert.doesNotMatch(source, /temporaryBushQaMode|verifyBushBurning/);
});

test("bush sensor is not presented as a green walkability collider", async () => {
  const source = await readFile(new URL("main.js", ROOT), "utf8");
  const decorations = source.slice(source.indexOf("diagnosticCharacters.push(...reactiveDecorations"), source.indexOf("diagnosticCharacters.push(...goldStoneObjects"));
  assert.match(decorations, /width: TILE_SIZE/);
  assert.match(decorations, /movementCollider: null/);
});
