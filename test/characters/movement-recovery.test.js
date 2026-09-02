import test from 'node:test';
import assert from 'node:assert/strict';
import { createGoblinBehaviorController } from '../../src/characters/enemies/goblin/goblin-behavior-controller.js';
import { createGridWalkability } from '../../src/characters/npc/sheep/sheep-navigation.js';
import { createGridAlignedMovementController } from '../../src/gameplay/game-logic.js';

const grid = { columns: 9, rows: 16, tileSizePx: 64 };
const bounds = { width: 576, height: 1024 };
const character = { frame: { width: 0, height: 0 }, pivot: { x: 0, y: 0 }, collider: { type: 'circle', x: 0, y: 0, radius: 24 } };
function fixture(obstacles = [], options = {}) {
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
    random: () => 0, bushChance: 0, idleRange: [0, 0], ...options,
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
import { createMovementRecovery } from '../../src/characters/movement-recovery.js';

test('progress watchdog detects oscillation and ignores intentional locks', () => {
  const recovery = createMovementRecovery();
  const target = { x: 96, y: 32 };
  for (let i = 0; i < 120; i++) assert.equal(recovery.observe({ x: 32, y: 32 }, target, 1 / 60, false), false);
  recovery.observe({ x: 32, y: 32 }, target, 0.01);
  let failed = false;
  for (let i = 0; i < 70 && !failed; i++) failed = recovery.observe({ x: 32 + (i % 2) * 0.1, y: 32 }, target, 1 / 60);
  assert.equal(failed, true);
  assert.equal(recovery.snapshot().recoveryReason, 'no-progress');
  recovery.cancel();
  assert.equal(recovery.snapshot().recoveryState, 'idle');
});
test('recovery waits use active time, repeat, cancel, and validate configuration', () => {
  const recovery = createMovementRecovery();
  assert.throws(() => createMovementRecovery({ retrySeconds: 0 }), RangeError);
  for (let cycle = 0; cycle < 3; cycle++) {
    recovery.wait();
    assert.equal(recovery.tickWait(0), false);
    assert.equal(recovery.tickWait(2.9), false);
    assert.equal(recovery.tickWait(0.1), true);
  }
  recovery.cancel();
  assert.equal(recovery.tickWait(100), false);
});
test('walkability checks an off-center segment and refreshes dynamic blockers', () => {
  const walkable = createGridWalkability({ grid, bounds, character, obstacles: [] });
  const from = { x: 0, y: 12 }, to = { x: 1, y: 12 };
  const blocked = [{ collider: { type: 'circle', x: 96, y: 800, radius: 24 } }];
  assert.equal(walkable.canTraverse(from, to, blocked, { x: 35, y: 801 }), false);
  assert.equal(walkable.canTraverse(from, to, [], { x: 35, y: 801 }), true);
});

test('goblin uses a one-cell escape outside its normal patrol length and home radius', () => {
  const f = fixture([], { homeRadius: 0, patrolRange: [3, 5],
    isWalkable: cell => cell.x === 0 && (cell.y === 12 || cell.y === 11) });
  f.tick(0.5);
  assert.ok(f.actor.getPosition().y < 800);
  assert.equal(f.controller.getNavigationSnapshot().recoveryReason, 'no-route');
});
test('goblin abandons a bush approach when its segment becomes blocked', () => {
  const f = fixture([], { prioritizeBushes: true, bushChance: 1,
    getWorld: () => ({characters: [], bushes: [{id:'target',isAlive:true,cell:{x:0,y:9},position:{x:32,y:608}}]}) });
  f.tick(0.05);
  assert.equal(f.controller.mode,'walking-bush');
  f.obstacles.push({x:0,y:766,width:64,height:4});
  f.tick(0.5);
  assert.equal(f.controller.getNavigationSnapshot().recoveryReason,'blocked-segment');
  assert.equal(f.controller.mode,'walking');
  assert.ok(f.actor.getPosition().x > 32);
});
