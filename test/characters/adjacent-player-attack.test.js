import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpriteAnimationManager, updateSpriteAnimationManager } from '@babylonjs/lite';
import { createEnemyAwarenessController } from '../../src/characters/enemies/enemy-awareness-controller.js';
import { createEnemyPatrolController } from '../../src/characters/enemies/enemy-patrol-controller.js';
import { createGoblinBehaviorController } from '../../src/characters/enemies/goblin/goblin-behavior-controller.js';
import { createGoblin } from '../../src/characters/enemies/goblin/goblin.js';
import { createWarrior } from '../../src/characters/enemies/warrior/warrior.js';
import { createLancer } from '../../src/characters/enemies/lancer/lancer.js';
import { LANCER_ANIMATION_NAMES } from '../../src/characters/enemies/lancer/lancer-animation-catalog.js';
import { createArcher } from '../../src/characters/enemies/archer/archer.js';
import { createMonk } from '../../src/characters/enemies/monk/monk.js';

const factories = { goblin: createGoblin, warrior: createWarrior, lancer: createLancer, archer: createArcher, monk: createMonk };
const states = ['NONE', 'SUSPICIOUS', 'INVESTIGATING', 'ALERT'];
const offsets = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
function setup(character, offset = offsets[0], options = {}) {
  const grid = { columns: 12, rows: 12, tileSizePx: 64 };
  const atlas = { frames: Array.from({ length: 20 }, () => ({ uvMin: [0, 0], uvMax: [1, 1], sourceSizePx: [192, 192] })) };
  const shots = [];
  let attacks = 0, heals = 0, alive = true;
  let player = { id: 'player', isAlive: true, detected: false, cell: { x: 3 + offset.x, y: 3 + offset.y },
    position: { x: 224 + offset.x * 64, y: 224 + offset.y * 64 } };
  const actor = factories[character]({ atlases: new Proxy({}, { get: () => atlas }),
    initialPosition: { x: 224, y: 224 }, bounds: { width: 768, height: 768 }, obstacles: [],
    onAttack: () => attacks++, onHeal: () => heals++, onShoot: (...args) => shots.push(args) });
  const manager = createSpriteAnimationManager(); actor.playAnimation(manager);
  const controller = character === 'goblin'
    ? createGoblinBehaviorController(actor, { grid, spawnCell: { x: 3, y: 3 }, isWalkable: () => true,
      getWorld: () => options.world ?? ({ characters: [], bushes: [] }), idleRange: [0, 0], bushChance: 0, random: () => 0 })
    : createEnemyPatrolController(actor, { idleRange: [0, 0], random: () => 0 });
  const awareness = createEnemyAwarenessController({ actor, character, controller, grid,
    getPlayer: () => player, isAlive: () => alive, isWalkable: options.isWalkable ?? (() => true) });
  const tick = (delta = 0.016) => {
    awareness.update(delta); actor.update(delta, [], [], player);
    updateSpriteAnimationManager(manager, delta * 1000);
  };
  return { actor, controller, awareness, shots, tick, manager,
    setPlayer: value => { player = value; }, get player() { return player; },
    setAlive: value => { alive = value; }, get attacks() { return attacks; }, get heals() { return heals; } };
}
const attacking = actor => /attack|shooting/.test(actor.state);

for (const character of ['goblin', 'warrior', 'lancer', 'archer']) {
  for (const state of ['NONE', 'SUSPICIOUS', 'INVESTIGATING']) test(`${character} cannot attack a hidden player in ${state}`, () => {
    const s = setup(character);
    s.player.hidden = true;
    s.awareness.reaction.forceState(state);
    s.tick();
    assert.equal(attacking(s.actor), false);
    s.actor.dispose();
  });
  test(`${character} can attack a hidden player during visually confirmed alert`, () => {
    const s = setup(character);
    s.awareness.reaction.acceptDetection({ type: 'visual', strength: 1, cell: s.player.cell });
    s.player.hidden = true;
    s.tick();
    assert.equal(attacking(s.actor), true);
    s.actor.dispose();
  });
  test(`${character} loses hidden attack permission when alert expires`, () => {
    const s = setup(character);
    s.awareness.reaction.acceptDetection({ type: 'visual', strength: 1, cell: s.player.cell });
    s.player.hidden = true;
    s.awareness.reaction.update(5);
    s.tick();
    assert.equal(attacking(s.actor), false);
    s.actor.dispose();
  });
}

