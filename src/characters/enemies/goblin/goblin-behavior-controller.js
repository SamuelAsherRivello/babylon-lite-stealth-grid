import { createMovementRecovery, reachableRoutes, chooseRoute, cardinalIntent } from "../../movement-recovery.js";
import { gridCellCenter } from "../../npc/sheep/sheep-navigation.js";
import { collidersOverlap } from "../../../gameplay/game-logic.js";
import { getCharacterGridCell, getColliderCenter } from "../../character-spatial.js";

const NEIGHBORS = Object.freeze([
  { x: 1, y: 0 }, { x: -1, y: 0 },
  { x: 0, y: 1 }, { x: 0, y: -1 },
]);

const key = ({ x, y }) => `${x},${y}`;
const distance = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const cardinalDistance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export function canBurnBushFromCell(goblinCell, bushCell) {
  return cardinalDistance(goblinCell, bushCell) === 1;
}

export function isAlignedForBushBurn(
  _goblinPosition,
  _bushPosition,
  goblinCell,
  bushCell,
  _tileSize,
) {
  return canBurnBushFromCell(goblinCell, bushCell);
}

export function findRoute(start, goals, isWalkable, maximumDepth = Infinity) {
  const goalKeys = new Set(goals.map(key));
  const nodes = new Map([[key(start), { cell: start, parent: null, depth: 0 }]]);
  const queue = [key(start)];
  let found = null;
  while (queue.length > 0 && found === null) {
    const currentKey = queue.shift();
    const current = nodes.get(currentKey);
    if (goalKeys.has(currentKey)) { found = currentKey; break; }
    if (current.depth >= maximumDepth) continue;
    for (const offset of NEIGHBORS) {
      const cell = { x: current.cell.x + offset.x, y: current.cell.y + offset.y };
      const cellKey = key(cell);
      if (nodes.has(cellKey) || !isWalkable(cell) || isWalkable.canTraverse?.(current.cell, cell) === false) continue;
      nodes.set(cellKey, { cell, parent: currentKey, depth: current.depth + 1 });
      queue.push(cellKey);
    }
  }
  if (found === null) return [];
  const route = [];
  while (nodes.get(found).parent !== null) {
    route.push(nodes.get(found).cell);
    found = nodes.get(found).parent;
  }
  return route.reverse();
}

export function selectNearestReachableBush(start, bushes, isWalkable) {
  let selected = null;
  for (const bush of bushes.filter(({ isAlive }) => isAlive)) {
    const goals = NEIGHBORS.map((offset) => ({
      x: bush.cell.x + offset.x,
      y: bush.cell.y + offset.y,
    })).filter((cell) => isWalkable(cell));
    const route = findRoute(start, goals, isWalkable);
    if (goals.some((goal) => key(goal) === key(start))) route.unshift();
    const alreadyAdjacent = goals.some((goal) => key(goal) === key(start));
    if (!alreadyAdjacent && route.length === 0) continue;
    const candidate = { bush, route };
    if (!selected || route.length < selected.route.length) selected = candidate;
  }
  return selected;
}

export function createGoblinFireHitCollider(body, direction, reach = 64) {
  if (Math.abs(direction.x) >= Math.abs(direction.y)) {
    return {
      x: direction.x >= 0 ? body.x + body.width : body.x - reach,
      y: body.y,
      width: reach,
      height: body.height,
    };
  }
  return {
    x: body.x,
    y: direction.y >= 0 ? body.y + body.height : body.y - reach,
    width: body.width,
    height: reach,
  };
}

