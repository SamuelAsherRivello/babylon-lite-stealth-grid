import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { collidersOverlap } from '../../src/gameplay/game-logic.js';
import { resolveProjectileHit } from '../../src/systems/objects/projectile-combat.js';

// Execute the runtime's collision pass with overlapping targets and fake effects.
const source = await readFile(new URL('../../src/main.js', import.meta.url), 'utf8');
const start = source.indexOf('      const projectilesToRemove = [];');
const end = source.indexOf('\n      if (playerRecord?.combat.isAlive', start);
assert.ok(start >= 0 && end > start);
const route = new Function('projectiles', 'sheepCombatColliders', 'enemyCombatColliders',
  'goldStoneObjects', 'collidersOverlap', 'resolveProjectileHit', source.slice(start, end));

for (const character of ['archer', 'goblin', 'warrior', 'lancer', 'monk', 'sheep', 'object']) {
  test(`flying archer arrow passes through ${character} without damage, deflection, or removal`, () => {
    const effects = [];
    const collider = { x: 100, y: 100, width: 20, height: 20 };
    const combat = { isAlive: true, label: `${character}-other`,
      getCombatCollider: () => collider, applyDamage: () => effects.push('damage') };
    const target = { collider, record: { type: character === 'sheep' ? 'sheep' : 'enemy',
      character, combat, actor: { isDefending: true } } };
    const projectiles = {
      getColliders: () => [{ id: 1, ownerId: 'archer-1', collider, direction: { x: 1, y: 0 } }],
      markHit: () => effects.push('hit'), deflect: () => effects.push('deflect'),
      removeProjectiles: () => effects.push('remove'),
    };
    route(projectiles, character === 'sheep' ? [target] : [],
      !['sheep', 'object'].includes(character) ? [target] : [],
      character === 'object' ? [combat] : [], collidersOverlap, resolveProjectileHit);
    assert.deepEqual(effects, []);
  });
}
