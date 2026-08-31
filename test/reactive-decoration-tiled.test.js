import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  normalizeTiledMap,
  validateTiledMap,
} from "../plugins/tiled-babylon-lite/index.js";

const MAP_URL = new URL("../public/levels/tiled/maps/Level01.tmj", import.meta.url);
const TERRAIN_URL = new URL("../public/levels/tiled/tilesets/Tilemap_color3.tsj", import.meta.url);
const BUSH_URL = new URL("../public/levels/tiled/tilesets/TinySwordsBushDecorations.tsj", import.meta.url);

async function json(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

function pngDimensions(bytes) {
  assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test("bush source and editor preview are valid PNGs with expected dimensions", async () => {
  const [source, preview] = await Promise.all([
    readFile(new URL("../public/assets/terrain/decorations/bushes/Bushe1.png", import.meta.url)),
    readFile(new URL("../public/assets/terrain/decorations/bushes/Bushe1-frame0.png", import.meta.url)),
  ]);
  assert.deepEqual(pngDimensions(source), { width: 1024, height: 128 });
  assert.deepEqual(pngDimensions(preview), { width: 68, height: 46 });
  assert.equal(source[25], 6);
  assert.equal(preview[25], 6);
});

test("bush tileset exposes exactly one placeable reactive decoration item", async () => {
  const tileset = await json(BUSH_URL);
  assert.equal(tileset.tilecount, 1);
  assert.equal(tileset.tiles.length, 1);
  assert.equal(tileset.tiles[0].class, "ReactiveDecoration");
  assert.equal(tileset.tiles[0].imagewidth, 68);
  assert.equal(tileset.tiles[0].imageheight, 46);
  assert.deepEqual(tileset.tileoffset, { x: 0, y: -49 });
  assert.equal(tileset.tiles[0].objectgroup.objects[0].class, "Sensor");
});

test("Level01 normalizes the bush as a bottom-centered independent object", async () => {
  const [map, terrain, bush] = await Promise.all([json(MAP_URL), json(TERRAIN_URL), json(BUSH_URL)]);
  const external = new Map([
    ["../tilesets/Tilemap_color3.tsj", terrain],
    ["../tilesets/TinySwordsBushDecorations.tsj", bush],
  ]);
  assert.deepEqual(validateTiledMap(map, external), []);
  const level = normalizeTiledMap(map, external);
  assert.equal(level.reactiveDecorations.length, 1);
  const object = level.reactiveDecorations[0];
  assert.equal(object.name, "Bush 1");
  assert.equal(object.layerName, "Y-Sorted Props");
  const placed = map.layers.find(({ name }) => name === "Y-Sorted Props").objects[0];
  assert.equal(placed.width, 68);
  assert.equal(placed.height, 46);
  assert.deepEqual(object.position, {
    x: placed.x,
    y: 1024 - placed.y,
  });
  assert.deepEqual(object.decoration.frameSize, { width: 128, height: 128 });
  assert.equal(object.decoration.frameCount, 8);
  assert.equal(object.decoration.idleFrame, 0);
  assert.equal(object.decoration.loop, false);
  assert.equal(object.decoration.blocking, false);
  assert.deepEqual(object.decoration.acceptedCharacterTypes, ["player", "npc", "enemy"]);
  assert.deepEqual(object.decoration.sensor, {
    x: object.position.x - 24,
    y: object.position.y + 8,
    width: 48,
    height: 32,
  });
});

test("reactive decoration property precedence is class then tile then object", () => {
  const tile = {
    id: 0, class: "ReactiveDecoration", imagewidth: 128, imageheight: 128,
    objectgroup: { objects: [{ class: "Sensor", x: 40, y: 88, width: 48, height: 32 }] },
    properties: [
      { name: "runtimeImage", value: "bush.png" },
      { name: "frameWidth", value: 128 }, { name: "frameHeight", value: 128 },
      { name: "frameCount", value: 8 }, { name: "frameDurationMs", value: 100 },
      { name: "idleFrame", value: 0 }, { name: "blocking", value: false },
      { name: "triggerMode", value: "character-enter" }, { name: "playbackMode", value: "once" },
      { name: "acceptedCharacterTypes", value: "player,npc,enemy" },
    ],
  };
  const map = {
    type: "map", orientation: "orthogonal", infinite: false,
    width: 1, height: 1, tilewidth: 64, tileheight: 64,
    tilesets: [{ firstgid: 1, source: "bush.tsj" }],
    layers: [
      { type: "tilelayer", name: "World Origin", data: [1] },
      { type: "objectgroup", name: "Y-Sorted Props", objects: [{
        id: 7, gid: 1, x: 32, y: 64,
        properties: [{ name: "frameDurationMs", value: 175 }],
      }] },
    ],
  };
  const tileset = {
    classDefaults: { ReactiveDecoration: { frameDurationMs: 80, resetAfterPlay: true } },
    tiles: [tile],
  };
  const object = normalizeTiledMap(map, new Map([["bush.tsj", tileset]])).reactiveDecorations[0];
  assert.equal(object.properties.frameDurationMs, 175);
  assert.equal(object.properties.resetAfterPlay, true);
});

test("invalid reactive decoration reports layer, sensor, and behavior errors", () => {
  const map = {
    type: "map", orientation: "orthogonal", infinite: false,
    width: 1, height: 1, tilewidth: 64, tileheight: 64,
    tilesets: [{ firstgid: 1, source: "bad.tsj" }],
    layers: [
      { type: "tilelayer", name: "World Origin", data: [1] },
      { type: "objectgroup", name: "Wrong Layer", objects: [{ id: 9, gid: 1, x: 0, y: 64 }] },
    ],
  };
  const tileset = { tiles: [{ id: 0, class: "ReactiveDecoration", properties: [
    { name: "blocking", value: true }, { name: "triggerMode", value: "touch" },
    { name: "playbackMode", value: "loop" },
  ] }] };
  const errors = validateTiledMap(map, new Map([["bad.tsj", tileset]])).join("\n");
  assert.match(errors, /object 9 must be on layer/);
  assert.match(errors, /missing runtimeImage/);
  assert.match(errors, /invalid frame dimensions or count/);
  assert.match(errors, /missing valid Sensor geometry/);
  assert.match(errors, /must be non-blocking/);
  assert.match(errors, /unsupported triggerMode/);
  assert.match(errors, /unsupported playbackMode/);
});
