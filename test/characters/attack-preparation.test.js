import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpriteAnimationManager, updateSpriteAnimationManager } from '@babylonjs/lite';
import { createGoblin } from '../../src/characters/enemies/goblin/goblin.js';
import { createWarrior } from '../../src/characters/enemies/warrior/warrior.js';
import { createLancer } from '../../src/characters/enemies/lancer/lancer.js';
import { createArcher } from '../../src/characters/enemies/archer/archer.js';
import { createEnemyAwarenessController } from '../../src/characters/enemies/enemy-awareness-controller.js';
import { createEnemyPatrolController } from '../../src/characters/enemies/enemy-patrol-controller.js';
import { createGoblinBehaviorController } from '../../src/characters/enemies/goblin/goblin-behavior-controller.js';
import { getPlayerAttackPreparationSnapshot } from '../../src/characters/enemies/player-attack-preparation.js';

const factories = { goblin: createGoblin, warrior: createWarrior, lancer: createLancer, archer: createArcher };

for (const character of Object.keys(factories)) test(`${character} cancels centering when hidden tracking expires`, () => {
  const s = setup(character);
  s.player.hidden = true;
  s.awareness.reaction.acceptDetection({ type: 'visual', strength: 1, cell: s.player.cell });
  s.tick();
  assert.ok(getPlayerAttackPreparationSnapshot(s.actor));
  s.awareness.reaction.update(5);
  s.tick();
  assert.equal(getPlayerAttackPreparationSnapshot(s.actor), null);
  assert.equal(s.attacks().length, 0);
  s.actor.dispose();
});

test('goblin autonomous combat excludes hidden players and resumes attacks after emergence', () => {
  const s = setup('goblin', { autonomous: true, initial: { x: 224, y: 224 } });
  s.player.hidden = true;
  s.tick();
  assert.equal(s.attacks().length, 0);
  s.player.hidden = false;
  s.controller.cancelNavigation();
  s.tick();
  assert.equal(s.attacks().length, 1);
  s.actor.dispose();
});
function setup(character, { initial = { x: 204, y: 212 }, autonomous = false, tileSize = 64 } = {}) {
  const grid = { tileSizePx: tileSize, columns: 12, rows: 12 };
  const center = { x: 3.5 * tileSize, y: 3.5 * tileSize };
  let player = { id: 'player', character: 'player', isAlive: true, detected: autonomous,
    position: { x: center.x + tileSize, y: center.y }, cell: { x: 4, y: 3 } };
  let alive = true;
  const events = [], shots = [];
  const atlas = { frames: Array.from({ length: 20 }, () => ({ uvMin: [0, 0], uvMax: [1, 1], sourceSizePx: [192, 192] })) };
  const actor = factories[character]({ atlases: new Proxy({}, { get: () => atlas }), initialPosition: initial,
    bounds: { width: 1200, height: 1200 }, obstacles: [], onShoot: (...args) => shots.push(args) });
  const face = actor.faceDirection.bind(actor);
  actor.faceDirection = direction => { events.push({ kind: 'face', position: actor.getPosition(), direction }); return face(direction); };
  const method = character === 'archer' ? 'shootAt' : 'attack';
  const attack = actor[method].bind(actor);
  actor[method] = (...args) => { const accepted = attack(...args); if (accepted) events.push({ kind: 'attack', position: actor.getPosition(), args }); return accepted; };
  const manager = createSpriteAnimationManager(); actor.playAnimation(manager);
  const controller = character === 'goblin'
    ? createGoblinBehaviorController(actor, { grid, spawnCell: { x: 3, y: 3 }, isWalkable: () => true,
      getWorld: () => ({ characters: player ? [player] : [], bushes: [] }), bushChance: 0, idleRange: [0, 0], random: () => 0 })
    : createEnemyPatrolController(actor, { idleRange: [0, 0], random: () => 0 });
  const awareness = createEnemyAwarenessController({ actor, character, controller, grid, isWalkable: () => true,
    getPlayer: () => player, isAlive: () => alive });
  const tick = (delta = .016, colliders = []) => {
    if (!autonomous) awareness.update(delta);
    else if (character === 'goblin') controller.update(delta);
    actor.update(delta, colliders, [], player);
    updateSpriteAnimationManager(manager, delta * 1000);
  };
  return { actor, awareness, controller, tick, events, shots, center,
    get player() { return player; }, setPlayer(value) { player = value; }, setAlive(value) { alive = value; },
    attacks: () => events.filter(e => e.kind === 'attack') };
}

