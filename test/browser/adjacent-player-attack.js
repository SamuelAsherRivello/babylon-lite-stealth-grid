import { createEngine, createSpriteRenderer, registerSpriteRenderer, startEngine,
  createSpriteAnimationManager, updateSpriteAnimationManager, createSprite2DLayer, addSprite2D } from '@babylonjs/lite';
import { createGoblin, loadGoblinAtlases } from '../../src/characters/enemies/goblin/goblin.js';
import { createWarrior, loadWarriorAtlases } from '../../src/characters/enemies/warrior/warrior.js';
import { createLancer, loadLancerAtlases } from '../../src/characters/enemies/lancer/lancer.js';
import { createArcher, loadArcherAtlases } from '../../src/characters/enemies/archer/archer.js';
import { createMonk, loadMonkAtlases } from '../../src/characters/enemies/monk/monk.js';
import { loadPlayerAtlases, PLAYER_PIVOT, PLAYER_FRAME, PLAYER_ART_OFFSET } from '../../src/characters/player/player.js';
import { GridSpot } from '../../src/systems/environment/grid-spot.js';
import { createEnemyAwarenessController } from '../../src/characters/enemies/enemy-awareness-controller.js';
import { createEnemyPatrolController } from '../../src/characters/enemies/enemy-patrol-controller.js';
import { createGoblinBehaviorController } from '../../src/characters/enemies/goblin/goblin-behavior-controller.js';
import { loadArrowAtlas, createProjectileRenderer } from '../../src/systems/objects/projectile-renderer.js';

const params = new URLSearchParams(location.search);
const offset = { x: Number(params.get('dx') ?? 1), y: Number(params.get('dy') ?? 0) };
const duration = Number(params.get('duration') ?? 4);
const startOffset = { x: Number(params.get('startX') ?? 0), y: Number(params.get('startY') ?? 0) };
const canvas = document.querySelector('canvas'), output = document.querySelector('#result');
const bounds = { width: 960, height: 1024 }, grid = { tileSizePx: 64, columns: 15, rows: 16 };
const types = ['goblin', 'warrior', 'lancer', 'archer', 'monk'];
const states = ['NONE', 'SUSPICIOUS', 'INVESTIGATING', 'ALERT'];
const factories = [createGoblin, createWarrior, createLancer, createArcher, createMonk];
const engine = await createEngine(canvas, { maxDevicePixelRatio: 1 });
engine._w = bounds.width; engine._h = bounds.height;
const manager = createSpriteAnimationManager();
const atlases = await Promise.all([loadGoblinAtlases, loadWarriorAtlases, loadLancerAtlases, loadArcherAtlases, loadMonkAtlases, loadPlayerAtlases, loadArrowAtlas].map(load => load(engine)));
const arrows = createProjectileRenderer({ atlas: atlases[6], bounds, obstacles: [] });
const records = [];
for (const [row, state] of states.entries()) for (const [column, character] of types.entries()) {
  const origin = { x: 96 + 192 * column, y: 864 - row * 256 };
  const playerPosition = { x: origin.x + offset.x * 64, y: origin.y + offset.y * 64 };
  const playerSpot = new GridSpot(playerPosition, grid);
  const playerLayer = createSprite2DLayer(atlases[5].idle, { capacity: 1, order: 1, pivot: [PLAYER_PIVOT.x, PLAYER_PIVOT.y] });
  addSprite2D(playerLayer, { positionPx: [playerPosition.x + PLAYER_ART_OFFSET.x, bounds.height - playerPosition.y - PLAYER_ART_OFFSET.y],
    sizePx: [PLAYER_FRAME.width, PLAYER_FRAME.height], frame: 0 });
  const player = { layers: [playerLayer], getPosition: () => ({ ...playerPosition }), getGridPosition: () => playerSpot.cell };
  const initial = { x: origin.x + startOffset.x, y: origin.y + startOffset.y };
  const record = { character, awarenessState: state, origin, starts: 0, shots: 0, heals: 0, movedDuringAttack: false, firstAttack: false, attackCenters: [], aimCenters: [] };
  const actor = factories[column]({ atlases: atlases[column], initialPosition: initial, bounds, obstacles: [],
    onHeal: () => record.heals++, onShoot: (position, target, options) => {
      record.shots++;
      arrows.shoot(position, options.initialVelocityDirection, character, { target, speedMultiplier: 0.5, collisionEnabled: false, rotationEnabled: true, ...options });
    } });
  actor.playAnimation(manager);
  const face = actor.faceDirection.bind(actor);
  actor.faceDirection = direction => { record.aimCenters.push(actor.getPosition()); return face(direction); };
  const controller = character === 'goblin'
    ? createGoblinBehaviorController(actor, { grid, spawnCell: actor.getGridPosition(64), isWalkable: () => true, getWorld: () => ({ characters: [], bushes: [] }), random: () => 0, idleRange: [0, 0], bushChance: 0 })
    : createEnemyPatrolController(actor, { random: () => 0, idleRange: [0, 0] });
  const awareness = createEnemyAwarenessController({ character, actor, controller, grid, isWalkable: () => true,
    getPlayer: () => ({ id: 'player', isAlive: true, position: player.getPosition(), cell: player.getGridPosition(64) }) });
  awareness.reaction.forceState(state);
  Object.assign(record, { actor, player, awareness }); records.push(record);
}
registerSpriteRenderer(createSpriteRenderer(engine, { layers: [...records.flatMap(r => [...r.actor.layers, ...r.player.layers]), arrows.layer], clearValue: { r: .15, g: .3, b: .17, a: 1 } }));
await startEngine(engine);
document.querySelector('#description').textContent = `Player offset ${offset.x},${offset.y}; enemy starts ${startOffset.x},${startOffset.y}px from center. Rows: NONE, SUSPICIOUS, INVESTIGATING, ALERT. Stops after ${duration}s.`;
let elapsed = 0, previous = performance.now();
const attacking = actor => /attack|shooting/.test(actor.state);
function frame(now) {
  const delta = Math.max(0, Math.min((now - previous) / 1000, .04)); previous = now;
  if (delta === 0) { requestAnimationFrame(frame); return; }
  for (const r of records) {
    const before = r.actor.getPosition(), wasAttacking = attacking(r.actor);
    r.awareness.update(delta);
    r.actor.update(delta, [], [], null);
    if (!wasAttacking && attacking(r.actor)) { r.starts++; r.attackCenters.push(r.actor.getPosition()); }
    if (elapsed === 0) r.firstAttack = attacking(r.actor);
    if (wasAttacking && JSON.stringify(before) !== JSON.stringify(r.actor.getPosition())) r.movedDuringAttack = true;
  }
  updateSpriteAnimationManager(manager, delta * 1000);
  arrows.update(delta);
  elapsed += delta;
  const rows = records.map(r => ({ character: r.character, awareness: r.awareness.reaction.getSnapshot().state,
    state: r.actor.state, starts: r.starts, shots: r.shots, heals: r.heals, firstAttack: r.firstAttack,
    movedDuringAttack: r.movedDuringAttack, visibleLayers: r.actor.layers.filter(l => l.visible).length,
    position: r.actor.getPosition(), center: r.origin, attackCenters: r.attackCenters, aimCenters: r.aimCenters,
    moved: JSON.stringify(r.actor.getPosition()) !== JSON.stringify(r.origin) }));
  const result = { complete: elapsed >= duration, offset, elapsed, rows };
  output.textContent = JSON.stringify(result, null, 2); output.dataset.result = JSON.stringify(result);
  if (elapsed < duration) requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
