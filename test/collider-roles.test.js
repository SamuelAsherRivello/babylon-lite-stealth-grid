import test from "node:test";
import assert from "node:assert/strict";

import { getCharacterCollider } from "../src/game-logic.js";
import {
  PLAYER_COMBAT_COLLIDER,
  PLAYER_FRAME,
  PLAYER_MOVEMENT_COLLIDER,
} from "../src/player.js";
import {
  GOBLIN_COMBAT_COLLIDER,
  GOBLIN_FRAME,
  GOBLIN_MOVEMENT_COLLIDER,
  GOBLIN_PIVOT,
} from "../src/enemies/goblin/goblin.js";
import {
  WARRIOR_COMBAT_COLLIDER,
  WARRIOR_FRAME,
  WARRIOR_MOVEMENT_COLLIDER,
  WARRIOR_PIVOT,
} from "../src/enemies/warrior/warrior.js";
import {
  SHEEP_COMBAT_COLLIDER,
  SHEEP_FRAME_SIZE,
  SHEEP_MOVEMENT_COLLIDER,
  SHEEP_PIVOT,
} from "../src/npc/sheep/sheep.js";

const position = { x: 200, y: 300 };

test("player keeps its movement circle and gains a centered feet-anchored combat rectangle", () => {
  assert.deepEqual(PLAYER_MOVEMENT_COLLIDER, {
    type: "circle", x: 93, y: 126, radius: 18.2,
  });
  assert.deepEqual(PLAYER_COMBAT_COLLIDER, {
    x: 64, y: 69.75999999999999, width: 64, height: 80,
  });
  assert.deepEqual(
    getCharacterCollider(position, PLAYER_FRAME, { x: 0.5, y: 0.78 }, PLAYER_COMBAT_COLLIDER),
    { x: 168, y: 300, width: 64, height: 80 },
  );
});

test("goblin, warrior, and sheep own distinct combat geometry while retaining movement circles", () => {
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
  assert.equal(new Set(characters.map(({ combat }) => `${combat.width}x${combat.height}`)).size, 3);
  for (const { frame, pivot, combat } of characters) {
    const world = getCharacterCollider(position, frame, pivot, combat);
    assert.equal(world.y, position.y);
  }
});
