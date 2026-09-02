import test from "node:test";
import assert from "node:assert/strict";

test("collision movement applies distance once even when given a velocity vector", () => {
  const character = { frame: { width: 64, height: 64 }, pivot: { x: 0.5, y: 0.5 }, collider: { type: "circle", x: 32, y: 32, radius: 10 } };
  const result = moveWithCollisions({ x: 100, y: 100 }, { x: 100, y: 0 }, 10, { width: 500, height: 500 }, character, []);
  assert.deepEqual(result, { x: 110, y: 100 });
});

import {
  aabbOverlapsPolygon,
  aabbsOverlap,
  circleOverlapsPolygon,
  classifyCardinalMovement,
  collidersOverlap,
  createGridAlignmentSession,
  createTerrainReviewTiles,
  getCharacterCollider,
  getOtherCharacterGridOccupancyColliders,
  getOtherCharacterColliders,
  formatPositionReadout,
  getLogicalViewportScale,
  gridCellToScreen,
  gridCellToScreenForFrame,
  getMovementVector,
  isAabbWithinBounds,
  moveWithCollisions,
  separateOverlappingCharacterColliders,
  moveWithinBounds,
  selectMovementInput,
  stepGridAlignment,
  worldToGrid,
  worldToScreen,
} from "../../src/gameplay/game-logic.js";
import { calculateJoystickInput } from "../../plugins/virtual-controller-babylon-lite/index.js";
import { GRID } from "../../src/systems/environment/grid-contract.js";
import {
  NON_WALKABLE_TERRAIN_FRAMES,
  PARTIAL_TERRAIN_COLLIDERS,
} from "../../src/systems/environment/terrain-collision-config.js";

test("cardinal movement classification includes the 10 percent boundary", () => {
  assert.deepEqual(classifyCardinalMovement({ x: 0, y: 1 }), {
    axis: "y",
    direction: 1,
  });
  assert.deepEqual(classifyCardinalMovement({ x: -0.1, y: -1 }), {
    axis: "y",
    direction: -1,
  });
  assert.deepEqual(classifyCardinalMovement({ x: 0.5, y: 0.05 }), {
    axis: "x",
    direction: 1,
  });
});

test("cardinal movement classification rejects zero and intentional diagonals", () => {
  assert.equal(classifyCardinalMovement({ x: 0, y: 0 }), null);
  assert.equal(classifyCardinalMovement({ x: 0.10001, y: 1 }), null);
  assert.equal(classifyCardinalMovement({ x: -1, y: 0.11 }), null);
  assert.equal(classifyCardinalMovement({ x: 1, y: 1 }), null);
});

test("grid alignment targets the current cell center from the circle collider center", () => {
  const character = {
    frame: { width: 192, height: 192 },
    pivot: { x: 0.5, y: 0.78 },
    collider: { type: "circle", x: 93, y: 126, radius: 18.2 },
  };

  const vertical = createGridAlignmentSession(
    { x: 210, y: 300 },
    character,
    64,
    { axis: "y", direction: 1 },
  );
  const horizontal = createGridAlignmentSession(
    { x: 210, y: 300 },
    character,
    64,
    { axis: "x", direction: -1 },
  );

  assert.equal(vertical.correctionAxis, "x");
  assert.equal(vertical.target, 227);
  assert.equal(horizontal.correctionAxis, "y");
  assert.ok(Math.abs(horizontal.target - 328.24) < 1e-10);
});

test("grid alignment correction is frame-rate independent and clamps its last step", () => {
  const session = { correctionAxis: "x", target: 32, speed: 160 };

  assert.equal(stepGridAlignment(session, { x: 0, y: 10 }, 0.05), 8);
  assert.equal(stepGridAlignment(session, { x: 0, y: 10 }, 0.1), 16);
  assert.equal(stepGridAlignment(session, { x: 30, y: 10 }, 0.1), 2);
  assert.equal(stepGridAlignment(session, { x: 34, y: 10 }, 0.1), -2);
});

test("the 64 pixel grid covers the complete logical screen", () => {
  assert.deepEqual(GRID, {
    tileSizePx: 64,
    columns: 9,
    rows: 16,
    widthPx: 576,
    heightPx: 1024,
  });
  assert.equal(GRID.columns * GRID.tileSizePx, GRID.widthPx);
  assert.equal(GRID.rows * GRID.tileSizePx, GRID.heightPx);
});

