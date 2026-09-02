import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpriteAnimationManager } from '@babylonjs/lite';
import { createEnemyAwarenessController } from '../../src/characters/enemies/enemy-awareness-controller.js';
import { createEnemyPatrolController } from '../../src/characters/enemies/enemy-patrol-controller.js';
import { createGoblinBehaviorController } from '../../src/characters/enemies/goblin/goblin-behavior-controller.js';
import { createArcher } from '../../src/characters/enemies/archer/archer.js';
import { createGoblin } from '../../src/characters/enemies/goblin/goblin.js';
import { createWarrior } from '../../src/characters/enemies/warrior/warrior.js';
import { createLancer } from '../../src/characters/enemies/lancer/lancer.js';
import { createMonk } from '../../src/characters/enemies/monk/monk.js';

const factories = { archer: createArcher, goblin: createGoblin, warrior: createWarrior, lancer: createLancer, monk: createMonk };
const grid = { columns: 8, rows: 8, tileSizePx: 64 };
function setup(type, options = {}) {
  const atlas = { frames: Array.from({ length: 20 }, () => ({ uvMin: [0, 0], uvMax: [1, 1], sourceSizePx: [192, 192] })) };
  const actor = factories[type]({ atlases: new Proxy({}, { get: () => atlas }), initialPosition: { x: 105, y: 96 },
    bounds: { width: 512, height: 512 }, obstacles: [] });
  actor.playAnimation(createSpriteAnimationManager());
  const controller = type === 'goblin'
    ? createGoblinBehaviorController(actor, { grid, spawnCell: { x: 1, y: 1 }, isWalkable: () => true,
      getWorld: () => ({ characters: [], bushes: [] }), random: () => 0, bushChance: 0, idleRange: [0, 0], patrolRange: [1, 2] })
    : createEnemyPatrolController(actor, { random: () => 0, idleRange: [0, 0], patrolRange: [10, 10] });
  const awareness = createEnemyAwarenessController({ actor, controller, grid, isWalkable: () => true, random: () => 0, ...options });
  const tick = (delta = 0.016) => { awareness.update(delta); actor.update(delta); };
  tick(); tick();
  return { actor, controller, awareness, tick, reaction: awareness.reaction };
}

for (const type of Object.keys(factories)) {
  for (const strength of [0.25, 0.5, 1]) {
    test(`${type} full actor update stops before fresh response at strength ${strength}`, () => {
      const { actor, controller, awareness, reaction, tick } = setup(type);
      const before = actor.getPosition();
      assert.ok(before.x > 105, 'normal controller started moving');
      reaction.acceptDetection({ strength, cell: { x: 4, y: 1 } });
      assert.equal(awareness.getNavigationSnapshot().interruptPending, true);
      tick(0); tick();
      assert.deepEqual(actor.getPosition(), before);
      assert.equal(controller.getNavigationSnapshot().waypoint, null);
      assert.equal(actor.layers[0].visible, true, 'idle artwork must be rendered on entry');
      assert.equal(actor.layers.slice(1).some(layer => layer.visible), false, 'walking artwork must be hidden');
      tick();
      if (strength === 0.25) assert.deepEqual(actor.getPosition(), before);
      else assert.ok(actor.getPosition().x > before.x, 'same direction is allowed only after a fresh decision');
      actor.dispose();
    });
  }
  test(`${type} suspicious facing turns without walking`, () => {
    const { actor, reaction, tick } = setup(type);
    reaction.acceptDetection({ strength: 0.25, cell: { x: 0, y: 1 } });
    const before = actor.getPosition(); tick(); tick();
    assert.deepEqual(actor.getPosition(), before);
    assert.equal(actor.getHeading(), 'left');
    actor.dispose();
  });
}

