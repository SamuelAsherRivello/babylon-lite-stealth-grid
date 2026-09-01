import test from "node:test";
import assert from "node:assert/strict";

import {
  PLAYER_ITEMS,
  PLAYER_PAWN_ANIMATION_CATALOG,
  PLAYER_WEAPON_DAMAGE,
  PLAYER_WEAPONS,
  cycleLoadout,
} from "../../src/characters/player/player-pawn-catalog.js";
import { getLoadoutCycleType } from "../../src/characters/player/player.js";

test("Pawn catalog exposes the expected loadout categories and frame sizes", () => {
  assert.deepEqual(PLAYER_WEAPONS, ["axe", "hammer", "knife", "pickaxe"]);
  assert.deepEqual(PLAYER_ITEMS, ["gold", "meat", "wood"]);
  assert.equal(PLAYER_PAWN_ANIMATION_CATALOG.empty.idle.frameCount, 8);
  assert.equal(PLAYER_PAWN_ANIMATION_CATALOG.empty.run.frameCount, 6);
  assert.equal(PLAYER_PAWN_ANIMATION_CATALOG.weapons.knife.attack.frameCount, 4);
  assert.deepEqual(PLAYER_PAWN_ANIMATION_CATALOG.empty.idle.gridSize, [192, 192]);
});

test("Pawn weapon damage values are approved and bounded", () => {
  assert.deepEqual(PLAYER_WEAPON_DAMAGE, {
    knife: 10,
    pickaxe: 20,
    axe: 30,
    hammer: 40,
  });
  for (const value of Object.values(PLAYER_WEAPON_DAMAGE)) {
    assert.ok(value >= 5 && value <= 50);
  }
});

test("loadout cycling wraps through none", () => {
  assert.equal(cycleLoadout(null, PLAYER_WEAPONS), "axe");
  assert.equal(cycleLoadout("pickaxe", PLAYER_WEAPONS), null);
  assert.equal(cycleLoadout("wood", PLAYER_ITEMS), null);
});

test("number-row and numpad keys identify loadout cycling", () => {
  assert.equal(getLoadoutCycleType({ code: "Digit1", key: "1" }), "weapon");
  assert.equal(getLoadoutCycleType({ code: "Numpad1", key: "1" }), "weapon");
  assert.equal(getLoadoutCycleType({ code: "Digit2", key: "2" }), "item");
  assert.equal(getLoadoutCycleType({ code: "Numpad2", key: "2" }), "item");
});
