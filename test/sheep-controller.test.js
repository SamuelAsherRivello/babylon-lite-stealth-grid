import test from "node:test";
import assert from "node:assert/strict";

import { SHEEP_MOVEMENT_COLLIDER, createSheep } from "../src/characters/npc/sheep/sheep.js";
import { CharacterType, SheepState } from "../src/characters/npc/sheep/sheep-state.js";

function createApi() {
  const animations = [];
  const spriteUpdates = [];
  const stopped = [];
  return {
    animations,
    spriteUpdates,
    stopped,
    createSprite2DLayer() { return { visible: true, view: { zoom: 1 } }; },
    addSprite2D() { return {}; },
    playSprite2DAnimation(...args) {
      const handle = { current: 0, options: args[6] };
      animations.push(handle);
      return handle;
    },
    stopSpriteAnimation(handle) { stopped.push(handle); },
    updateSprite2D(sprite, update) { spriteUpdates.push(update); },
  };
}

function createTestSheep(overrides = {}) {
  const api = overrides.api ?? createApi();
  const sheep = createSheep({
    atlases: { idle: {}, bouncing: {} },
    initialPosition: { x: 224, y: 224 },
    bounds: { width: 448, height: 448 },
    obstacles: [],
    grid: { tileSizePx: 64, columns: 7, rows: 7 },
    movementSpeed: 256,
    random: () => 0,
    api,
    ...overrides,
  });
  sheep.playAnimation({});
  return { api, sheep };
}

const nearbyPlayer = {
  type: CharacterType.PLAYER,
  cell: { x: 2, y: 4 },
};

test("sheep exposes and validates its AI configuration", () => {
  const { sheep } = createTestSheep();
  assert.deepEqual(sheep.config, {
    scareDistanceCells: 3,
    frighteningTypes: [CharacterType.PLAYER],
    minimumFleeDistanceCells: 1,
    maximumFleeDistanceCells: 3,
    movementSpeed: 256,
  });
  assert.throws(() => createTestSheep({ minimumFleeDistanceCells: 4, maximumFleeDistanceCells: 3 }));
  assert.throws(() => createTestSheep({ movementSpeed: 0 }));
  assert.throws(() => createTestSheep({ frighteningTypes: ["dragon"] }));
});

test("sheep retains its own typed NPC circle collider size", () => {
  const { sheep } = createTestSheep();
  assert.equal(SHEEP_MOVEMENT_COLLIDER.radius, 26);
  const collider = sheep.getMovementCollider();
  assert.equal(collider.type, "circle");
  assert.equal(collider.x, 224);
  assert.ok(Math.abs(collider.y - 270.52) < 1e-10);
  assert.equal(collider.radius, 26);
});

test("sheep remains stationary through the complete bounce before running", () => {
  const { api, sheep } = createTestSheep();
  const start = sheep.getPosition();

  sheep.update(0.5, [nearbyPlayer]);
  assert.equal(sheep.state, SheepState.BOUNCING);
  assert.deepEqual(sheep.getPosition(), start);
  const bounce = api.animations.at(-1);
  assert.equal(typeof bounce.options.onEnd, "function");
  bounce.options.onEnd();
  assert.equal(sheep.state, SheepState.RUNNING);
  assert.deepEqual(sheep.getPosition(), start);
});

test("sheep moves without overshoot, faces travel, and returns idle on a cell center", () => {
  const { api, sheep } = createTestSheep({
    minimumFleeDistanceCells: 1,
    maximumFleeDistanceCells: 1,
  });
  sheep.update(0.016, [nearbyPlayer]);
  api.animations.at(-1).options.onEnd();
  sheep.update(1, [nearbyPlayer]);

  assert.equal(sheep.state, SheepState.IDLE);
  assert.deepEqual(sheep.getPosition(), { x: 288, y: 241.48000000000002 });
  assert.equal(api.spriteUpdates.at(-1).positionPx[1], 194.51999999999998);
  assert.equal(api.spriteUpdates.at(-1).flipX, false);
});

