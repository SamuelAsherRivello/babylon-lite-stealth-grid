import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { collidersOverlap } from "../../src/gameplay/game-logic.js";

const mainSource = await readFile(new URL("../../src/main.js", import.meta.url), "utf8");

test("runtime routes movement colliders to blocking, navigation, and bushes", () => {
  const reactiveSection = mainSource.match(/const reactiveCharacters = \[[\s\S]*?\n      \];/)?.[0] ?? "";
  assert.match(mainSource, /actor\.getMovementCollider\(\)/);
  assert.match(mainSource, /MovementCollider/);
  assert.match(reactiveSection, /getMovementCollider\(\)/);
  assert.doesNotMatch(reactiveSection, /getCombatCollider\(\)/);
});

test("runtime routes combat colliders to projectiles and contact checks", () => {
  assert.match(mainSource, /actor\.getCombatCollider\(\)/);
  assert.match(mainSource, /playerCombatCollider/);
  assert.match(mainSource, /enemyCombatColliders/);
  assert.match(mainSource, /sheepCombatColliders/);
});

test("Level01 runtime exposes Gold Stone combat colliders to projectile targets and diagnostics", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../../src/main.js", import.meta.url), "utf8");
  assert.match(source, /goldStoneObjects\.map\(\(object\) => \(\{ record: \{ type: "object", combat: object \}, collider: object\.getCombatCollider\(\) \}\)\)/);
  assert.match(source, /goldStoneObjects[\s\S]*combatCollider: object\.getCombatCollider\(\)/);
});

test("runtime exposes gold pickup combat colliders and grid spots without movement colliders", () => {
  assert.match(mainSource, /pickupSystem\.pickups[\s\S]*combatCollider: pickup\.getCombatCollider\(\)[\s\S]*movementCollider: null[\s\S]*gridSpot: new GridSpot/);
});

test("diagnostic player-center classification does not depend on active-update scope", () => {
  assert.match(mainSource, /isPlayer: record\.type === SpawnerType\.PLAYER/);
  assert.doesNotMatch(mainSource, /isPlayer: record\.actor === playerRecord\.actor/);
});

test("pickup collection uses the player combat collider", () => {
  assert.match(mainSource, /pickupSystem\.update\(activeDelta, playerCombatCollider\)/);
});

test("an upper-body projectile can overlap combat geometry without the movement circle", () => {
  const movementCollider = { type: "circle", x: 200, y: 324, radius: 18.2 };
  const combatCollider = { x: 168, y: 172, width: 64, height: 128 };
  const projectileCollider = { x: 194, y: 180, width: 12, height: 12 };

  assert.equal(collidersOverlap(projectileCollider, combatCollider), true);
  assert.equal(collidersOverlap(projectileCollider, movementCollider), false);
});

test("player damage uses committed impact events while player contact still requires movement", () => {
  assert.match(mainSource, /resolveMeleeImpacts\(enemyRecords, playerRecord\)/);
  assert.match(mainSource, /touching && \(playerMovement\.x !== 0 \|\| playerMovement\.y !== 0\)[\s\S]*record\.combat\.applyDamage/);
});
