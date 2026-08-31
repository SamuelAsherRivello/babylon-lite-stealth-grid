import {
  colliderOverlapsObstacle,
  getCharacterCollider,
  isColliderWithinBounds,
} from "../../game-logic.js";
import { chebyshevDistance } from "./sheep-state.js";

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
  return (cell, dynamicColliders = []) => {
    if (
      cell.x < 0 || cell.x >= grid.columns
      || cell.y < 0 || cell.y >= grid.rows
    ) {
      return false;
    }
    const position = gridCellCenter(cell, grid.tileSizePx);
    const collider = getCharacterCollider(
      position,
      character.frame,
      character.pivot,
      character.collider,
    );
    const dynamicObstacles = dynamicColliders
      .filter(({ type }) => type !== "npc")
      .map(({ collider: dynamicCollider }) => dynamicCollider);
    return isColliderWithinBounds(collider, bounds.width, bounds.height)
      && ![...obstacles, ...dynamicObstacles].some(
        (obstacle) => colliderOverlapsObstacle(collider, obstacle),
      );
  };
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
      if (nodes.has(neighborKey) || !isWalkable(cell)) {
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
