import test from "node:test";
import assert from "node:assert/strict";

import {
  COMBAT_COLLIDER_STYLE,
  MOVEMENT_COLLIDER_STYLE,
  TERRAIN_COLLIDER_STYLE,
  createCharacterCenterDrawCommands,
  createCharacterColliderDrawCommands,
  AUDIO_PERCEPTION_STYLE,
  VISUAL_PERCEPTION_STYLE,
  createPerceptionSquare,
  createPerceptionDrawCommands,
  createActivePerceptionMarkerCommands,
  getPerceptionBlinkState,
  getVisibleVisualCells,
  createEnemyVisionShadowDrawCommands,
} from "../../src/ui/collider-diagnostics.js";

test("visible visual cells stop before terrain and living blockers", () => {
  const actor = { id: "enemy", type: "enemy", isAlive: true, cell: { x: 2, y: 2 }, heading: "right", visualRange: 4 };
  assert.deepEqual(getVisibleVisualCells(actor, 64, { blockers: [{ x: 4, y: 2 }] }), [
    { x: 3, y: 2 },
  ]);
  assert.deepEqual(getVisibleVisualCells({ ...actor, heading: "up" }, 64, { blockers: [{ x: 2, y: 0 }] }), [
    { x: 2, y: 1 },
  ]);
  assert.deepEqual(getVisibleVisualCells({ ...actor, isAlive: false }, 64), []);
});

test("enemy vision shadow commands use tile positions and 40/30/20/10 opacity", () => {
  const commands = createEnemyVisionShadowDrawCommands({ actors: [
    { id: "enemy", type: "enemy", isAlive: true, cell: { x: 1, y: 1 }, heading: "right", visualRange: 4 },
  ] }, 64, { screenHeight: 1024 });
  assert.deepEqual(commands.map(({ positionPx, color }) => ({ positionPx, color })), [
    { positionPx: [160, 928], color: [1, 1, 1, 0.4] },
    { positionPx: [224, 928], color: [1, 1, 1, 0.30000000000000004] },
    { positionPx: [288, 928], color: [1, 1, 1, 0.2] },
    { positionPx: [352, 928], color: [1, 1, 1, 0.09999999999999998] },
  ]);
});

test("active perception markers are red 20px crosses centered on detected cells", () => {
  const markers = createActivePerceptionMarkerCommands({ detections: [
    { type: "visual", cell: { x: 2, y: 3 } },
    { type: "audio", cell: { x: 2, y: 3 } },
    { type: "visual", cell: { x: 4, y: 1 } },
  ] });

  assert.deepEqual(markers.map(({ x, y }) => ({ x, y })), [
    { x: 160, y: 224 }, { x: 288, y: 96 },
  ]);
  assert.equal(markers[0].style.size, 20);
  assert.equal(markers[0].style.strokeStyle, "#ff3030");
  assert.deepEqual(createActivePerceptionMarkerCommands({ detections: [] }), []);
});

test("perception diagnostics skip enemies with invalid visual geometry", () => {
  assert.doesNotThrow(() => createPerceptionDrawCommands({ actors: [
    { id: "broken-enemy", type: "enemy", isAlive: true, cell: { x: 2, y: 2 }, heading: undefined },
  ], detections: [] }, 64));
  assert.deepEqual(createPerceptionDrawCommands({ actors: [
    { id: "broken-enemy", type: "enemy", isAlive: true, cell: { x: 2, y: 2 }, heading: undefined },
  ], detections: [] }, 64), []);
});

test("terrain colliders use the same green style as movement colliders", () => {
  assert.equal(TERRAIN_COLLIDER_STYLE.fillStyle, MOVEMENT_COLLIDER_STYLE.fillStyle);
  assert.equal(TERRAIN_COLLIDER_STYLE.strokeStyle, MOVEMENT_COLLIDER_STYLE.strokeStyle);
  assert.equal(TERRAIN_COLLIDER_STYLE.lineWidth, 1);
});

