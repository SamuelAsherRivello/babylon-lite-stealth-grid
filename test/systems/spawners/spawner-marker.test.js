import test from "node:test";
import assert from "node:assert/strict";

import {
  SPAWNER_GRAYSCALE_FRAGMENT,
  SPAWNER_MARKER_ORDER,
  createSpawnerMarker,
} from "../../src/systems/spawners/spawner-marker.js";
import { GAME_DEPTH } from "../../src/systems/environment/render-depth.js";

test("spawner marker uses static frame-zero grayscale artwork at half size", () => {
  const calls = [];
  const layer = { visible: false, view: { zoom: 1 } };
  const api = {
    createSprite2DCustomShader: (options) => ({ options }),
    createSprite2DLayer: (atlas, options) => {
      calls.push(["layer", atlas, options]);
      Object.assign(layer, options);
      return layer;
    },
    addSprite2D: (target, props) => {
      calls.push(["sprite", target, props]);
      return { target, props };
    },
  };

  const marker = createSpawnerMarker({
    atlas: "idle-atlas",
    worldPosition: { x: 224, y: 512 },
    boundsHeight: 1024,
    gridSize: 64,
    frameSize: { width: 192, height: 192 },
    api,
  });

  assert.match(SPAWNER_GRAYSCALE_FRAGMENT, /luminance/);
  assert.doesNotMatch(SPAWNER_GRAYSCALE_FRAGMENT, /luminance\) \* in\.tint\.rgb/);
  assert.match(SPAWNER_GRAYSCALE_FRAGMENT, /L\.opacityMul\.a \* 0\.5/);
  assert.match(SPAWNER_GRAYSCALE_FRAGMENT, /vec4f\(vec3f\(luminance\), alpha\)/);
  assert.equal(SPAWNER_MARKER_ORDER < GAME_DEPTH.npcs, true);
  assert.equal(calls[0][2].visible, false);
  assert.equal(calls[0][2].order, SPAWNER_MARKER_ORDER);
  assert.deepEqual(calls[0][2].pivot, [0.5, 0.5]);
  assert.equal(calls[0][2].customShader.options.fragment, SPAWNER_GRAYSCALE_FRAGMENT);
  assert.deepEqual(calls[1][2], {
    positionPx: [224, 480],
    sizePx: [96, 96],
    frame: 0,
  });
  assert.equal("collider" in marker, false);
});

test("marker visibility and viewport scale are presentation-only controls", () => {
  const layer = { visible: false, view: { zoom: 1 } };
  const marker = createSpawnerMarker({
    atlas: {},
    worldPosition: { x: 10, y: 20 },
    boundsHeight: 100,
    gridSize: 64,
    frameSize: { width: 128, height: 128 },
    api: {
      createSprite2DCustomShader: () => ({}),
      createSprite2DLayer: () => layer,
      addSprite2D: () => ({}),
    },
  });

  marker.setVisible(true);
  marker.setViewportScale(1.5);
  assert.equal(layer.visible, true);
  assert.equal(layer.view.zoom, 1.5);
});
