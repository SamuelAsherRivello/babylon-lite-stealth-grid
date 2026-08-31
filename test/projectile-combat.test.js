import test from "node:test";
import assert from "node:assert/strict";

import { resolveProjectileHit } from "../src/projectile-combat.js";
import { SpawnerCharacter, SpawnerType } from "../src/spawner-catalog.js";

function harness({ character, type = SpawnerType.ENEMY, defending = false }) {
  const events = [];
  const target = {
    type,
    character,
    actor: { isDefending: defending },
    combat: {
      applyDamage(amount, direction) { events.push(["damage", amount, direction]); },
    },
  };
  const projectiles = {
    deflect(id) { events.push(["deflect", id]); return true; },
    markHit(id) { events.push(["hit", id]); },
  };
  return { events, projectiles, target };
}

const projectile = { id: 4, direction: { x: 1, y: 0 } };

test("a defending Warrior takes no damage and deflects the arrow", () => {
  const { events, projectiles, target } = harness({
    character: SpawnerCharacter.WARRIOR,
    defending: true,
  });
  assert.equal(resolveProjectileHit(projectiles, projectile, target), "deflected");
  assert.deepEqual(events, [["deflect", 4]]);
});

test("an undefended Warrior takes the existing 50 damage and consumes the arrow", () => {
  const { events, projectiles, target } = harness({
    character: SpawnerCharacter.WARRIOR,
    defending: false,
  });
  assert.equal(resolveProjectileHit(projectiles, projectile, target), "damaged");
  assert.deepEqual(events, [
    ["damage", 50, { x: 1, y: 0 }],
    ["hit", 4],
  ]);
});

test("existing sheep and goblin projectile damage remains unchanged", () => {
  const sheep = harness({ type: SpawnerType.SHEEP });
  resolveProjectileHit(sheep.projectiles, projectile, sheep.target);
  assert.equal(sheep.events[0][1], 100);

  const goblin = harness({ character: SpawnerCharacter.GOBLIN });
  resolveProjectileHit(goblin.projectiles, projectile, goblin.target);
  assert.equal(goblin.events[0][1], 50);
});

