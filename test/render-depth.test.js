import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DOM_Z, GAME_DEPTH, TILE_MAP_SUB_Z, getYSortedLayerOrder,
} from "../src/render-depth.js";

test("TileMap sub-Z values are ordered within its band", () => {
  const values = Object.values(TILE_MAP_SUB_Z);
  assert.ok(values.every((value) => value >= 0 && value < 100));
  assert.deepEqual(values, [...values].sort((a, b) => a - b));
});

test("game depth bands reserve projectiles and effects", () => {
  assert.deepEqual(GAME_DEPTH, { tileMap: 0, npcs: 100, player: 200,
    projectiles: 300, effects: 400, foreground: 500 });
});

test("DOM UI and settings overlay stack above game content", () => {
  assert.ok(DOM_Z.coordinateGuide > GAME_DEPTH.foreground);
  assert.ok(DOM_Z.virtualController < DOM_Z.settingsBackdrop);
  assert.ok(DOM_Z.settingsBackdrop < DOM_Z.settingsWindow);
  assert.ok(DOM_Z.settingsWindow < DOM_Z.settingsClose);
  assert.ok(DOM_Z.error > DOM_Z.settingsClose);
});

test("Y-sorted world layers draw lower ground contacts in front", () => {
  const behind = getYSortedLayerOrder(800, 1024);
  const inFront = getYSortedLayerOrder(200, 1024);
  assert.ok(behind < inFront);
  assert.ok(behind >= GAME_DEPTH.npcs);
  assert.ok(inFront < GAME_DEPTH.player);
});

test("every moving character recalculates layer order from Y while updating sprites", async () => {
  const characterModules = [
    "../src/player.js",
    "../src/enemies/goblin/goblin.js",
    "../src/enemies/warrior/warrior.js",
    "../src/npc/sheep/sheep.js",
  ];

  for (const modulePath of characterModules) {
    const source = await readFile(new URL(modulePath, import.meta.url), "utf8");
    assert.match(source, /getYSortedLayerOrder\(position\.y, bounds\.height\)/, modulePath);
    assert.match(source, /layer\.order = order/, modulePath);
  }
});
