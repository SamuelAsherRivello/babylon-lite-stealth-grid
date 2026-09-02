import { createMovementRecovery, CARDINAL_STEPS, cellCenter, cardinalIntent, chooseRoute } from '../movement-recovery.js';
import { getColliderCenter, getCharacterGridCell } from '../character-spatial.js';

function randomDuration(range, random) {
  const [minimum, maximum] = range;
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || minimum < 0 || maximum < minimum) throw new RangeError('Invalid duration range');
  return minimum + (maximum - minimum) * Math.max(0, Math.min(1, random()));
}
export function createEnemyPatrolController(actor, {
  random = Math.random, idleRange = [3, 5], patrolRange = [2, 5],
  directions = CARDINAL_STEPS, isDirectionWalkable = () => true, tileSize = 64, retrySeconds = 3,
} = {}) {
  const recovery = createMovementRecovery({ retrySeconds });
  let mode = 'idle', remaining = randomDuration(idleRange, random), direction = null, targetCell = null;
  let intent = { x: 0, y: 0 };
  const position = () => actor.getMovementCollider ? getColliderCenter(actor.getMovementCollider()) : actor.getPosition();
  const currentCell = () => actor.getMovementCollider ? getCharacterGridCell(actor.getMovementCollider(), tileSize)
    : { x: Math.floor(position().x / tileSize), y: Math.floor(position().y / tileSize) };
  const move = value => { intent = value; actor.setMovementIntent(value); };
  function idle() { mode = 'idle'; remaining = randomDuration(idleRange, random); targetCell = null; move({ x: 0, y: 0 }); recovery.cancel(); }
  function select(reason = null, failed = null) {
    if (reason) recovery.fail(reason);
    move({ x: 0, y: 0 });
    const start = currentCell();
    const options = directions.map(step => ({ step, cell: { x: start.x + step.x, y: start.y + step.y } }))
      .filter(({ step, cell }) => (!failed || cell.x !== failed.x || cell.y !== failed.y)
        && isDirectionWalkable(step, position(), cell));
    const preferred = options.filter(({ step }) => !direction || step.x !== direction.x || step.y !== direction.y);
    const selected = chooseRoute(preferred.length ? preferred : options, random);
    if (!selected.cell) { mode = 'waiting'; targetCell = null; recovery.wait(); return; }
    direction = selected.step; targetCell = selected.cell;
    mode = 'patrolling'; remaining = randomDuration(patrolRange, random); recovery.accept();
    move(cardinalIntent(position(), cellCenter(targetCell, tileSize)));
  }
  move({ x: 0, y: 0 });
  return {
    get mode() { return mode; },
    cancel: idle,
    getNavigationSnapshot() { return { ...recovery.snapshot(), mode, position: position(), cell: currentCell(),
      intent: { ...intent }, waypoint: targetCell ? cellCenter(targetCell, tileSize) : null }; },
    update(deltaSeconds) {
      const delta = Math.max(0, deltaSeconds);
      if (actor.isMovementLocked?.()) { recovery.suspend(); return; }
      if (mode === 'waiting') { if (recovery.tickWait(delta)) select('retry'); return; }
      if (mode === 'idle') { remaining -= delta; if (remaining <= 0) select(); return; }
      if (delta <= 0) { recovery.suspend(); return; }
      remaining -= delta;
      if (remaining <= 0) { idle(); return; }
      let target = cellCenter(targetCell, tileSize);
      if (Math.hypot(target.x - position().x, target.y - position().y) <= 3) {
        targetCell = { x: targetCell.x + direction.x, y: targetCell.y + direction.y };
        target = cellCenter(targetCell, tileSize); recovery.accept();
      }
      if (!isDirectionWalkable(direction, position(), targetCell)) { select('blocked-segment', targetCell); return; }
      if (recovery.observe(position(), target, delta)) { select('no-progress', targetCell); return; }
      move(cardinalIntent(position(), target));
    },
  };
}