test("sheep stops safely if a planned segment becomes blocked", () => {
  const obstacles = [];
  const { api, sheep } = createTestSheep({
    obstacles,
    minimumFleeDistanceCells: 1,
    maximumFleeDistanceCells: 1,
  });
  sheep.update(0.016, [nearbyPlayer]);
  api.animations.at(-1).options.onEnd();
  obstacles.push({ x: 256, y: 256, width: 64, height: 64 });
  sheep.update(1, [nearbyPlayer]);
  sheep.update(1, [nearbyPlayer]);

  assert.equal(sheep.state, SheepState.IDLE);
  assert.deepEqual(sheep.getPosition(), { x: 224, y: 241.48000000000002 });
});

test("player and NPC dynamic colliders both block fleeing", () => {
  const playerBlocker = {
    type: "player",
    collider: { type: "circle", x: 288, y: 270.52, radius: 26 },
  };
  const npcBlocker = { ...playerBlocker, type: "npc" };

  const blocked = createTestSheep({ minimumFleeDistanceCells: 1, maximumFleeDistanceCells: 1 });
  blocked.sheep.update(0.016, [nearbyPlayer], [playerBlocker]);
  blocked.api.animations.at(-1).options.onEnd();
  assert.equal(blocked.sheep.state, SheepState.IDLE);

  const npcBlocked = createTestSheep({ minimumFleeDistanceCells: 1, maximumFleeDistanceCells: 1 });
  npcBlocked.sheep.update(0.016, [nearbyPlayer], [npcBlocker]);
  npcBlocked.api.animations.at(-1).options.onEnd();
  assert.equal(npcBlocked.sheep.state, SheepState.IDLE);
});

test("disposing stops the active sheep animation", () => {
  const { api, sheep } = createTestSheep();
  sheep.dispose();
  assert.equal(api.stopped.length, 1);
});

test("contact command cancels running, bounces stationary, then separates", () => {
  const { api, sheep } = createTestSheep({
    minimumFleeDistanceCells: 1,
    maximumFleeDistanceCells: 1,
  });
  sheep.update(0.016, [nearbyPlayer]);
  api.animations.at(-1).options.onEnd();
  assert.equal(sheep.state, SheepState.RUNNING);

  const contactPosition = sheep.getPosition();
  sheep.beginContact({
    partnerId: "sheep-2",
    partnerCell: { x: 4, y: 3 },
    direction: { x: -1, y: 0 },
  });
  assert.equal(sheep.state, SheepState.BOUNCING);
  sheep.update(0.25, [nearbyPlayer]);
  assert.deepEqual(sheep.getPosition(), contactPosition);
  api.animations.at(-1).options.onEnd();
  assert.equal(sheep.state, SheepState.RUNNING);
  sheep.update(1, [], []);
  assert.deepEqual(sheep.getPosition(), { x: 160, y: 241.48000000000002 });
});

test("coincident contact partners can move apart without ignoring other sheep", () => {
  const { api, sheep } = createTestSheep();
  const coincidentPartner = {
    type: "npc",
    id: "sheep-2",
    collider: sheep.getMovementCollider(),
  };
  sheep.beginContact({
    partnerId: "sheep-2",
    partnerCell: sheep.getGridCell(),
    direction: { x: -1, y: 0 },
  });
  sheep.update(0, [], [coincidentPartner]);
  api.animations.at(-1).options.onEnd();
  assert.equal(sheep.state, SheepState.RUNNING);
  sheep.update(1, [], [coincidentPartner]);
  assert.deepEqual(sheep.getPosition(), { x: 160, y: 241.48000000000002 });
});

test("knockback cannot move through another living sheep", () => {
  const { sheep } = createTestSheep();
  const blocker = {
    type: "npc",
    id: "sheep-2",
    collider: { type: "circle", x: 276, y: 270.52, radius: 26 },
  };
  sheep.applyKnockback({ x: 1, y: 0 }, { duration: 1, speed: 100 });
  sheep.update(1, [], [blocker]);
  assert.deepEqual(sheep.getPosition(), { x: 224, y: 224 });
});
