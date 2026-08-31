import assert from "node:assert/strict";
import test from "node:test";

import {
  getCharacterGridCell,
  getCharacterLayerOrder,
} from "../src/character-spatial.js";
import { getCharacterCollider } from "../src/game-logic.js";
import { getYSortedLayerOrder } from "../src/render-depth.js";
import {
  PLAYER_FRAME, PLAYER_MOVEMENT_COLLIDER, PLAYER_PIVOT,
} from "../src/player.js";
import {
  SHEEP_FRAME_SIZE, SHEEP_MOVEMENT_COLLIDER, SHEEP_PIVOT,
} from "../src/npc/sheep/sheep.js";
import {
  GOBLIN_FRAME, GOBLIN_MOVEMENT_COLLIDER, GOBLIN_PIVOT,
} from "../src/enemies/goblin/goblin.js";
import {
  WARRIOR_FRAME, WARRIOR_MOVEMENT_COLLIDER, WARRIOR_PIVOT,
} from "../src/enemies/warrior/warrior.js";

const position = { x: 96, y: 96 };
const tileSize = 64;
const screenHeight = 1024;
const characters = [
  ["player pawn", PLAYER_FRAME, PLAYER_PIVOT, PLAYER_MOVEMENT_COLLIDER],
  ["sheep", { width: SHEEP_FRAME_SIZE, height: SHEEP_FRAME_SIZE }, SHEEP_PIVOT, SHEEP_MOVEMENT_COLLIDER],
  ["goblin", GOBLIN_FRAME, GOBLIN_PIVOT, GOBLIN_MOVEMENT_COLLIDER],
  ["warrior", WARRIOR_FRAME, WARRIOR_PIVOT, WARRIOR_MOVEMENT_COLLIDER],
];

for (const [name, frame, pivot, localCollider] of characters) {
  test(`${name} grid cell and layer order use its real movement-collider center`, () => {
    const collider = getCharacterCollider(position, frame, pivot, localCollider);
    assert.deepEqual(getCharacterGridCell(collider, tileSize), {
      x: Math.floor(collider.x / tileSize),
      y: Math.floor(collider.y / tileSize),
    });
    assert.equal(
      getCharacterLayerOrder(collider, screenHeight),
      getYSortedLayerOrder(collider.y, screenHeight),
    );
  });
}

