import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  collectTiledLayerTiles,
  formatLevelCellLabel,
  normalizeTiledMap,
  validateTiledMap,
} from "../plugins/tiled-babylon-lite/index.js";

const LEVEL_PATH = new URL(
  "../public/levels/tiled/maps/Level01.tmj",
  import.meta.url,
);
const MAIN_PATH = new URL("../src/main.js", import.meta.url);
const TILESET_NAMES = Array.from({ length: 5 }, (_, index) => `Tilemap_color${index + 1}`);
const TILESET_URLS = TILESET_NAMES.map((name) => new URL(
  `../public/levels/tiled/tilesets/${name}.tsj`,
  import.meta.url,
));
const COLOR_THREE_SOURCE = "../tilesets/Tilemap_color3.tsj";
const COLOR_THREE_COLLIDABLE_IDS = [
  0, 1, 2, 3, 5, 6, 7, 9, 11, 12, 14, 16, 18, 19, 20, 21, 23, 24, 25,
  27, 28, 29, 30, 32, 33, 34, 36, 39, 41, 42, 43, 44, 45, 48, 50, 51, 52, 53,
];
const LEVEL01_AUTHORED_CONTENT_SHA256 =
  "aecddd9663b61bb6dd9e5124c3aae88f8db7352ff165b2f1f81f752447048f38";

async function readJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

async function readLevelWithTilesets() {
  const map = await readJson(LEVEL_PATH);
  const tilesets = await Promise.all(map.tilesets.map(({ source }) => (
    readJson(new URL(source, LEVEL_PATH))
  )));
  return {
    map,
    externalTilesets: new Map(map.tilesets.map(({ source }, index) => [
      source,
      tilesets[index],
    ])),
  };
}

test("Level01 loads its authored visual layers without requiring a Terrain layer", async () => {
  const { map, externalTilesets } = await readLevelWithTilesets();

  assert.deepEqual(validateTiledMap(map), []);
  const level = normalizeTiledMap(map, externalTilesets);
  const tiles = collectTiledLayerTiles(level);

  assert.equal(level.width, 9);
  assert.equal(level.height, 16);
  assert.deepEqual(level.layers.map(({ name }) => name), [
    "Background",
    "Midground",
    "Foreground",
  ]);
  assert.equal(tiles.length, level.layers.reduce((total, layer) => total + layer.tiles.length, 0));
  assert.ok(tiles.length > 0);
  assert.equal(tiles[0].layerName, "Background");
  assert.equal(tiles.at(-1).layerName, "Midground");
});

test("Level01 normalizes the lower-left origin cell to game tile zero zero", async () => {
  const { map, externalTilesets } = await readLevelWithTilesets();
  const level = normalizeTiledMap(map, externalTilesets);

  assert.deepEqual(level.origin, { x: 0, y: 0 });
  assert.deepEqual(level.layers[0].tiles.at(-1).gameCell, { x: 8, y: 0 });
});

test("Level01 migration preserves authored content and color-three global ids", async () => {
  const map = await readJson(LEVEL_PATH);
  const authoredContent = {
    width: map.width,
    height: map.height,
    layers: map.layers
      .filter(({ type }) => type === "tilelayer")
      .map(({ name, type, data }) => ({ name, type, data })),
  };
  const signature = createHash("sha256")
    .update(JSON.stringify(authoredContent))
    .digest("hex");

  assert.equal(signature, LEVEL01_AUTHORED_CONTENT_SHA256);
  assert.equal(map.tilesets[0].firstgid, 1);
  assert.equal(map.tilesets[0].source, COLOR_THREE_SOURCE);
});

test("all five filename-matched Tiny Swords tilesets share the 64 pixel grid", async () => {
  const tilesets = await Promise.all(TILESET_URLS.map(readJson));

  assert.deepEqual(tilesets.map(({ name }) => name), TILESET_NAMES);
  for (const [index, tileset] of tilesets.entries()) {
    assert.equal(tileset.image, `../../../assets/terrain/tilesets/${TILESET_NAMES[index]}.png`);
    assert.equal(tileset.imagewidth, 576);
    assert.equal(tileset.imageheight, 384);
    assert.equal(tileset.tilewidth, 64);
    assert.equal(tileset.tileheight, 64);
    assert.equal(tileset.columns, 9);
    assert.equal(tileset.tilecount, 54);
  }
});

test("normalization preserves the image for each tile's source tileset", async () => {
  const { map, externalTilesets } = await readLevelWithTilesets();
  const level = normalizeTiledMap(map, externalTilesets);
  const midgroundImages = new Set(
    level.layers.find(({ name }) => name === "Midground").tiles.map(({ image }) => image),
  );

  assert.deepEqual(midgroundImages, new Set([
    "../../../assets/terrain/tilesets/Tilemap_color3.png",
    "../../../assets/terrain/tilesets/Tilemap_color1.png",
  ]));
});

