import {
  colliderOverlapsObstacle,
  createGridAlignedMovementController,
  moveWithCollisions,
  getCharacterCollider,
  isColliderWithinBounds,
} from "../../../gameplay/game-logic.js";
import { chebyshevDistance } from "./sheep-state.js";
import { getColliderCenter } from "../../character-spatial.js";

const CARDINAL_NEIGHBORS = Object.freeze([
  { x: 1, y: 0 }, { x: -1, y: 0 },
  { x: 0, y: 1 }, { x: 0, y: -1 },
]);

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
}

export function chooseInclusiveInteger(minimum, maximum, random = Math.random) {
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum > maximum) {
    throw new RangeError("Flee distance bounds must be ordered integers.");
  }
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

export function gridCellCenter(cell, tileSize) {
  return { x: (cell.x + 0.5) * tileSize, y: (cell.y + 0.5) * tileSize };
}

export function createGridWalkability({ bounds, character, grid, obstacles }) {
  const walkable = (cell, dynamicColliders = []) => {
    if (
      cell.x < 0 || cell.x >= grid.columns
      || cell.y < 0 || cell.y >= grid.rows
    ) {
      return false;
    }
    const desiredCenter = gridCellCenter(cell, grid.tileSizePx);
    const localCenter = getColliderCenter(getCharacterCollider(
      { x: 0, y: 0 },
      character.frame,
      character.pivot,
      character.collider,
    ));
    const position = {
      x: desiredCenter.x - localCenter.x,
      y: desiredCenter.y - localCenter.y,
    };
    const collider = getCharacterCollider(
      position,
      character.frame,
      character.pivot,
      character.collider,
    );
    const dynamicObstacles = dynamicColliders
      .map(({ collider: dynamicCollider }) => dynamicCollider);
    return isColliderWithinBounds(collider, bounds.width, bounds.height)
      && ![...obstacles, ...dynamicObstacles].some(
        (obstacle) => colliderOverlapsObstacle(collider, obstacle),
      );
  };
  // Use the same mover as execution, with small bounded steps so a thin obstacle
  // cannot disappear between two clear endpoints. Only the first edge starts
  // from the actor's actual (possibly off-center) position.
  walkable.canTraverse = (from, to, dynamicColliders = [], actualCenter = null, aligned = true) => {
    if (!walkable(to, dynamicColliders)) return false;
    const localCenter = getColliderCenter(getCharacterCollider({ x: 0, y: 0 }, character.frame, character.pivot, character.collider));
    const center = actualCenter ?? gridCellCenter(from, grid.tileSizePx);
    let position = { x: center.x - localCenter.x, y: center.y - localCenter.y };
    const target = gridCellCenter(to, grid.tileSizePx);
    const mover = createGridAlignedMovementController(character, grid.tileSizePx);
    const blockers = [...obstacles, ...dynamicColliders.map(({ collider }) => collider)];
    const limit = Math.ceil(grid.tileSizePx * 4);
    for (let i = 0; i < limit; i++) {
      const current = getColliderCenter(getCharacterCollider(position, character.frame, character.pivot, character.collider));
      const dx = target.x - current.x, dy = target.y - current.y;
      if (Math.hypot(dx, dy) <= 1) return true;
      const intent = Math.abs(dx) >= Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
      const step = Math.min(2, Math.max(Math.abs(dx), Math.abs(dy)));
      const next = aligned ? mover.move(position, intent, step, step / 120, bounds, blockers)
        : moveWithCollisions(position, intent, step, bounds, character, blockers);
      if (Math.hypot(next.x - position.x, next.y - position.y) < 1e-7) return false;
      position = next;
    }
    return false;
  };
  return walkable;
}

function reconstructRoute(nodes, destinationKey) {
  const route = [];
  let key = destinationKey;
  while (nodes.get(key).parent !== null) {
    route.push(nodes.get(key).cell);
    key = nodes.get(key).parent;
  }
  return route.reverse();
}

export function planFleeRoute({
  start,
  threat,
  minimumSteps,
  maximumSteps,
  isWalkable,
  random = Math.random,
}) {
  const desiredSteps = chooseInclusiveInteger(minimumSteps, maximumSteps, random);
  const startKey = cellKey(start);
  const nodes = new Map([[startKey, { cell: start, depth: 0, parent: null }]]);
  const queue = [startKey];

  while (queue.length > 0) {
    const key = queue.shift();
    const node = nodes.get(key);
    if (node.depth >= desiredSteps) {
      continue;
    }
    for (const offset of CARDINAL_NEIGHBORS) {
      const cell = { x: node.cell.x + offset.x, y: node.cell.y + offset.y };
      const neighborKey = cellKey(cell);
      if (nodes.has(neighborKey) || !isWalkable(cell) || isWalkable.canTraverse?.(node.cell, cell) === false) {
        continue;
      }
      nodes.set(neighborKey, { cell, depth: node.depth + 1, parent: key });
      queue.push(neighborKey);
    }
  }

  const startingDistance = chebyshevDistance(start, threat);
  for (let depth = desiredSteps; depth >= minimumSteps; depth -= 1) {
    const candidates = [...nodes.entries()].filter(([, node]) => (
      node.depth === depth
      && chebyshevDistance(node.cell, threat) > startingDistance
    ));
    if (candidates.length === 0) {
      continue;
    }
    const greatestDistance = Math.max(
      ...candidates.map(([, node]) => chebyshevDistance(node.cell, threat)),
    );
    const best = candidates.filter(([, node]) => (
      chebyshevDistance(node.cell, threat) === greatestDistance
    ));
    const farthest = best.reduce((selected, current) => {
      const selectedDistance = (selected[1].cell.x - threat.x) ** 2
        + (selected[1].cell.y - threat.y) ** 2;
      const currentDistance = (current[1].cell.x - threat.x) ** 2
        + (current[1].cell.y - threat.y) ** 2;
      return currentDistance > selectedDistance ? current : selected;
    });
    const selectedIndex = Math.min(Math.floor(random() * best.length), best.length - 1);
    if (best[selectedIndex][0] === farthest[0]) {
      return reconstructRoute(nodes, best[selectedIndex][0]);
    }
    return reconstructRoute(nodes, farthest[0]);
  }
  return [];
}

export function planSeparationRoute({
  start,
  partner,
  preferredDirection,
  isWalkable,
}) {
  const startingDistance = (start.x - partner.x) ** 2 + (start.y - partner.y) ** 2;
  const preferred = {
    x: start.x + preferredDirection.x,
    y: start.y + preferredDirection.y,
  };
  const candidates = [
    preferred,
    ...CARDINAL_NEIGHBORS.map((offset) => ({
      x: start.x + offset.x,
      y: start.y + offset.y,
    })).filter((cell) => cell.x !== preferred.x || cell.y !== preferred.y),
  ];
  const safe = candidates.filter((cell) => (
    isWalkable(cell)
    && isWalkable.canTraverse?.(start, cell) !== false
    && (cell.x - partner.x) ** 2 + (cell.y - partner.y) ** 2 > startingDistance
  ));
  return safe.length > 0 ? [safe[0]] : [];
}
