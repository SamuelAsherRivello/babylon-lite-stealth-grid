import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("main configures the current sheep to fear only the player at three cells", async () => {
  const source = await readFile(new URL("../../src/main.js", import.meta.url), "utf8");
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
  const source = await readFile(new URL("../../src/main.js", import.meta.url), "utf8");
  assert.match(source, /if \(activeDelta > 0\)[\s\S]*for \(const currentRecord of sheepRecords\)[\s\S]*currentRecord\.actor\.update\(/);
  assert.match(source, /type: CharacterType\.PLAYER/);
  assert.match(source, /position: playerRecord\.actor\.getPosition\(\)/);
  assert.match(source, /cell: playerRecord\.actor\.getGridPosition\(TILE_SIZE\)/);
  assert.match(source, /spawner\.actors\.flatMap\(\(record\) => record\.actor\.layers\)/);
});

test("main loads authored spawner positions and uses shared collider-role diagnostics", async () => {
  const source = await readFile(new URL("../../src/main.js", import.meta.url), "utf8");
  assert.match(source, /createInitialSpawnerConfigs/);
  assert.match(source, /SpawnerType\.SHEEP/);
  assert.match(source, /createCharacterColliderDrawCommands/);
  assert.match(source, /combatCollider: record\.combat\.getCombatCollider\(\)/);
  assert.match(source, /movementCollider: record\.actor\.getMovementCollider\(\)/);
});

test("main coordinates reciprocal sheep contact before individual sheep updates", async () => {
  const source = await readFile(new URL("../../src/main.js", import.meta.url), "utf8");
  assert.match(source, /createSheepContactCoordinator/);
  assert.match(source, /sheepContactCoordinator\.update\(sheepSnapshots\)/);
  assert.match(source, /record\.actor\.beginContact\(/);
  assert.match(source, /partnerCell:/);
});

test("main supplies every sheep only the other living sheep colliders", async () => {
  const source = await readFile(new URL("../../src/main.js", import.meta.url), "utf8");
  assert.match(source, /record\.combat\.label !== currentRecord\.combat\.label/);
  assert.match(source, /type: "npc"/);
  assert.match(source, /id: record\.combat\.label/);
});

test("sheep movement never exempts a touching partner walk collider", async () => {
  const source = await readFile(new URL("../../src/characters/npc/sheep/sheep.js", import.meta.url), "utf8");
  assert.match(source, /isWalkable: \(cell\) => isWalkable\(cell, dynamicColliders\)/);
  assert.match(source, /\.\.\.dynamicColliders\.map\(\(\{ collider \}\) => collider\)/);
  assert.doesNotMatch(source, /separationPartnerId|movementBlockers/);
});

test("flock contact coordination remains inside active gameplay time", async () => {
  const source = await readFile(new URL("../../src/main.js", import.meta.url), "utf8");
  assert.match(source, /if \(activeDelta > 0\)[\s\S]*sheepContactCoordinator\.update/);
});