test('refresh does not freeze, latest state wins, reset resumes fresh patrol, death cancels', () => {
  let alive = true;
  const { actor, awareness, reaction, tick } = setup('goblin', { isAlive: () => alive });
  reaction.acceptDetection({ strength: 0.25, cell: { x: 0, y: 1 } });
  reaction.acceptDetection({ strength: 1, cell: { x: 4, y: 1 } });
  tick();
  for (let i = 0; i < 3; i++) {
    const before = actor.getPosition();
    reaction.acceptDetection({ strength: 1, cell: { x: 4, y: 1 } });
    tick(); assert.ok(actor.getPosition().x > before.x);
  }
  reaction.reset(); tick(); tick();
  assert.equal(awareness.getNavigationSnapshot().state, 'NONE');
  reaction.forceState('ALERT'); alive = false;
  const before = actor.getPosition(); tick(); tick();
  assert.deepEqual(actor.getPosition(), before);
  assert.equal(awareness.getNavigationSnapshot().target, null);
  actor.dispose();
});

test('blocked target waits bounded time and resumes safely when an exit opens', () => {
  let open = false, checks = 0;
  const { actor, awareness, reaction, tick } = setup('lancer', { isWalkable: () => { checks++; return open; } });
  reaction.acceptDetection({ strength: 1, cell: { x: 4, y: 1 } });
  tick(); tick();
  const before = actor.getPosition(), count = checks;
  for (let i = 0; i < 10; i++) tick();
  assert.equal(checks, count, 'do not search every frame while enclosed');
  assert.deepEqual(actor.getPosition(), before);
  open = true; awareness.update(3); actor.update(0.016);
  assert.ok(actor.getPosition().x > before.x);
  actor.dispose();
});

test('attack lock preserves interruption until the first eligible movement update', () => {
  const { actor, awareness, reaction, tick } = setup('warrior');
  let locked = true;
  const original = actor.isMovementLocked;
  actor.isMovementLocked = () => locked;
  reaction.acceptDetection({ strength: 1, cell: { x: 4, y: 1 } });
  const before = actor.getPosition(); tick();
  assert.equal(awareness.getNavigationSnapshot().interruptPending, true);
  locked = false; tick();
  assert.deepEqual(actor.getPosition(), before);
  tick(); assert.ok(actor.getPosition().x > before.x);
  actor.isMovementLocked = original; actor.dispose();
});

test('goblin awareness preserves an active attack and melee decisions after stopping', () => {
  const { actor, reaction, tick } = setup('goblin');
  assert.equal(actor.attack({ x: 1, y: 0 }), true);
  reaction.acceptDetection({ strength: 1, cell: { x: 4, y: 1 } });
  const before = actor.getPosition(); tick();
  assert.equal(actor.state, 'attacking');
  assert.deepEqual(actor.getPosition(), before);
  actor.dispose();
});

test('real goblin combat-only update can attack without restarting a canceled bush route', () => {
  let attacked = 0, intent;
  const actor = { getPosition: () => ({ x: 96, y: 96 }),
    getMovementCollider: () => ({ type: 'circle', x: 96, y: 96, radius: 24 }),
    setMovementIntent: next => { intent = next; }, attack: () => { attacked++; return true; } };
  const controller = createGoblinBehaviorController(actor, { grid, spawnCell: { x: 1, y: 1 }, isWalkable: () => true,
    getWorld: () => ({ bushes: [], characters: [{ id: 'player', isAlive: true, cell: { x: 2, y: 1 }, position: { x: 160, y: 96 } }] }) });
  const awareness = createEnemyAwarenessController({ actor, controller, grid, isWalkable: () => true });
  awareness.reaction.acceptDetection({ strength: 1, cell: { x: 2, y: 1 } });
  awareness.update(0.016); assert.equal(attacked, 0);
  awareness.update(0.016); assert.equal(attacked, 1);
  assert.deepEqual(intent, { x: 0, y: 0 });
  awareness.reaction.forceState('INVESTIGATING');
  awareness.update(0.016); awareness.update(0.016);
  assert.equal(attacked, 1, 'entry must not discard attack recovery');
});

test('dynamic segment rejection stops reaction movement and clears the pending waypoint', () => {
  let traversable = true;
  const walkable = () => true;
  walkable.canTraverse = () => traversable;
  const { actor, awareness, reaction, tick } = setup('warrior', { isWalkable: walkable });
  reaction.acceptDetection({ strength: 1, cell: { x: 4, y: 1 } }); tick(); tick();
  const before = actor.getPosition(); traversable = false; tick();
  assert.deepEqual(actor.getPosition(), before);
  assert.equal(awareness.getNavigationSnapshot().waypoint, null);
  actor.dispose();
});
