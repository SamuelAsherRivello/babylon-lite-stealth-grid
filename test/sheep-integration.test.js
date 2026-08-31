import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("main configures the current sheep to fear only the player at three cells", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(source, /scareDistanceCells: 3/);
  assert.match(source, /frighteningTypes: \[CharacterType\.PLAYER\]/);
  assert.match(source, /minimumFleeDistanceCells: 1/);
  assert.match(source, /maximumFleeDistanceCells: 3/);
  assert.doesNotMatch(source, /CharacterType\.ENEMY/);
});

test("main supplies active player context to sheep only during active gameplay", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(source, /if \(activeDelta > 0\)[\s\S]*sheep\.update\(activeDelta, \[playerSnapshot\], dynamicColliders\)/);
  assert.match(source, /type: CharacterType\.PLAYER/);
  assert.match(source, /position: player\.getPosition\(\)/);
  assert.match(source, /cell: player\.getGridPosition\(TILE_SIZE\)/);
  assert.match(source, /for \(const layer of sheep\.layers\)[\s\S]*layer\.view\.zoom = viewportScale/);
});

test("main starts the player four cells from the sheep and draws yellow NPC diagnostics", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(source, /initialPosition: \{ x: SCREEN_WIDTH \/ 2 - TILE_SIZE, y: SCREEN_HEIGHT \/ 2 \}/);
  assert.match(source, /sheep\.getCollider\(\)/);
  assert.match(source, /"rgb\(255 220 64 \/ 24%\)"/);
  assert.match(source, /"#ffe066"/);
});
