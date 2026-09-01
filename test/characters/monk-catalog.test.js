import test from "node:test";
import assert from "node:assert/strict";
import { MONK_ANIMATION_CATALOG, validateMonkAnimationCatalog } from "../../src/characters/enemies/monk/monk-animation-catalog.js";

test("Monk catalog includes every supplied animation", () => {
  assert.deepEqual(Object.keys(MONK_ANIMATION_CATALOG), ["idle", "walking", "heal", "heal-effect"]);
  assert.deepEqual(Object.values(MONK_ANIMATION_CATALOG).map(({ frameCount, loop }) => ({ frameCount, loop })), [
    { frameCount: 6, loop: true }, { frameCount: 4, loop: true },
    { frameCount: 11, loop: false }, { frameCount: 11, loop: false },
  ]);
  assert.equal(validateMonkAnimationCatalog(), MONK_ANIMATION_CATALOG);
});
