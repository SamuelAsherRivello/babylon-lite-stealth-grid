import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("monk diagnostics do not draw a white artwork bounding box", () => {
  const source = fs.readFileSync(new URL("../../src/main.js", import.meta.url), "utf8");

  assert.doesNotMatch(source, /character\.character === SpawnerCharacter\.MONK[\s\S]*?strokeRect\(/);
});
