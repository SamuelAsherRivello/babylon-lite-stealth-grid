import test from 'node:test';
import assert from 'node:assert/strict';
import { createEnemyPerceptionReaction } from '../../../src/systems/perception/enemy-perception-reaction.js';
import { createEnemyPatrolController } from '../../../src/characters/enemies/enemy-patrol-controller.js';
import { createGoblinBehaviorController } from '../../../src/characters/enemies/goblin/goblin-behavior-controller.js';

test('entry stops before response on initial detection, escalation, and de-escalation', () => {
  const calls = [];
  const reaction = createEnemyPerceptionReaction({ random: () => 0, profile: { searchDirectionDuration: 0 },
    onStop: () => calls.push('stop'), onFace: () => calls.push('face'), onMoveTo: () => calls.push('move'),
  });
  for (const strength of [0.25, 0.5, 1]) reaction.acceptDetection({ strength, cell: { x: 4, y: 2 } });
  reaction.update(3);
  reaction.update(8);
  assert.deepEqual(calls, ['stop', 'face', 'stop', 'move', 'stop', 'move', 'stop', 'move', 'stop', 'face']);
});

test('same-state refresh and weaker evidence do not stop again; forced entry and reset notify', () => {
  let stops = 0;
  const changes = [];
  const reaction = createEnemyPerceptionReaction({ onStop: () => stops++, onStateChange: state => changes.push(state) });
  reaction.acceptDetection({ strength: 1, cell: { x: 4, y: 2 } });
  reaction.acceptDetection({ strength: 1, cell: { x: 5, y: 2 } });
  reaction.acceptDetection({ strength: 0.25, cell: { x: 1, y: 2 } });
  assert.equal(stops, 1);
  reaction.forceState('SUSPICIOUS');
  reaction.forceState('SUSPICIOUS');
  assert.equal(stops, 2);
  reaction.reset();
  assert.deepEqual(changes, ['ALERT', 'SUSPICIOUS', 'NONE']);
});

for (const type of ['archer', 'warrior', 'lancer', 'monk', 'goblin']) {
  for (const strength of [0.25, 0.5, 1]) {
    test(`${type}: detection ${strength} stops an active controller at its off-center position`, () => {
      let position = { x: 105, y: 96 };
      let intent = { x: 0, y: 0 };
      const actor = {
        getPosition: () => ({ ...position }),
        getMovementCollider: () => ({ type: 'circle', ...position, radius: 24 }),
        setMovementIntent: next => { intent = { ...next }; },
        update: delta => { position.x += intent.x * 120 * delta; position.y += intent.y * 120 * delta; },
      };
      const controller = type === 'goblin'
        ? createGoblinBehaviorController(actor, { grid: { columns: 8, rows: 8, tileSizePx: 64 },
          spawnCell: { x: 1, y: 1 }, isWalkable: () => true, getWorld: () => ({ characters: [], bushes: [] }),
          random: () => 0, bushChance: 0, idleRange: [0, 0], patrolRange: [1, 2] })
        : createEnemyPatrolController(actor, { random: () => 0, idleRange: [0, 0], patrolRange: [10, 10] });
      controller.update(0.01); controller.update(0.01);
      assert.notDeepEqual(intent, { x: 0, y: 0 });
      const reaction = createEnemyPerceptionReaction({
        onStop: () => { controller.cancel(); actor.setMovementIntent({ x: 0, y: 0 }); },
      });
      const before = { ...position };
      reaction.acceptDetection({ strength, cell: { x: 4, y: 1 } });
      actor.update(0.016);
      assert.deepEqual(position, before, 'old walking intent must not survive accepted awareness');
      assert.equal(controller.getNavigationSnapshot().waypoint, null);
    });
  }
}