test("logical game coordinates scale into the resized render surface", () => {
  assert.equal(getLogicalViewportScale(405, 720, 576, 1024), 0.703125);
  assert.equal(getLogicalViewportScale(810, 1440, 576, 1024), 1.40625);
});

test("joystick cardinal directions map to world X and Y", () => {
  const center = { x: 100, y: 100 };

  assert.deepEqual(calculateJoystickInput({ x: 100, y: 50 }, center, 50), { x: 0, y: 1 });
  assert.deepEqual(calculateJoystickInput({ x: 150, y: 100 }, center, 50), { x: 1, y: 0 });
  assert.deepEqual(calculateJoystickInput({ x: 100, y: 150 }, center, 50), { x: 0, y: -1 });
  assert.deepEqual(calculateJoystickInput({ x: 50, y: 100 }, center, 50), { x: -1, y: 0 });
});

test("joystick dead zone is removed and remaining travel is proportional", () => {
  const center = { x: 0, y: 0 };

  assert.deepEqual(calculateJoystickInput({ x: 0, y: -10 }, center, 100, 0.15), { x: 0, y: 0 });
  const halfTravel = calculateJoystickInput({ x: 0, y: -57.5 }, center, 100, 0.15);
  assert.ok(Math.abs(halfTravel.y - 0.5) < 1e-10);
});

test("joystick displacement clamps diagonal magnitude to one", () => {
  const movement = calculateJoystickInput({ x: 200, y: -200 }, { x: 0, y: 0 }, 100);

  assert.ok(Math.abs(Math.hypot(movement.x, movement.y) - 1) < 1e-10);
  assert.ok(movement.x > 0);
  assert.ok(movement.y > 0);
});

test("joystick movement overrides held keys only while displaced", () => {
  const keyboard = { x: 1, y: 0 };

  assert.deepEqual(selectMovementInput(keyboard, { x: 0, y: 0.5 }), {
    x: 0,
    y: 0.5,
  });
  assert.deepEqual(selectMovementInput(keyboard, { x: 0, y: 0 }), keyboard);
});

test("terrain review lays out every atlas frame once in row-major order", () => {
  const tiles = createTerrainReviewTiles(
    54,
    9,
    64,
    1024,
    new Set([44]),
    new Set([4, 13, 22, 31, 37, 38, 40, 46, 47, 49]),
  );

  assert.equal(tiles.length, 54);
  assert.deepEqual(tiles.map(({ frame }) => frame), Array.from({ length: 54 }, (_, frame) => frame));
  assert.deepEqual(tiles[0], {
    frame: 0,
    screenPosition: { x: 0, y: 0 },
    valid: true,
    blocked: false,
    collider: null,
  });
  assert.deepEqual(tiles[4], {
    frame: 4,
    screenPosition: { x: 256, y: 0 },
    valid: false,
    blocked: false,
    collider: null,
  });
  assert.deepEqual(tiles[44], {
    frame: 44,
    screenPosition: { x: 512, y: 256 },
    valid: true,
    blocked: true,
    collider: { x: 512, y: 704, width: 64, height: 64 },
  });
  assert.deepEqual(tiles[53].screenPosition, { x: 512, y: 320 });
  assert.deepEqual(
    tiles.filter(({ valid }) => !valid).map(({ frame }) => frame),
    [4, 13, 22, 31, 37, 38, 40, 46, 47, 49],
  );
  assert.equal(tiles.filter(({ collider }) => collider !== null).length, 1);
});

test("a grid tile at world origin occupies the lower-left screen cell", () => {
  assert.deepEqual(gridCellToScreen({ x: 0, y: 0 }, 64, 1024), {
    x: 0,
    y: 960,
  });
});

test("an oversized animation frame is centered on its grid cell", () => {
  assert.deepEqual(
    gridCellToScreenForFrame({ x: 0, y: 0 }, 64, 192, 1024),
    { x: -64, y: 896 },
  );
});

test("character collider matches the body box in the archer mockup", () => {
  const collider = getCharacterCollider(
    { x: 288, y: 512 },
    { width: 192, height: 144 },
    { x: 0.5, y: 0.78 },
    { x: 60, y: 100, width: 66, height: 52 },
  );

  assert.deepEqual(
    { x: collider.x, width: collider.width, height: collider.height },
    { x: 252, width: 66, height: 52 },
  );
  assert.ok(Math.abs(collider.y - 472.32) < 1e-10);
});

