import test from 'node:test';
import assert from 'node:assert/strict';
import { createGoblinBehaviorController } from '../../src/characters/enemies/goblin/goblin-behavior-controller.js';
import { createGridWalkability } from '../../src/characters/npc/sheep/sheep-navigation.js';
import { createGridAlignedMovementController } from '../../src/gameplay/game-logic.js';

const grid = { columns: 9, rows: 16, tileSizePx: 64 };
const bounds = { width: 576, height: 1024 };
const character = { frame: { width: 0, height: 0 }, pivot: { x: 0, y: 0 }, collider: { type: 'circle', x: 0, y: 0, radius: 24 } };
function fixture(obstacles = []) {
  let position = { x: 32, y: 800 }, intent = { x: 0, y: 0 };
  const movement = createGridAlignedMovementController(character, 64);
  const actor = {
    getPosition: () => ({ ...position }),
    getMovementCollider: () => ({ type: 'circle', ...position, radius: 24 }),
    setMovementIntent: value => { intent = value; },
    attack: () => false,
  };
  const walkable = createGridWalkability({ grid, bounds, character, obstacles });
  const controller = createGoblinBehaviorController(actor, {
    grid, spawnCell: { x: 0, y: 12 }, isWalkable: walkable,
    getWorld: () => ({ characters: [], bushes: [] }),
    random: () => 0, bushChance: 0, idleRange: [0, 0],
  });
  return { actor, controller, obstacles,
    tick(seconds) { for (let i = 0; i < Math.round(seconds * 60); i++) {
      controller.update(1 / 60);
      position = movement.move(position, intent, 2, 1 / 60, bounds, obstacles);
    } },
  };
}
test('goblin abandons a clear-endpoint route blocked by a thin corner wall', () => {
  const f = fixture([{ x: 0, y: 766, width: 64, height: 4 }]);
  f.tick(8);
  assert.ok(f.actor.getPosition().x > 64, 'must take the available right escape instead of pushing down forever');
});
test('goblin waits while enclosed then takes the newly opened sole exit', () => {
  const f = fixture([
    { x: 0, y: 766, width: 64, height: 4 },
    { x: 0, y: 830, width: 64, height: 4 },
    { x: 62, y: 768, width: 4, height: 64 },
  ]);
  f.tick(8);
  assert.equal(f.controller.mode, 'waiting');
  f.obstacles.pop();
  f.tick(4);
  assert.ok(f.actor.getPosition().x > 64);
});
