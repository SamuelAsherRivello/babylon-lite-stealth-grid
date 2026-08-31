import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { collidersOverlap } from "../src/game-logic.js";

const mainSource = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

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
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(source, /goldStoneObjects\.map\(\(object\) => \(\{ record: \{ type: "object", combat: object \}, collider: object\.getCombatCollider\(\) \}\)\)/);
  assert.match(source, /goldStoneObjects[\s\S]*combatCollider: object\.getCombatCollider\(\)/);
});

test("an upper-body projectile can overlap combat geometry without the movement circle", () => {
  const movementCollider = { type: "circle", x: 200, y: 324, radius: 18.2 };
  const combatCollider = { x: 168, y: 172, width: 64, height: 128 };
  const projectileCollider = { x: 194, y: 180, width: 12, height: 12 };

  assert.equal(collidersOverlap(projectileCollider, combatCollider), true);
  assert.equal(collidersOverlap(projectileCollider, movementCollider), false);
});

test("combat overlap remains gated by existing attack and movement conditions", () => {
  assert.match(
    mainSource,
    /touching[\s\S]*record\.actor\.state === EnemyState\.ATTACKING[\s\S]*playerRecord\.combat\.applyDamage/,
  );
  assert.match(
    mainSource,
    /touching && \(playerMovement\.x !== 0 \|\| playerMovement\.y !== 0\)[\s\S]*record\.combat\.applyDamage/,
  );
});
