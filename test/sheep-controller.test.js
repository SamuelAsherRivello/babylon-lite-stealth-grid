import test from "node:test";
import assert from "node:assert/strict";

import { SHEEP_MOVEMENT_COLLIDER, createSheep } from "../src/npc/sheep/sheep.js";
import { CharacterType, SheepState } from "../src/npc/sheep/sheep-state.js";

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
  cell: { x: 2, y: 3 },
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
  assert.deepEqual(sheep.getPosition(), { x: 288, y: 224 });
  assert.equal(api.spriteUpdates.at(-1).positionPx[1], 212);
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
  obstacles.push({ x: 256, y: 192, width: 64, height: 64 });
  sheep.update(1, [nearbyPlayer]);

  assert.equal(sheep.state, SheepState.IDLE);
  assert.deepEqual(sheep.getPosition(), { x: 224, y: 224 });
});

test("non-NPC dynamic colliders block fleeing while NPC colliders are ignored", () => {
  const playerBlocker = {
    type: "player",
    collider: { type: "circle", x: 288, y: 224, radius: 26 },
  };
  const npcBlocker = { ...playerBlocker, type: "npc" };

  const blocked = createTestSheep({ minimumFleeDistanceCells: 1, maximumFleeDistanceCells: 1 });
  blocked.sheep.update(0.016, [nearbyPlayer], [playerBlocker]);
  blocked.api.animations.at(-1).options.onEnd();
  assert.equal(blocked.sheep.state, SheepState.IDLE);

  const allowed = createTestSheep({ minimumFleeDistanceCells: 1, maximumFleeDistanceCells: 1 });
  allowed.sheep.update(0.016, [nearbyPlayer], [npcBlocker]);
  allowed.api.animations.at(-1).options.onEnd();
  assert.equal(allowed.sheep.state, SheepState.RUNNING);
});

test("disposing stops the active sheep animation", () => {
  const { api, sheep } = createTestSheep();
  sheep.dispose();
  assert.equal(api.stopped.length, 1);
});
