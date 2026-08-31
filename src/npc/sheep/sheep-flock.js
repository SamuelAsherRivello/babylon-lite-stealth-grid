const EPSILON = 1e-7;

export function getOrderedPair(firstId, secondId) {
  return String(firstId).localeCompare(String(secondId)) <= 0
    ? [firstId, secondId]
    : [secondId, firstId];
}

function pairKey(firstId, secondId) {
  return getOrderedPair(firstId, secondId).map(String).join("\u0000");
}

function circleAt(snapshot, position = snapshot.position) {
  const collider = snapshot.collider;
  const offsetX = collider.x - snapshot.position.x;
  const offsetY = collider.y - snapshot.position.y;
  return { x: position.x + offsetX, y: position.y + offsetY, radius: collider.radius };
}

function circlesTouch(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y)
    <= first.radius + second.radius + EPSILON;
}

function pointSegmentDistance(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared <= EPSILON) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }
  const t = Math.max(0, Math.min(1, (
    (point.x - start.x) * dx + (point.y - start.y) * dy
  ) / lengthSquared));
  return Math.hypot(point.x - (start.x + dx * t), point.y - (start.y + dy * t));
}

export function movementsConflict(first, second) {
  const firstStart = circleAt(first);
  const secondStart = circleAt(second);
  const firstEnd = circleAt(first, first.requestedPosition ?? first.position);
  const secondEnd = circleAt(second, second.requestedPosition ?? second.position);
  const combinedRadius = firstStart.radius + secondStart.radius;
  if (circlesTouch(firstStart, secondStart) || circlesTouch(firstEnd, secondEnd)) {
    return true;
  }
  const relativeStart = { x: firstStart.x - secondStart.x, y: firstStart.y - secondStart.y };
  const relativeEnd = { x: firstEnd.x - secondEnd.x, y: firstEnd.y - secondEnd.y };
  return pointSegmentDistance({ x: 0, y: 0 }, relativeStart, relativeEnd)
    <= combinedRadius + EPSILON;
}

function fallbackAxis(pair) {
  const value = pair.map(String).join("|");
  let hash = 0;
  for (const character of value) {
    hash = ((hash * 31) + character.charCodeAt(0)) >>> 0;
  }
  return hash % 2 === 0 ? { x: 1, y: 0 } : { x: 0, y: 1 };
}

export function getPairSeparationDirections(first, second) {
  const pair = getOrderedPair(first.id, second.id);
  const byId = new Map([[first.id, first], [second.id, second]]);
  const low = byId.get(pair[0]);
  const high = byId.get(pair[1]);
  const dx = high.collider.x - low.collider.x;
  const dy = high.collider.y - low.collider.y;
  let towardHigh;
  if (Math.abs(dx) <= EPSILON && Math.abs(dy) <= EPSILON) {
    towardHigh = fallbackAxis(pair);
  } else if (Math.abs(dx) >= Math.abs(dy)) {
    towardHigh = { x: dx < 0 ? -1 : 1, y: 0 };
  } else {
    towardHigh = { x: 0, y: dy < 0 ? -1 : 1 };
  }
  return {
    [pair[0]]: {
      x: towardHigh.x === 0 ? 0 : -towardHigh.x,
      y: towardHigh.y === 0 ? 0 : -towardHigh.y,
    },
    [pair[1]]: towardHigh,
  };
}

export function createSheepContactCoordinator() {
  let activePairs = new Set();
  return {
    update(snapshots) {
      const living = snapshots
        .filter(({ isAlive, collider }) => isAlive && collider)
        .sort((a, b) => String(a.id).localeCompare(String(b.id)));
      const touchingPairs = new Set();
      const contacts = [];
      const intents = new Map();
      for (let firstIndex = 0; firstIndex < living.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < living.length; secondIndex += 1) {
          const first = living[firstIndex];
          const second = living[secondIndex];
          const key = pairKey(first.id, second.id);
          const contactInProgress = first.contactPartnerId === second.id
            || second.contactPartnerId === first.id;
          if (!movementsConflict(first, second) && !contactInProgress) {
            continue;
          }
          touchingPairs.add(key);
          if (activePairs.has(key) || contactInProgress) {
            continue;
          }
          const pair = getOrderedPair(first.id, second.id);
          const directions = getPairSeparationDirections(first, second);
          contacts.push({ pair, directions });
          if (!intents.has(first.id)) {
            intents.set(first.id, { partnerId: second.id, direction: directions[first.id] });
          }
          if (!intents.has(second.id)) {
            intents.set(second.id, { partnerId: first.id, direction: directions[second.id] });
          }
        }
      }
      activePairs = touchingPairs;
      return { contacts, intents };
    },
  };
}