test("character circle collider preserves the body-box center", () => {
  const collider = getCharacterCollider(
    { x: 288, y: 512 },
    { width: 192, height: 144 },
    { x: 0.5, y: 0.78 },
    { type: "circle", x: 93, y: 126, radius: 26 },
  );

  assert.equal(collider.type, "circle");
  assert.equal(collider.x, 285);
  assert.ok(Math.abs(collider.y - 498.32) < 1e-10);
  assert.equal(collider.radius, 26);
});

test("AABB overlap excludes touching edges", () => {
  const box = { x: 10, y: 10, width: 20, height: 20 };

  assert.equal(aabbsOverlap(box, { x: 29, y: 10, width: 5, height: 5 }), true);
  assert.equal(aabbsOverlap(box, { x: 30, y: 10, width: 5, height: 5 }), false);
});

test("frame 48 uses an exact lower-left diagonal blocking triangle", () => {
  const tiles = createTerrainReviewTiles(
    54,
    9,
    64,
    1024,
    new Set(),
    new Set(),
    new Map([[48, [
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ]]]),
  );

  assert.deepEqual(tiles[48].collider, {
    type: "polygon",
    points: [
      { x: 192, y: 704 },
      { x: 256, y: 640 },
      { x: 192, y: 640 },
    ],
  });
  assert.equal(tiles[48].blocked, true);
});

test("frames 36 and 45 reflect the configured collision shapes", () => {
  const tiles = createTerrainReviewTiles(
    54,
    9,
    64,
    1024,
    NON_WALKABLE_TERRAIN_FRAMES,
    new Set(),
    PARTIAL_TERRAIN_COLLIDERS,
  );

  assert.equal(tiles[36].blocked, false);
  assert.equal(tiles[36].collider, null);
  assert.deepEqual(tiles[45].collider, {
    type: "polygon",
    points: [
      { x: 64, y: 640 },
      { x: 64, y: 704 },
      { x: 0, y: 640 },
    ],
  });
  assert.equal(tiles[45].blocked, true);
});

test("lower-left triangle blocks its half and leaves the upper-right half open", () => {
  const triangle = [
    { x: 0, y: 64 },
    { x: 64, y: 0 },
    { x: 0, y: 0 },
  ];

  assert.equal(
    aabbOverlapsPolygon({ x: 8, y: 8, width: 8, height: 8 }, triangle),
    true,
  );
  assert.equal(
    aabbOverlapsPolygon({ x: 48, y: 48, width: 8, height: 8 }, triangle),
    false,
  );
});

test("circle overlap recognizes the blocked and open sides of a diagonal", () => {
  const triangle = [
    { x: 0, y: 64 },
    { x: 64, y: 0 },
    { x: 0, y: 0 },
  ];

  assert.equal(circleOverlapsPolygon({ x: 16, y: 16, radius: 5 }, triangle), true);
  assert.equal(circleOverlapsPolygon({ x: 52, y: 52, radius: 5 }, triangle), false);
});

test("generic collider overlap handles circle pairs and AABB-circle pairs", () => {
  const sheep = { type: "circle", x: 100, y: 100, radius: 26 };
  assert.equal(collidersOverlap(sheep, { type: "circle", x: 151, y: 100, radius: 26 }), true);
  assert.equal(collidersOverlap(sheep, { type: "circle", x: 152, y: 100, radius: 26 }), false);
  assert.equal(collidersOverlap({ x: 120, y: 90, width: 30, height: 20 }, sheep), true);
});

test("other character colliders include live peers but not the current character", () => {
  const records = [
    { combat: { label: "enemy-1", isAlive: true }, actor: { getMovementCollider: () => ({ x: 1, y: 2, width: 3, height: 4 }) } },
    { combat: { label: "enemy-2", isAlive: true }, actor: { getMovementCollider: () => ({ x: 5, y: 6, width: 7, height: 8 }) } },
    { combat: { label: "dead", isAlive: false }, actor: { getMovementCollider: () => ({ x: 9, y: 10, width: 11, height: 12 }) } },
  ];

  assert.deepEqual(
    getOtherCharacterColliders(records, "enemy-1", "enemy"),
    [{ type: "enemy", collider: { x: 5, y: 6, width: 7, height: 8 } }],
  );
});

