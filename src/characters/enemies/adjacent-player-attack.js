import { requestPlayerAttack } from './player-attack-preparation.js';
import { canEnemyTargetPlayer } from '../../systems/perception/player-hidden.js';
const COMBAT_CHARACTERS = new Set(['goblin', 'warrior', 'lancer', 'archer']);

// Returns ownership of this update, so recovery cannot tick again in navigation.
export function updateAdjacentPlayerAttack({ character, actor, controller, player, getPlayer = () => player, grid, delta }) {
  if (!COMBAT_CHARACTERS.has(character) || !player?.isAlive || !canEnemyTargetPlayer(player) || !player.cell || delta <= 0) return null;
  const cell = actor.getGridPosition(grid.tileSizePx);
  const direction = { x: player.cell.x - cell.x, y: player.cell.y - cell.y };
  if (Math.abs(direction.x) + Math.abs(direction.y) !== 1) return null;
  const eligible = target => {
    const own = actor.getGridPosition(grid.tileSizePx);
    return target.cell && Math.abs(target.cell.x - own.x) + Math.abs(target.cell.y - own.y) === 1;
  };
  if (character === 'goblin') return controller.updateAdjacentPlayerAttack(delta, player, direction, { getTarget: getPlayer, eligible });
  return requestPlayerAttack(actor, { grid, getTarget: getPlayer, eligible,
    commit: (target, heading) => character === 'archer' ? actor.shootAt(target.position) : actor.attack('attack-1', heading) });
}
