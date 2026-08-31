import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("main configures the current sheep to fear only the player at three cells", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(source, /scareDistanceCells: 3/);
  assert.match(source, /frighteningTypes: \[CharacterType\.PLAYER\]/);
  assert.match(source, /minimumFleeDistanceCells: 1/);
  assert.match(source, /maximumFleeDistanceCells: 3/);
  assert.doesNotMatch(
    source,
    /frighteningTypes: \[CharacterType\.ENEMY\]/,
  );
});

test("main supplies active player context to sheep only during active gameplay", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(source, /if \(activeDelta > 0\)[\s\S]*for \(const record of sheepRecords\)[\s\S]*record\.actor\.update\(/);
  assert.match(source, /type: CharacterType\.PLAYER/);
  assert.match(source, /position: playerRecord\.actor\.getPosition\(\)/);
  assert.match(source, /cell: playerRecord\.actor\.getGridPosition\(TILE_SIZE\)/);
  assert.match(source, /for \(const spawner of spawners\)[\s\S]*for \(const layer of record\.actor\.layers\)[\s\S]*layer\.view\.zoom = viewportScale/);
});

test("main starts the player four cells from the sheep and uses shared collider-role diagnostics", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(source, /createInitialSpawnerConfigs/);
  assert.match(source, /SpawnerType\.SHEEP/);
  assert.match(source, /createCharacterColliderDrawCommands/);
  assert.match(source, /combatCollider: combat\.getCombatCollider\(\)/);
  assert.match(source, /movementCollider: actor\.getMovementCollider\(\)/);
});