test("diagnostics draw every red combat collider before green movement colliders", () => {
  const characters = [
    { combatCollider: { id: "player-combat" }, movementCollider: { id: "player-movement" } },
    { combatCollider: { id: "sheep-combat" }, movementCollider: { id: "sheep-movement" } },
  ];
  const commands = createCharacterColliderDrawCommands(characters);

  assert.deepEqual(commands.map(({ collider }) => collider.id), [
    "player-combat", "sheep-combat", "player-movement", "sheep-movement",
  ]);
  assert.ok(commands.slice(0, 2).every(({ style }) => style === COMBAT_COLLIDER_STYLE));
  assert.ok(commands.slice(2).every(({ style }) => style === MOVEMENT_COLLIDER_STYLE));
  assert.match(COMBAT_COLLIDER_STYLE.strokeStyle, /ff|red/i);
  assert.match(MOVEMENT_COLLIDER_STYLE.strokeStyle, /green|40d|2ecc|22c/i);
});

test("diagnostics place center markers at movement collider centers", () => {
  const centers = createCharacterCenterDrawCommands([
    { movementCollider: { type: "circle", x: 35, y: 42, radius: 8 } },
    { movementCollider: { x: 10, y: 20, width: 12, height: 16 } },
    { movementCollider: null },
  ]);

  assert.deepEqual(centers, [
    { x: 35, y: 42 },
    { x: 16, y: 28 },
  ]);
});

test("visual squares fill cells and audio squares are centered at half size", () => {
  assert.deepEqual(createPerceptionSquare({ x: 2, y: 3 }, 64, 32), [
    { x: 144, y: 208 }, { x: 176, y: 208 }, { x: 176, y: 240 }, { x: 144, y: 240 },
  ]);
  assert.deepEqual(createPerceptionSquare({ x: 2, y: 3 }, 64, 16), [
    { x: 152, y: 216 }, { x: 168, y: 216 }, { x: 168, y: 232 }, { x: 152, y: 232 },
  ]);
});

test("perception commands keep overlapping visual and audio squares independent", () => {
  const commands = createPerceptionDrawCommands([{
    heading: "north",
    visualCells: [{ x: 1, y: 1 }],
    audioCells: [{ x: 1, y: 1 }],
    activeVisualCells: [{ x: 1, y: 1 }],
    activeAudioCells: [],
  }], 64);
  assert.deepEqual(commands.map(({ channel }) => channel), ["visual", "audio"]);
  assert.equal(commands[0].style.fillStyle, VISUAL_PERCEPTION_STYLE.fillStyle);
  assert.equal(commands[0].active, true);
  assert.equal(commands[1].style.fillStyle, AUDIO_PERCEPTION_STYLE.fillStyle);
  assert.equal(commands[1].active, false);
});

test("perception styling uses requested fills and three-second blink", () => {
  assert.equal(VISUAL_PERCEPTION_STYLE.fillStyle, "rgb(160 80 255 / 40%)");
  assert.equal(AUDIO_PERCEPTION_STYLE.fillStyle, "rgb(160 80 255 / 40%)");
  assert.equal(VISUAL_PERCEPTION_STYLE.blinkFillStyle, "rgb(160 80 255 / 100%)");
  assert.equal(AUDIO_PERCEPTION_STYLE.blinkFillStyle, "rgb(160 80 255 / 100%)");
  assert.equal(getPerceptionBlinkState(1000, 1000), true);
  assert.equal(getPerceptionBlinkState(1000, 1199), true);
  assert.equal(getPerceptionBlinkState(1000, 1200), false);
  assert.equal(getPerceptionBlinkState(1000, 1299), false);
  assert.equal(getPerceptionBlinkState(1000, 1300), true);
  assert.equal(getPerceptionBlinkState(1000, 4000), true);
});

test("simultaneous detections blink independently for every grid cell", () => {
  const snapshot = {
    actors: [{ id: "goblin-1", type: "enemy", cell: { x: 2, y: 2 }, heading: "right" }],
    detections: [
      { detectorId: "goblin-1", type: "visual", cell: { x: 3, y: 2 } },
      { detectorId: "goblin-1", type: "audio", cell: { x: 1, y: 1 } },
    ],
  };
  const commands = createPerceptionDrawCommands(snapshot, 64, 1000);
  assert.equal(commands.filter(({ active }) => active).length, 2);
  assert.equal(commands.filter(({ blinking }) => blinking).length, 2);
  assert.equal(createPerceptionDrawCommands(snapshot, 64, 1200).filter(({ blinking }) => blinking).length, 0);
  assert.equal(createPerceptionDrawCommands(snapshot, 64, 1300).filter(({ blinking }) => blinking).length, 2);
  assert.equal(commands.find(({ channel }) => channel === "visual").blinking, true);
});