export function createGoblinBehaviorController(goblin, {
  grid,
  spawnCell,
  isWalkable,
  getWorld,
  random = Math.random,
  idleRange = [3, 5],
  patrolRange = [2, 5],
  homeRadius = 4,
  meleeDistance = 1,
  recoverySeconds = 1.25,
  bushChance = 0.25,
  prioritizeBushes = false,
  retrySeconds = 3,
} = {}) {
  const recovery = createMovementRecovery({ retrySeconds });
  let intent = { x: 0, y: 0 };
  let mode = "idle";
  let idleRemaining = idleRange[0] + (idleRange[1] - idleRange[0]) * random();
  let recoveryRemaining = 0;
  let route = [];
  let bushTargetId = null;
  let characterTargetId = null;

  function move(value) { intent = value; goblin.setMovementIntent(value); }
  function stop() { move({ x: 0, y: 0 }); }
  function currentCell() {
    return getCharacterGridCell(goblin.getMovementCollider(), grid.tileSizePx);
  }
  function canStartBushAttack(target) {
    const position = getColliderCenter(goblin.getMovementCollider());
    return isAlignedForBushBurn(
      position,
      target.position,
      currentCell(),
      target.cell,
      grid.tileSizePx,
    );
  }
  function startAttack(target, type) {
    if (type === "bush" && !canStartBushAttack(target)) {
      stop();
      return false;
    }
    const from = goblin.getPosition();
    const direction = type === "bush"
      ? {
          x: target.cell.x - currentCell().x,
          y: target.cell.y - currentCell().y,
        }
      : { x: target.position.x - from.x, y: target.position.y - from.y };
    stop();
    if (goblin.attack(direction)) {
      recovery.cancel();
      route = [];
      mode = "recovering";
      recoveryRemaining = recoverySeconds;
      if (type === "character") characterTargetId = target.id;
      if (
        type === "bush"
        && target.combatCollider
        && collidersOverlap(
          createGoblinFireHitCollider(goblin.getCombatCollider(), direction),
          target.combatCollider,
        )
      ) target.applyFireDamage(50);
      return true;
    }
    return false;
  }
  function nearbyCharacter(world) {
    const nearby = world.characters
      .filter(({ isAlive, cell }) => (
        isAlive && cardinalDistance(currentCell(), cell) <= meleeDistance
      ));
    if (
      characterTargetId !== null
      && !nearby.some(({ id }) => id === characterTargetId)
    ) characterTargetId = null;
    return nearby
      .filter(({ id }) => id !== characterTargetId)
      .sort((a, b) => (
        cardinalDistance(currentCell(), a.cell) - cardinalDistance(currentCell(), b.cell)
      ))[0] ?? null;
  }
  function beginBushDecision(world) {
    if (random() >= bushChance) return false;
    const target = selectNearestReachableBush(currentCell(), world.bushes, isWalkable);
    if (!target) return false;
    bushTargetId = target.bush.id;
    route = target.route;
    if (route.length === 0 && canStartBushAttack(target.bush)) {
      startAttack(target.bush, "bush");
    } else if (route.length === 0) {
      route = [currentCell()];
      mode = "walking-bush";
    }
    else mode = "walking-bush";
    return true;
  }
  function beginDecision() {
    const world = getWorld();
    if (prioritizeBushes && beginBushDecision(world)) return;
    const character = nearbyCharacter(world);
    if (character) { startAttack(character, "character"); return; }
    if (!prioritizeBushes && beginBushDecision(world)) return;
    const candidates = patrolCandidates();
    route = chooseRoute(candidates, random);
    recovery.accept();
    if (route.length > 0) mode = "walking";
    else recover("no-route");
  }
  function patrolCandidates(excluded = null) {
    return reachableRoutes(currentCell(), grid, isWalkable, patrolRange[1], excluded).filter(candidate => (
      candidate.length >= patrolRange[0]
      && distance(candidate.at(-1), spawnCell) <= homeRadius
    ));
  }
  function recover(reason, failed = route[0]) {
    stop();
    recovery.fail(reason);
    route = [];
    bushTargetId = null;
    const preferred = patrolCandidates(failed);
    route = chooseRoute(preferred.length ? preferred : reachableRoutes(currentCell(), grid, isWalkable, 1, failed), random);
    if (route.length) { mode = "walking"; recovery.accept(); }
    else { mode = "waiting"; recovery.wait(); }
  }
  function followRoute(delta) {
    const position = getColliderCenter(goblin.getMovementCollider());
    while (route.length && Math.hypot(gridCellCenter(route[0], grid.tileSizePx).x - position.x,
      gridCellCenter(route[0], grid.tileSizePx).y - position.y) <= 3) {
      route.shift(); recovery.accept();
    }
    if (!route.length) return false;
    const waypoint = gridCellCenter(route[0], grid.tileSizePx);
    if (!isWalkable(route[0]) || isWalkable.canTraverse?.(currentCell(), route[0]) === false) {
      recover("blocked-segment"); return true;
    }
    if (recovery.observe(position, waypoint, delta)) { recover("no-progress"); return true; }
    move(cardinalIntent(position, waypoint));
    return true;
  }


  stop();
  return {
    get mode() { return mode; },
    cancel() { stop(); route = []; recovery.cancel(); mode = "idle"; },
    getNavigationSnapshot() { return { ...recovery.snapshot(), mode, intent: { ...intent },
      position: getColliderCenter(goblin.getMovementCollider()), cell: currentCell(),
      waypoint: route[0] ? gridCellCenter(route[0], grid.tileSizePx) : null }; },
    update(deltaSeconds) {
      const delta = Math.max(0, deltaSeconds);
      if (goblin.isMovementLocked?.() || delta <= 0) { recovery.suspend(); return; }
      if (mode === "waiting") {
        const target = nearbyCharacter(getWorld());
        if (target && startAttack(target, "character")) return;
        if (recovery.tickWait(delta)) recover("retry", null);
        return;
      }
      if (mode === "recovering") {
        recoveryRemaining -= delta;
        if (recoveryRemaining > 0) return;
        mode = "idle";
        bushTargetId = null;
        beginDecision();
        return;
      }
      if (mode === "walking" || mode === "walking-bush") {
        if (mode === "walking-bush") {
          const target = getWorld().bushes.find(({ id, isAlive }) => id === bushTargetId && isAlive);
          if (!target) { route = []; bushTargetId = null; mode = "idle"; stop(); return; }
        }
        if (followRoute(delta)) return;
        stop();
        recovery.cancel();
        if (mode === "walking-bush") {
          const target = getWorld().bushes.find(({ id, isAlive }) => id === bushTargetId && isAlive);
          if (target && canStartBushAttack(target)) {
            startAttack(target, "bush");
          }
          else mode = "idle";
        } else {
          mode = "idle";
          idleRemaining = idleRange[0] + (idleRange[1] - idleRange[0]) * random();
        }
        return;
      }
      const character = nearbyCharacter(getWorld());
      if (character) { startAttack(character, "character"); return; }
      idleRemaining -= delta;
      if (idleRemaining <= 0) beginDecision();
    },
  };
}
