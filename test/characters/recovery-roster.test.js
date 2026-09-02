import test from 'node:test';
import assert from 'node:assert/strict';
import { createRecoveryScenario } from '../browser/recovery-scenario.js';
for (const kind of ['goblin', 'warrior', 'lancer', 'archer', 'monk', 'sheep']) {
  test(`${kind} waits through two retries then exits temporary enclosure`, () => {
    const scenario = createRecoveryScenario(kind);
    for (let i = 0; i < 6.8 * 60; i++) scenario.update(1 / 60);
    assert.deepEqual(scenario.actor.getPosition(), scenario.origin);
    assert.equal(scenario.snapshot().recoveryState, 'waiting');
    for (let i = 0; i < 5 * 60; i++) scenario.update(1 / 60);
    assert.ok(scenario.actor.getPosition().x > 64, JSON.stringify(scenario.snapshot()));
  });
}

import { createEnemyPatrolController } from '../../src/characters/enemies/enemy-patrol-controller.js';
import { createMovementRecovery, reachableRoutes } from '../../src/characters/movement-recovery.js';
import { getColliderCenter } from '../../src/characters/character-spatial.js';

test('the only reverse exit is chosen and a deliberate movement lock suspends recovery', () => {
  const scenario = createRecoveryScenario('warrior', false);
  let reverseOnly = false, locked = false;
  const actor = scenario.actor;
  const originalLock = actor.isMovementLocked.bind(actor);
  actor.isMovementLocked = () => locked || originalLock();
  const controller = createEnemyPatrolController(actor, { idleRange: [0,0], patrolRange: [20,20], random: () => 0,
    isDirectionWalkable: direction => reverseOnly ? direction.x === -1 : direction.x === 1 });
  controller.update(0.01);
  actor.setPosition({x:96,y:32});
  reverseOnly = true;
  locked = true;
  controller.update(10);
  assert.equal(controller.getNavigationSnapshot().recoveryReason, null);
  locked = false;
  controller.update(0.01);
  assert.deepEqual(controller.getNavigationSnapshot().intent, {x:-1,y:0});
  controller.cancel();
  assert.equal(controller.getNavigationSnapshot().waypoint, null);
});

test('archer physical movement honors a living dynamic collider', () => {
  const scenario = createRecoveryScenario('archer', false);
  const actor = scenario.actor;
  actor.setMovementIntent({ x: 1, y: 0 });
  const blockers = [{ collider: { type:'circle', x:86,y:32,radius:24 } }];
  for (let i=0;i<60;i++) actor.update(1/60,blockers);
  assert.ok(getColliderCenter(actor.getMovementCollider()).x <= 38 + 1e-6);
});

test('a canceled actor retry cannot restart and a replacement starts fresh', () => {
  const recovery=createMovementRecovery(); recovery.fail(); recovery.wait(); recovery.cancel();
  assert.equal(recovery.tickWait(10),false);
  assert.equal(createMovementRecovery().snapshot().recoveryReason,null);
});

test('two actors approaching the same destination cannot overlap during stable sequential updates', () => {
  const a = createRecoveryScenario('archer', false).actor;
  const b = createRecoveryScenario('warrior', false).actor;
  a.setPosition({x:32,y:32}); b.setPosition({x:160,y:32});
  a.setMovementIntent({x:1,y:0}); b.setMovementIntent({x:-1,y:0});
  for(let i=0;i<120;i++) {
    a.update(1/60,[{collider:b.getMovementCollider()}]);
    b.update(1/60,[{collider:a.getMovementCollider()}]);
    const ac=a.getMovementCollider(), bc=b.getMovementCollider();
    assert.ok(Math.hypot(ac.x-bc.x,ac.y-bc.y) >= ac.radius+bc.radius-1e-6);
  }
});
