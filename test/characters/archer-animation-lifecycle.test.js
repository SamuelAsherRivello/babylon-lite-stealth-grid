import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ROOT = new URL("../../", import.meta.url);

test("archer removes the previous animation before replaying another state", async () => {
  const source = await readFile(new URL("src/characters/enemies/archer/archer.js", ROOT), "utf8");

  assert.match(source, /removeSpriteAnimation\(manager, active\)/);
});