test("enemy occupancy colliders reserve the full grid cell of other live enemies", () => {
  const records = [
    { combat: { label: "enemy-1", isAlive: true }, actor: { getMovementCollider: () => ({ type: "circle", x: 96, y: 160, radius: 24 }) } },
    { combat: { label: "enemy-2", isAlive: true }, actor: { getMovementCollider: () => ({ type: "circle", x: 288, y: 32, radius: 24 }) } },
  ];

  assert.deepEqual(
    getOtherCharacterGridOccupancyColliders(records, "enemy-1", 64),
    [{ type: "enemy-grid-occupancy", x: 256, y: 0, width: 64, height: 64 }],
  );
});

test("grid occupancy blocks movement into an occupied cell even when actors overlap there", () => {
  const character = { frame: { width: 64, height: 64 }, pivot: { x: 0.5, y: 0.5 }, collider: { type: "circle", x: 32, y: 32, radius: 20 } };
  const occupiedCell = { type: "enemy-grid-occupancy", x: 64, y: 0, width: 64, height: 64 };

  assert.deepEqual(
    moveWithCollisions({ x: 96, y: 32 }, { x: 1, y: 0 }, 16, { width: 256, height: 256 }, character, [occupiedCell]),
    { x: 96, y: 32 },
  );
});

test("horizontal circle movement into a diagonal is pushed along the slope", () => {
  const triangle = {
    type: "polygon",
    points: [
      { x: 0, y: 64 },
      { x: 64, y: 0 },
      { x: 0, y: 0 },
    ],
  };
  const result = moveWithCollisions(
    { x: 60, y: 30 },
    { x: -1, y: 0 },
    20,
    { width: 200, height: 200 },
    {
      frame: { width: 0, height: 0 },
      pivot: { x: 0, y: 0 },
      collider: { type: "circle", x: 0, y: 0, radius: 5 },
    },
    [triangle],
  );

  assert.ok(result.x > 40);
  assert.ok(result.y > 30);
  assert.equal(
    circleOverlapsPolygon({ ...result, radius: 5 }, triangle.points),
    false,
  );
});

test("overlapping character circles can only move apart", () => {
  const character = { frame: { width: 64, height: 64 }, pivot: { x: 0.5, y: 0.5 }, collider: { type: "circle", x: 32, y: 32, radius: 16 } };
  const other = { type: "circle", x: 110, y: 100, radius: 16 };
  const toward = moveWithCollisions({ x: 100, y: 100 }, { x: 1, y: 0 }, 10, { width: 400, height: 400 }, character, [other]);
  const away = moveWithCollisions({ x: 100, y: 100 }, { x: -1, y: 0 }, 10, { width: 400, height: 400 }, character, [other]);
  assert.deepEqual(toward, { x: 100, y: 100 });
  assert.deepEqual(away, { x: 100, y: 100 });
});

test("character separation solver removes overlapping green circles", () => {
  const positions = [{ x: 100, y: 100 }, { x: 110, y: 100 }];
  const records = positions.map((position, index) => ({
    combat: { isAlive: true },
    actor: {
      frame: { width: 64, height: 64 },
      pivot: { x: 0.5, y: 0.5 },
      collider: { type: "circle", x: 32, y: 32, radius: 24 },
      getPosition: () => position,
      getMovementCollider: () => ({ type: "circle", x: position.x, y: position.y, radius: 24 }),
      setPosition: (next) => Object.assign(position, next),
    },
    id: index,
  }));
  separateOverlappingCharacterColliders(records);
  assert.ok(Math.hypot(positions[0].x - positions[1].x, positions[0].y - positions[1].y) >= 48);
});

test("character separation never pushes a character into terrain", () => {
  const positions = [{ x: 100, y: 100 }, { x: 110, y: 100 }];
  const records = positions.map((position, index) => ({
    combat: { isAlive: true },
    actor: {
      frame: { width: 64, height: 64 },
      pivot: { x: 0.5, y: 0.5 },
      collider: { type: "circle", x: 32, y: 32, radius: 24 },
      getPosition: () => position,
      getMovementCollider: () => ({ type: "circle", x: position.x, y: position.y, radius: 24 }),
      setPosition: (next) => Object.assign(position, next),
    },
    id: index,
  }));
  const blockedCell = { x: 0, y: 76, width: 76, height: 48 };

  separateOverlappingCharacterColliders(records, 0.01, 8, [blockedCell]);

  assert.equal(collidersOverlap(records[0].actor.getMovementCollider(), blockedCell), false);
  assert.equal(collidersOverlap(records[1].actor.getMovementCollider(), blockedCell), false);
});