test('alert tracks changing hidden position without extending its timer, then freezes memory', () => {
  const s = setup('warrior', { x: 3, y: 0 });
  s.awareness.reaction.acceptDetection({ type: 'visual', strength: 1, cell: s.player.cell });
  s.player.hidden = true;
  s.player.cell = { x: 6, y: 4 }; s.player.position = { x: 416, y: 288 };
  s.awareness.reaction.update(1);
  const remaining = s.awareness.reaction.getSnapshot().remainingSeconds;
  s.tick();
  assert.deepEqual(s.awareness.reaction.getSnapshot().lastKnownCell, s.player.cell);
  assert.equal(s.awareness.reaction.getSnapshot().remainingSeconds, remaining);
  s.awareness.reaction.update(remaining);
  const lastTracked = s.awareness.reaction.getSnapshot().lastKnownCell;
  s.player.cell = { x: 7, y: 4 }; s.player.position = { x: 480, y: 288 };
  s.tick();
  assert.deepEqual(s.awareness.reaction.getSnapshot().lastKnownCell, lastTracked);
  s.actor.dispose();
});

for (const [offset, heading, animation, flip] of [
  [{ x: 1, y: 0 }, 'right', 'attack-2', false],
  [{ x: -1, y: 0 }, 'left', 'attack-2', true],
  [{ x: 0, y: -1 }, 'up', 'attack-1', false],
  [{ x: 0, y: 1 }, 'down', 'attack-up', false],
]) test(`lancer faces player and thrusts ${heading}, holding heading until completion`, () => {
  const s = setup('lancer', offset);
  s.actor.faceDirection({ x: -offset.x, y: -offset.y });
  s.tick();
  assert.equal(s.actor.getHeading(), heading);
  const layer = s.actor.layers[LANCER_ANIMATION_NAMES.indexOf(animation)];
  assert.equal(layer.visible, true, `expected ${animation} artwork`);
  assert.equal(layer._instanceData[4] > layer._instanceData[6], flip);
  s.actor.setMovementIntent({ x: -offset.x, y: -offset.y });
  s.actor.faceDirection({ x: -offset.x, y: -offset.y });
  assert.equal(s.actor.attack('attack-1', { x: -offset.x, y: -offset.y }), false);
  assert.equal(s.actor.getHeading(), heading);
  assert.equal(layer.visible, true);
  for (let frame = 0; frame < 4; frame++) updateSpriteAnimationManager(s.manager, 101);
  assert.equal(s.actor.isAttacking, false);
  s.player.cell = { x: 3 - offset.x, y: 3 - offset.y };
  s.player.position = { x: 224 - offset.x * 64, y: 224 - offset.y * 64 };
  s.tick();
  assert.notEqual(s.actor.getHeading(), heading, 'next attack reacquires player');
  s.actor.dispose();
});

for (const character of Object.keys(factories)) for (const state of states) for (const offset of offsets) {
  test(`${character} adjacency ${offset.x},${offset.y} in ${state}`, () => {
    const s = setup(character, offset);
    s.awareness.reaction.forceState(state);
    const before = s.actor.getPosition(); s.tick();
    assert.equal(attacking(s.actor), character !== 'monk');
    assert.equal(s.heals, 0);
    assert.equal(s.awareness.reaction.getSnapshot().state, state);
    if (character !== 'monk') {
      assert.deepEqual(s.actor.getPosition(), before);
      assert.ok(s.actor.layers.slice(1).some(layer => layer.visible), 'attack artwork is visible');
    }
    s.actor.dispose();
  });
}
for (const character of Object.keys(factories).filter(x => x !== 'monk')) {
  for (const offset of [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }]) {
    test(`${character} no adjacency trigger at ${offset.x},${offset.y}`, () => {
      const s = setup(character, offset); s.tick(); assert.equal(attacking(s.actor), false); s.actor.dispose();
    });
  }
  for (const condition of ['paused', 'dead player', 'absent player', 'dead enemy', 'disposed', 'locked']) {
    test(`${character} respects ${condition}`, () => {
      const s = setup(character);
      if (condition === 'dead player') s.player.isAlive = false;
      if (condition === 'absent player') s.setPlayer(null);
      if (condition === 'dead enemy') s.setAlive(false);
      if (condition === 'disposed') s.awareness.dispose();
      if (condition === 'locked') s.actor.isMovementLocked = () => true;
      s.tick(condition === 'paused' ? 0 : 0.016);
      assert.equal(attacking(s.actor), false); s.actor.dispose();
    });
  }
  test(`${character} repeats after completion and stops using stale target`, () => {
    const s = setup(character); s.tick(); assert.ok(attacking(s.actor));
    const before = s.actor.getPosition();
    for (let i = 0; i < 250; i++) s.tick(0.016);
    assert.ok(character === 'archer' ? s.shots.length >= 2 : s.attacks >= 2);
    assert.deepEqual(s.actor.getPosition(), before);
    s.setPlayer(null);
    for (let i = 0; i < 200; i++) s.tick(0.016);
    assert.equal(attacking(s.actor), false); s.actor.dispose();
  });
  test(`${character} uses registered cells even away from their centers`, () => {
    const s = setup(character);
    s.actor.setPosition({ x: 200, y: 200 });
    s.player.position = { x: 318, y: 250 };
    s.tick(); assert.equal(attacking(s.actor), false);
    for (let i = 0; i < 100 && !attacking(s.actor); i++) s.tick();
    assert.ok(attacking(s.actor)); assert.deepEqual(s.actor.getPosition(), { x: 224, y: 224 }); s.actor.dispose();
  });
}

