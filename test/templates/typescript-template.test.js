import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { TypeScriptTemplate } from "../../src/templates/typescript-template.js";

const TEMPLATE_URL = new URL("../../src/templates/typescript-template.js", import.meta.url);

test("TypeScript template demonstrates typed, documented module sections", async () => {
  const source = await readFile(TEMPLATE_URL, "utf8");

  assert.match(source, /@typedef \{object\} ExampleOptions/);
  assert.match(source, /\/\*\*[\s\S]*constructor\(options/);
  assert.match(source, /\/\*\*[\s\S]*execute\(\)/);
  assert.doesNotMatch(source, /TODO|This (class|function|method) (creates|returns)/i);
});

test("TypeScript template normalizes defaults and rejects empty names", () => {
  assert.equal(new TypeScriptTemplate().execute(), "example");
  assert.equal(new TypeScriptTemplate({ name: "  agent  " }).execute(), "agent");
  assert.throws(() => new TypeScriptTemplate({ name: " " }), /must not be empty/);
});