test("AABB containment checks the complete box", () => {
  assert.equal(
    isAabbWithinBounds({ x: 0, y: 0, width: 20, height: 20 }, 100, 100),
    true,
  );
  assert.equal(
    isAabbWithinBounds({ x: 81, y: 0, width: 20, height: 20 }, 100, 100),
    false,
  );
});

test("collision-aware movement rejects direct obstacle overlap", () => {
  const result = moveWithCollisions(
    { x: 50, y: 50 },
    { x: 1, y: 0 },
    20,
    { width: 200, height: 200 },
    { frame: { width: 20, height: 20 }, pivot: { x: 0.5, y: 0.5 } },
    [{ x: 70, y: 45, width: 20, height: 20 }],
  );

  assert.deepEqual(result, { x: 50, y: 50 });
});

test("collision-aware movement applies the unobstructed axis for sliding", () => {
  const result = moveWithCollisions(
    { x: 50, y: 50 },
    { x: 1, y: 1 },
    20,
    { width: 200, height: 200 },
    { frame: { width: 20, height: 20 }, pivot: { x: 0.5, y: 0.5 } },
    [{ x: 70, y: 45, width: 20, height: 20 }],
  );

  assert.deepEqual(result, { x: 50, y: 70 });
});

test("collision-aware movement can cross every logical playfield edge", () => {
  const character = { frame: { width: 20, height: 20 }, pivot: { x: 0.5, y: 0.5 } };
  const bounds = { width: 100, height: 100 };

  assert.deepEqual(moveWithCollisions({ x: 10, y: 50 }, { x: -1, y: 0 }, 20, bounds, character, []), { x: -10, y: 50 });
  assert.deepEqual(moveWithCollisions({ x: 90, y: 50 }, { x: 1, y: 0 }, 20, bounds, character, []), { x: 110, y: 50 });
  assert.deepEqual(moveWithCollisions({ x: 50, y: 10 }, { x: 0, y: -1 }, 20, bounds, character, []), { x: 50, y: -10 });
  assert.deepEqual(moveWithCollisions({ x: 50, y: 90 }, { x: 0, y: 1 }, 20, bounds, character, []), { x: 50, y: 110 });
});

test("position readout keeps pixels above feet-based row and column", () => {
  assert.equal(
    formatPositionReadout({ x: 288.4, y: 511.7 }, { x: 4, y: 7 }),
    "X 288 · Y 512\nC 4 · R 7",
  );
});

test("W and ArrowUp move in positive world Y", () => {
  assert.deepEqual(getMovementVector(new Set(["KeyW"])), { x: 0, y: 1 });
  assert.deepEqual(getMovementVector(new Set(["ArrowUp"])), { x: 0, y: 1 });
});

test("D and ArrowRight move in positive world X", () => {
  assert.deepEqual(getMovementVector(new Set(["KeyD"])), { x: 1, y: 0 });
  assert.deepEqual(getMovementVector(new Set(["ArrowRight"])), { x: 1, y: 0 });
});

test("diagonal movement is normalized", () => {
  const movement = getMovementVector(new Set(["KeyW", "KeyD"]));
  assert.ok(Math.abs(Math.hypot(movement.x, movement.y) - 1) < 1e-10);
  assert.ok(movement.x > 0);
  assert.ok(movement.y > 0);
});

test("quadrant-I world coordinates convert to screen coordinates with Y inverted", () => {
  assert.deepEqual(worldToScreen({ x: 3, y: 2 }, 64, 640), {
    x: 192,
    y: 512,
  });
});

test("archer coordinates use the grid cell beneath the bottom of the artwork", () => {
  assert.deepEqual(
    worldToGrid(
      { x: 288, y: 512 },
      64,
      { width: 192, height: 144, pivotX: 0.5, pivotY: 0.78 },
    ),
    { x: 3, y: 7 },
  );

  assert.deepEqual(
    worldToGrid(
      { x: 32, y: 32 },
      64,
      { width: 192, height: 144, pivotX: 0.5, pivotY: 0.78 },
    ),
    { x: 0, y: 0 },
  );
});

test("archer's reachable lower-left position is column zero and row zero", () => {
  assert.deepEqual(
    worldToGrid(
      { x: 96, y: 31.68 },
      64,
      { width: 192, height: 144, pivotX: 0.5, pivotY: 0.78 },
    ),
    { x: 0, y: 0 },
  );
});

test("movement remains inside positive level bounds", () => {
  assert.deepEqual(
    moveWithinBounds({ x: 0, y: 0 }, { x: -1, y: -1 }, 10, 4, 4),
    { x: 0, y: 0 },
  );
});