for (const character of Object.keys(factories)) {
  for (const state of ['NONE', 'SUSPICIOUS', 'INVESTIGATING', 'ALERT']) test(`${character} centers then faces then attacks in ${state}`, () => {
    const s = setup(character); s.awareness.reaction.forceState(state);
    s.tick();
    assert.equal(s.attacks().length, 0, 'no attack before arrival');
    assert.equal(s.events.filter(e => e.kind === 'face').length, 0, 'no player aim before arrival');
    assert.notDeepEqual(s.actor.getPosition(), { x: 204, y: 212 }, 'centering moves');
    for (let i = 0; i < 100 && !s.attacks().length; i++) s.tick();
    assert.equal(s.attacks().length, 1);
    assert.deepEqual(s.attacks()[0].position, s.center);
    assert.equal(s.events.at(-2).kind, 'face');
    assert.deepEqual(s.events.at(-2).position, s.center);
    s.actor.dispose();
  });
  test(`${character} already centered attacks immediately`, () => {
    const s = setup(character, { initial: { x: 224, y: 224 } }); s.tick();
    assert.equal(s.attacks().length, 1); assert.equal(s.events[0].kind, 'face'); s.actor.dispose();
  });
  test(`${character} reacquires player position after centering`, () => {
    const s = setup(character); s.tick();
    s.setPlayer({ ...s.player, position: { x: 160, y: 224 }, cell: { x: 2, y: 3 } });
    for (let i = 0; i < 100 && !s.attacks().length; i++) s.tick();
    assert.equal(s.attacks().length, 1);
    assert.equal(s.actor.getHeading(), 'left'); assert.deepEqual(s.attacks()[0].position, s.center); s.actor.dispose();
  });
  for (const reason of ['player leaves', 'player dies', 'enemy dies', 'dispose', 'lock']) test(`${character} cancels preparation: ${reason}`, () => {
    const s = setup(character); s.tick();
    if (reason === 'player leaves') s.setPlayer(null);
    if (reason === 'player dies') s.player.isAlive = false;
    if (reason === 'enemy dies') s.setAlive(false);
    if (reason === 'dispose') s.awareness.dispose();
    if (reason === 'lock') s.actor.isMovementLocked = () => true;
    for (let i = 0; i < 80; i++) s.tick();
    assert.equal(s.attacks().length, 0); s.actor.dispose();
  });
  test(`${character} pauses centering`, () => {
    const s = setup(character); s.tick(); const before = s.actor.getPosition();
    for (let i = 0; i < 10; i++) s.tick(0);
    assert.deepEqual(s.actor.getPosition(), before); assert.equal(s.attacks().length, 0); s.actor.dispose();
  });
  test(`${character} blocked centering waits without attacking or tunneling`, () => {
    const s = setup(character, { initial: { x: 200, y: 224 } });
    const blockers = [{ collider: { x: 226, y: 190, width: 10, height: 68 } }];
    for (let i = 0; i < 100; i++) s.tick(.016, blockers);
    assert.equal(s.attacks().length, 0); assert.ok(s.actor.getPosition().x < 224);
    assert.equal(getPlayerAttackPreparationSnapshot(s.actor).recoveryState, 'waiting');
    for (let i = 0; i < 300 && !s.attacks().length; i++) s.tick();
    assert.equal(s.attacks().length, 1); assert.deepEqual(s.attacks()[0].position, s.center); s.actor.dispose();
  });
  test(`${character} captures configured own cell and bounds travel to normal speed`, () => {
    const s = setup(character, { initial: { x: 334, y: 337 }, tileSize: 100 });
    let before = s.actor.getPosition();
    for (let i = 0; i < 100 && !s.attacks().length; i++) {
      s.tick(.016);
      const after = s.actor.getPosition();
      assert.ok(Math.hypot(after.x - before.x, after.y - before.y) <= 120 * .016 + 1e-9);
      assert.ok(after.x === before.x || after.y === before.y, 'one axis per step'); before = after;
    }
    assert.equal(s.attacks().length, 1); assert.deepEqual(s.attacks()[0].position, s.center); s.actor.dispose();
  });
  test(`${character} repeated decisions cannot duplicate preparation or attack`, () => {
    const s = setup(character); s.tick();
    const center = getPlayerAttackPreparationSnapshot(s.actor).center;
    for (let i = 0; i < 20; i++) s.awareness.update(.016);
    assert.deepEqual(getPlayerAttackPreparationSnapshot(s.actor).center, center);
    for (let i = 0; i < 100 && !s.attacks().length; i++) s.tick();
    for (let i = 0; i < 20; i++) s.awareness.update(.016);
    assert.equal(s.attacks().length, 1); s.actor.dispose();
  });
  if (character !== 'archer') test(`${character} knockback cancels the captured center`, () => {
    const s = setup(character); s.tick();
    s.actor.applyKnockback({ x: -1, y: 0 }); s.tick();
    assert.equal(getPlayerAttackPreparationSnapshot(s.actor), null);
    assert.equal(s.attacks().length, 0); s.actor.dispose();
  });
  for (const delta of [.003, .017, .5]) test(`${character} exact arrival at timestep ${delta}`, () => {
    const s = setup(character);
    for (let i = 0; i < 400 && !s.attacks().length; i++) s.tick(delta);
    assert.equal(s.attacks().length, 1); assert.deepEqual(s.attacks()[0].position, s.center); s.actor.dispose();
  });
}
for (const character of ['goblin', 'archer']) test(`${character} autonomous player attack also centers`, () => {
  const s = setup(character, { autonomous: true }); s.tick();
  assert.equal(s.attacks().length, 0);
  for (let i = 0; i < 100 && !s.attacks().length; i++) s.tick();
  assert.equal(s.attacks().length, 1); assert.deepEqual(s.attacks()[0].position, s.center); s.actor.dispose();
});

test('archer centers once, captures latest aim, and releases one arrow', () => {
  const s = setup('archer'); s.tick();
  s.player.position = { x: 300, y: 240 };
  for (let i = 0; i < 100 && !s.attacks().length; i++) s.tick();
  const aim = { ...s.player.position }; s.setPlayer(null);
  for (let i = 0; i < 50; i++) s.tick();
  assert.equal(s.attacks().length, 1); assert.equal(s.shots.length, 1);
  assert.deepEqual(s.shots[0][1], aim); s.actor.dispose();
});

test('archer rechecks range after the final centering movement', () => {
  const s = setup('archer', { initial: { x: 240, y: 224 }, autonomous: true });
  s.player.position = { x: 496, y: 224 }; s.player.cell = { x: 7, y: 3 };
  s.tick(.5);
  assert.deepEqual(s.actor.getPosition(), { x: 224, y: 224 });
  assert.equal(s.attacks().length, 0, 'centering moved the target outside ranged eligibility'); s.actor.dispose();
});