test('archer keeps captured target and releases only one arrow in each shot', () => {
  const s = setup('archer'); const original = { ...s.player.position };
  s.tick(); assert.equal(s.actor.state, 'shooting');
  s.player.position = { x: 500, y: 500 }; s.player.cell = { x: 7, y: 7 };
  for (let i = 0; i < 50; i++) s.tick(0.016);
  assert.equal(s.shots.length, 1); assert.deepEqual(s.shots[0][1], original);
  assert.equal(s.actor.state, 'recovering'); s.actor.dispose();
});

test('existing detected ranged archer attack outside adjacency is preserved', () => {
  const s = setup('archer', { x: 2, y: 0 }); s.player.detected = true;
  s.tick(); assert.equal(s.actor.state, 'shooting'); s.actor.dispose();
});

test('adjacency consumes authoritative cells with the configured grid size', () => {
  let requestedSize, attacks = 0;
  const actor = { getGridPosition: size => { requestedSize = size; return { x: 4, y: 6 }; },
    getMovementCollider: () => ({ type: 'circle', x: 450, y: 650, radius: 24 }),
    setMovementIntent() {}, attack() { attacks++; return true; } };
  const awareness = createEnemyAwarenessController({ actor, character: 'warrior', controller: { update() {}, cancel() {} },
    grid: { tileSizePx: 100, columns: 12, rows: 12 }, isWalkable: () => true,
    getPlayer: () => ({ isAlive: true, cell: { x: 5, y: 6 }, position: { x: 550, y: 650 } }) });
  awareness.update(0.016); assert.equal(attacks, 1); assert.equal(requestedSize, 100);
});

for (const character of ['goblin', 'warrior', 'lancer', 'archer']) {
  for (const strength of [0, 0.25, 0.5, 1]) test(`${character} preempts navigation and alert entry ${strength}`, () => {
    const s = setup(character); const player = s.player; s.setPlayer(null);
    s.tick(); s.tick();
    if (strength) s.awareness.reaction.acceptDetection({ strength, cell: { x: 8, y: 3 } });
    s.setPlayer(player);
    const own = s.actor.getGridPosition(64); s.tick();
    for (let i = 0; i < 100 && !attacking(s.actor); i++) s.tick();
    assert.ok(attacking(s.actor)); assert.deepEqual(s.actor.getPosition(), { x: (own.x + .5) * 64, y: (own.y + .5) * 64 });
    assert.equal(s.controller.getNavigationSnapshot().waypoint, null);
    s.actor.dispose();
  });
  test(`${character} preempts blocked investigation waiting`, () => {
    const s = setup(character, offsets[0], { isWalkable: () => false });
    const player = s.player; s.setPlayer(null);
    s.awareness.reaction.acceptDetection({ strength: 0.5, cell: { x: 8, y: 3 } });
    s.tick(); s.tick();
    assert.equal(s.awareness.getNavigationSnapshot().recoveryState, 'waiting');
    s.setPlayer(player); s.tick(); assert.ok(attacking(s.actor)); s.actor.dispose();
  });
}

test('Goblin player priority preserves the full recovery interval and committed alternate attacks', () => {
  const sheep = { id: 'sheep', isAlive: true, cell: { x: 2, y: 3 }, position: { x: 160, y: 224 } };
  const s = setup('goblin', offsets[0], { world: { characters: [sheep], bushes: [] } });
  const directions = [], attack = s.actor.attack;
  s.actor.attack = direction => { directions.push(direction); return attack(direction); };
  s.tick(); assert.deepEqual(directions[0], { x: 1, y: 0 }, 'player beats sheep');
  for (let i = 0; i < 8; i++) updateSpriteAnimationManager(s.manager, 101);
  assert.equal(s.actor.isMovementLocked(), false);
  s.tick(0.6); s.tick(0.6); assert.equal(s.attacks, 1, 'recovery must not tick twice per update');
  s.tick(0.06); assert.equal(s.attacks, 2);
  s.actor.dispose();

  const t = setup('goblin', offsets[0], { world: { characters: [sheep], bushes: [] } });
  const player = t.player; t.setPlayer(null); t.tick();
  assert.equal(t.attacks, 1); t.setPlayer(player); t.tick();
  assert.equal(t.attacks, 1, 'adjacency does not cancel a committed sheep attack');
  t.actor.dispose();
});