test("runtime registers and scales every tileset-specific terrain layer", async () => {
  const source = await readFile(MAIN_PATH, "utf8");

  assert.match(source, /\.\.\.terrainLayers/);
  assert.match(source, /for \(const layer of terrainLayers\)/);
  assert.doesNotMatch(source, /\bterrainLayer\b/);
});

test("color-three retains its baseline collision shapes and accepts authored additions", async () => {
  const tileset = await readJson(TILESET_URLS[2]);
  const collidableIds = tileset.tiles
    .filter(({ objectgroup }) => objectgroup?.objects?.length > 0)
    .map(({ id }) => id);

  for (const frame of [41, 42, 43, 44, 45, 48, 50, 51, 52, 53]) {
    assert.ok(collidableIds.includes(frame));
  }
  assert.equal(tileset.tiles.find(({ id }) => id === 0).objectgroup.objects.length, 2);
  assert.equal(tileset.tiles.find(({ id }) => id === 41).objectgroup.objects[0].width, 64);
  assert.deepEqual(
    tileset.tiles.find(({ id }) => id === 48).objectgroup.objects[0].polygon,
    [{ x: 0, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
  );
});

test("color-three collider geometry is quantized without expanding collider scope", async () => {
  const tileset = await readJson(TILESET_URLS[2]);
  const collidableTiles = tileset.tiles
    .filter(({ objectgroup }) => objectgroup?.objects?.length > 0);

  assert.deepEqual(collidableTiles.map(({ id }) => id), COLOR_THREE_COLLIDABLE_IDS);

  const canonicalRectangleKeys = new Set([
    "0,0,64,64",
    "0,0,4,64",
    "60,0,4,64",
    "0,0,64,4",
    "0,60,64,4",
  ]);
  const tileCorners = new Set(["0,0", "64,0", "64,64", "0,64"]);

  for (const tile of collidableTiles) {
    for (const object of tile.objectgroup.objects) {
      if (object.polygon) {
        const absoluteVertices = object.polygon.map(({ x, y }) => `${object.x + x},${object.y + y}`);
        assert.equal(absoluteVertices.length, 3, `tile ${tile.id} polygon must have three vertices`);
        assert.equal(new Set(absoluteVertices).size, 3, `tile ${tile.id} polygon vertices must be unique`);
        assert.ok(absoluteVertices.every((vertex) => tileCorners.has(vertex)), `tile ${tile.id} polygon must use tile corners`);
        continue;
      }

      assert.ok(object.width !== 0 && object.height !== 0, `tile ${tile.id} has zero-area rectangle ${object.id}`);
      const rectangleKey = [object.x, object.y, object.width, object.height].join(",");
      assert.ok(canonicalRectangleKeys.has(rectangleKey), `tile ${tile.id} has noncanonical rectangle ${rectangleKey}`);
    }
  }
});

test("color-one copies color-three collider object groups one-to-one", async () => {
  const [colorOne, colorThree] = await Promise.all([
    readJson(TILESET_URLS[0]),
    readJson(TILESET_URLS[2]),
  ]);
  const objectGroupsById = (tileset) => Object.fromEntries(
    (tileset.tiles ?? []).map(({ id, objectgroup }) => [id, objectgroup]),
  );

  assert.equal(colorOne.name, "Tilemap_color1");
  assert.equal(colorOne.image, "../../../assets/terrain/tilesets/Tilemap_color1.png");
  assert.deepEqual(objectGroupsById(colorOne), objectGroupsById(colorThree));
});

test("normalization imports Tiled collision objects into bottom-left local coordinates", async () => {
  const { map, externalTilesets } = await readLevelWithTilesets();
  const level = normalizeTiledMap(map, externalTilesets);
  const tiles = collectTiledLayerTiles(level);

  assert.deepEqual(tiles.find(({ frame }) => frame === 42).collisionShapes, [{
    type: "rectangle",
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  }]);
  assert.deepEqual(tiles.find(({ frame }) => frame === 48).collisionShapes, [{
    type: "polygon",
    points: [
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ],
  }]);
});

test("Level01 exposes one Player, Sheep, Goblin, and Warrior spawner", async () => {
  const { map, externalTilesets } = await readLevelWithTilesets();
  const level = normalizeTiledMap(map, externalTilesets);
  assert.deepEqual(level.spawners.map(({ type, gameCell }) => ({ type, gameCell })), [
    { type: "PLAYER", gameCell: { x: 3, y: 7 } },
    { type: "SHEEP", gameCell: { x: 6, y: 4 } },
    { type: "GOBLIN", gameCell: { x: 2, y: 5 } },
    { type: "WARRIOR", gameCell: { x: 5, y: 9 } },
  ]);
});

test("level coordinate labels use zero-padded column row values", () => {
  assert.equal(formatLevelCellLabel({ x: 0, y: 0 }), "00,00");
  assert.equal(formatLevelCellLabel({ x: 8, y: 15 }), "08,15");
});
