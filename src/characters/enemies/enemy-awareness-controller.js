import { createEnemyPerceptionReaction } from '../../systems/perception/enemy-perception-reaction.js';
import { createMovementRecovery, reachableRoutes, cardinalIntent, cellCenter, cellKey } from '../movement-recovery.js';
import { getCharacterGridCell, getColliderCenter } from '../character-spatial.js';
import { updateAdjacentPlayerAttack } from './adjacent-player-attack.js';
import { hasPlayerAttackPreparation, cancelPlayerAttackPreparation } from './player-attack-preparation.js';
import { canEnemyTargetPlayer } from '../../systems/perception/player-hidden.js';

/** Owns only locomotion; actor updates still own animation, combat and collision. */
export function createEnemyAwarenessController({ actor, controller, grid, isWalkable,
  character, getPlayer = () => null,
  isAlive = () => true, onStateChange = () => {}, profile, random, retrySeconds = 3 }) {
  const recovery = createMovementRecovery({ retrySeconds });
  let state = 'NONE', interrupt = false, target = null, route = [], face = null, disposed = false;
  const position = () => getColliderCenter(actor.getMovementCollider());
  const cell = () => getCharacterGridCell(actor.getMovementCollider(), grid.tileSizePx);
  const stop = () => actor.setMovementIntent({ x: 0, y: 0 });
  const cancelNormal = () => (controller.cancelNavigation ?? controller.cancel)?.call(controller);
  function clear() { target = null; face = null; route = []; recovery.cancel(); stop(); }
  function queueTarget(next) {
    if (target && cellKey(target) === cellKey(next)) return;
    target = { ...next }; face = null; route = []; recovery.cancel();
  }
  const reaction = createEnemyPerceptionReaction({ profile, random,
    onStop() { cancelNormal(); clear(); interrupt = true; },
    onStateChange(next, previous) {
      state = next;
      if (next === 'NONE') { cancelNormal(); clear(); interrupt = false; }
      onStateChange(next, previous);
    },
    onMoveTo: queueTarget,
    onFace(next, directionIndex) {
      face = { cell: { ...next }, directionIndex };
      target = null; route = []; recovery.cancel(); stop();
    },
  });
  const getAttackTarget = () => {
    const player = getPlayer();
    return player ? { ...player, targetable: canEnemyTargetPlayer(player, reaction) } : null;
  };
  function plan() {
    const start = cell();
    const distance = value => Math.abs(value.x - target.x) + Math.abs(value.y - target.y);
    // A target occupied by the player is not traversable. Stop at the nearest
    // safe reachable spot instead of attempting to walk through the player.
    const candidates = reachableRoutes(start, grid, isWalkable)
      .filter(candidate => distance(candidate.at(-1)) < distance(start))
      .sort((a, b) => distance(a.at(-1)) - distance(b.at(-1)) || a.length - b.length);
    route = candidates[0] ?? [];
    if (route.length) recovery.accept();
    else { stop(); recovery.wait(); }
  }
  return {
    reaction,
    getNavigationSnapshot() {
      return { ...recovery.snapshot(), state, interruptPending: interrupt, target: target && { ...target },
        waypoint: route[0] ? cellCenter(route[0], grid.tileSizePx) : null };
    },
    dispose() { disposed = true; interrupt = false; cancelPlayerAttackPreparation(actor); cancelNormal(); clear(); reaction.reset(); },
    update(delta) {
      if (disposed || !isAlive()) { interrupt = false; cancelPlayerAttackPreparation(actor); cancelNormal(); clear(); return; }
      if (delta <= 0) return;
      const player = getPlayer();
      if (player?.isAlive !== false && player?.hidden && player.cell) reaction.trackHiddenPlayer(player.cell);
      if (actor.isMovementLocked?.()) { cancelPlayerAttackPreparation(actor); stop(); recovery.suspend(); return; }
      if (hasPlayerAttackPreparation(actor)) { recovery.suspend(); return; }
      const combat = updateAdjacentPlayerAttack({ character, actor, controller, player: getAttackTarget(), getPlayer: getAttackTarget, grid, delta });
      if (combat) {
        if (combat === 'attacking' || combat === 'preparing') {
          cancelNormal(); route = []; recovery.cancel();
        }
        if (combat !== 'preparing') stop();
        recovery.suspend(); return;
      }
      if (state === 'NONE') { controller.update(delta); return; }
      if (interrupt) { stop(); interrupt = false; return; }
      // Goblin's existing melee policy is independent of navigation ownership.
      if (controller.updateCombat?.(delta)) { stop(); recovery.suspend(); return; }
      if (face) {
        const direction = face.directionIndex === undefined
          ? cardinalIntent(position(), cellCenter(face.cell, grid.tileSizePx))
          : [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }][face.directionIndex];
        actor.faceDirection?.(direction);
        stop(); return;
      }
      if (!target) { stop(); return; }
      if (recovery.snapshot().recoveryState === 'waiting' && !recovery.tickWait(delta)) { stop(); return; }
      while (route.length && Math.hypot(position().x - cellCenter(route[0], grid.tileSizePx).x,
        position().y - cellCenter(route[0], grid.tileSizePx).y) <= 3) { route.shift(); recovery.accept(); }
      if (!route.length) plan();
      if (!route.length) return;
      const waypoint = cellCenter(route[0], grid.tileSizePx);
      if (!isWalkable(route[0]) || isWalkable.canTraverse?.(cell(), route[0]) === false
        || recovery.observe(position(), waypoint, delta)) {
        stop(); route = []; recovery.fail('blocked-or-stalled'); recovery.wait(); return;
      }
      actor.setMovementIntent(cardinalIntent(position(), waypoint));
    },
  };
}
