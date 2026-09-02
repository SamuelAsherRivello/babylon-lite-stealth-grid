import test from "node:test";
import assert from "node:assert/strict";

import { getCharacterCollider } from "../../src/gameplay/game-logic.js";
import {
  PLAYER_COMBAT_COLLIDER,
  PLAYER_FRAME,
  PLAYER_MOVEMENT_COLLIDER,
} from "../../src/characters/player/player.js";
import {
  GOBLIN_COMBAT_COLLIDER,
  GOBLIN_FRAME,
  GOBLIN_MOVEMENT_COLLIDER,
  GOBLIN_PIVOT,
} from "../../src/characters/enemies/goblin/goblin.js";
import {
  WARRIOR_COMBAT_COLLIDER,
  WARRIOR_FRAME,
  WARRIOR_MOVEMENT_COLLIDER,
  WARRIOR_PIVOT,
} from "../../src/characters/enemies/warrior/warrior.js";
import {
  SHEEP_COMBAT_COLLIDER,
  SHEEP_FRAME_SIZE,
  SHEEP_MOVEMENT_COLLIDER,
  SHEEP_PIVOT,
} from "../../src/characters/npc/sheep/sheep.js";

const position = { x: 200, y: 300 };

test("player movement and combat colliders share the logical position as center", () => {
  assert.deepEqual(PLAYER_MOVEMENT_COLLIDER, {
    type: "circle", x: 96, y: 149.76, radius: 18.2,
  });
  assert.deepEqual(PLAYER_COMBAT_COLLIDER, {
    x: 64, y: 117.75999999999999, width: 64, height: 64,
  });
  assert.deepEqual(
    getCharacterCollider(position, PLAYER_FRAME, { x: 0.5, y: 0.78 }, PLAYER_COMBAT_COLLIDER),
    { x: 168, y: 268, width: 64, height: 64 },
  );
});

test("goblin, warrior, and sheep use one grid cell for combat geometry while retaining movement circles", () => {
  const characters = [
    {
      frame: GOBLIN_FRAME, pivot: GOBLIN_PIVOT,
      movement: GOBLIN_MOVEMENT_COLLIDER, combat: GOBLIN_COMBAT_COLLIDER,
    },
    {
      frame: WARRIOR_FRAME, pivot: WARRIOR_PIVOT,
      movement: WARRIOR_MOVEMENT_COLLIDER, combat: WARRIOR_COMBAT_COLLIDER,
    },
    {
      frame: { width: SHEEP_FRAME_SIZE, height: SHEEP_FRAME_SIZE }, pivot: SHEEP_PIVOT,
      movement: SHEEP_MOVEMENT_COLLIDER, combat: SHEEP_COMBAT_COLLIDER,
    },
  ];

  assert.deepEqual(characters.map(({ movement }) => movement.radius), [24, 24, 26]);
  assert.ok(characters.every(({ movement }) => movement.type === "circle"));
  assert.ok(characters.every(({ combat }) => combat.width === 64 && combat.height === 64));
  for (const { frame, pivot, combat } of characters) {
    const world = getCharacterCollider(position, frame, pivot, combat);
    assert.equal(world.width, 64);
    assert.equal(world.height, 64);
  }
});
