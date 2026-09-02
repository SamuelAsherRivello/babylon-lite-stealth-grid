import { createGoblin } from '../../src/characters/enemies/goblin/goblin.js';
import { createWarrior } from '../../src/characters/enemies/warrior/warrior.js';
import { createLancer } from '../../src/characters/enemies/lancer/lancer.js';
import { createArcher } from '../../src/characters/enemies/archer/archer.js';
import { createMonk } from '../../src/characters/enemies/monk/monk.js';
import { createSheep } from '../../src/characters/npc/sheep/sheep.js';
import { createEnemyPatrolController } from '../../src/characters/enemies/enemy-patrol-controller.js';
import { createGoblinBehaviorController } from '../../src/characters/enemies/goblin/goblin-behavior-controller.js';
import { createGridWalkability } from '../../src/characters/npc/sheep/sheep-navigation.js';
import { getCharacterGridCell, getColliderCenter } from '../../src/characters/character-spatial.js';

const grid = { columns: 9, rows: 16, tileSizePx: 64 };
const bounds = { width: 576, height: 1024 };
// Production actors/movement/controllers with only the drawing API replaced.
function drawingApi() {
  let onEnd = null;
  return { createSprite2DLayer: () => ({}), addSprite2D: () => ({}), updateSprite2D() {}, removeSprite2D() {}, stopSpriteAnimation() {},
    playSprite2DAnimation(...args) { onEnd = args[6]?.onEnd ?? null; return {}; },
    complete() { const end = onEnd; onEnd = null; end?.(); } };
}
const factories = { goblin: createGoblin, warrior: createWarrior, lancer: createLancer, archer: createArcher, monk: createMonk, sheep: createSheep };
export function createRecoveryScenario(kind = 'goblin', enclosed = true) {
  const origin = kind === 'goblin' ? { x: 32, y: 800 } : { x: 32, y: 32 };
  const obstacles = enclosed ? [
    { x: 0, y: origin.y - 34, width: 64, height: 4 },
    { x: 0, y: origin.y + 30, width: 64, height: 4 },
    { x: 62, y: origin.y - 32, width: 4, height: 64 },
  ] : [{ x: 0, y: origin.y - 34, width: 64, height: 4 }];
  const api = drawingApi();
  const atlas = { frames: Array.from({ length: 20 }, () => ({ uvMin: [0, 0], uvMax: [1, 1], sourceSizePx: [192, 192] })) };
  const atlases = new Proxy({}, { get: () => atlas });
  const actor = factories[kind]({ atlases, initialPosition: origin, bounds, obstacles, grid, api, runtimeApi: api, random: () => 0 });
  const radius = actor.getMovementCollider().radius;
  const shape = { frame: { width: 0, height: 0 }, pivot: { x: 0, y: 0 }, collider: { type: 'circle', x: 0, y: 0, radius } };
  const terrain = createGridWalkability({ grid, bounds, character: shape, obstacles });
  const walkable = cell => terrain(cell);
  walkable.canTraverse = (from, to) => {
    const current = getCharacterGridCell(actor.getMovementCollider(), 64);
    return terrain.canTraverse(from, to, [], from.x === current.x && from.y === current.y ? getColliderCenter(actor.getMovementCollider()) : null);
  };
  let controller = null;
  if (kind === 'goblin') controller = createGoblinBehaviorController(actor, {
    grid, spawnCell: { x: 0, y: 12 }, isWalkable: walkable,
    getWorld: () => ({ characters: [], bushes: [] }), idleRange: [0, 0], random: () => 0, bushChance: 0,
  });
  else if (kind !== 'sheep') controller = createEnemyPatrolController(actor, {
    idleRange: [0, 0], patrolRange: [20, 20], random: () => 0,
    isDirectionWalkable: (_direction, _position, target) => walkable.canTraverse(getCharacterGridCell(actor.getMovementCollider(), 64), target),
  });
  if (kind === 'sheep') {
    actor.playAnimation({});
    actor.update(0.01, [{ type: 'player', cell: { x: 1, y: 0 } }]);
    api.complete();
  }
  let elapsed = 0, released = !enclosed;
  return {
    kind, actor, controller, obstacles, origin,
    update(delta) {
      elapsed += delta;
      if (!released && elapsed >= 7) { obstacles.pop(); released = true; }
      controller?.update(delta);
      actor.update(delta);
    },
    snapshot() { return { kind, elapsed, released, ...(controller ?? actor).getNavigationSnapshot() }; },
  };
}
