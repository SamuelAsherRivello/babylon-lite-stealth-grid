import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mainSource = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

test("damage feedback uses the more obvious flash and knockback tuning", () => {
  assert.match(mainSource, /DAMAGE_FLASH_DURATION_SECONDS = 0\.6;/);
  assert.match(mainSource, /KNOCKBACK_SPEED_PIXELS_PER_SECOND = 17\.28;/);
});
