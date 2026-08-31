import {
  addSprite2D,
  createSprite2DCustomShader,
  createSprite2DLayer,
} from "@babylonjs/lite";

import { worldToScreen } from "./game-logic.js";
import { GAME_DEPTH } from "./render-depth.js";

export const SPAWNER_MARKER_ORDER = GAME_DEPTH.npcs - 1;
export const SPAWNER_GRAYSCALE_FRAGMENT = `
let sampled = textureSample(atlasTex, atlasSamp, in.uv);
let luminance = dot(sampled.rgb, vec3f(0.2126, 0.7152, 0.0722));
let alpha = sampled.a * in.tint.a * L.opacityMul.a * 0.5;
return vec4f(vec3f(luminance), alpha);
`;

const DEFAULT_API = {
  addSprite2D,
  createSprite2DCustomShader,
  createSprite2DLayer,
};

export function createSpawnerMarker({
  atlas,
  worldPosition,
  boundsHeight,
  gridSize,
  frameSize,
  api = DEFAULT_API,
}) {
  const customShader = api.createSprite2DCustomShader({
    fragment: SPAWNER_GRAYSCALE_FRAGMENT,
  });
  const layer = api.createSprite2DLayer(atlas, {
    capacity: 1,
    order: SPAWNER_MARKER_ORDER,
    pivot: [0.5, 0.5],
    visible: false,
    customShader,
  });
  const markerWorldPosition = {
    x: Math.floor(worldPosition.x / gridSize) * gridSize + gridSize / 2,
    y: Math.floor(worldPosition.y / gridSize) * gridSize + gridSize / 2,
  };
  const screenPosition = worldToScreen(markerWorldPosition, 1, boundsHeight);
  const sprite = api.addSprite2D(layer, {
    positionPx: [screenPosition.x, screenPosition.y],
    sizePx: [frameSize.width * 0.5, frameSize.height * 0.5],
    frame: 0,
  });

  return {
    layer,
    sprite,
    setVisible(visible) {
      layer.visible = Boolean(visible);
    },
    setViewportScale(scale) {
      layer.view.zoom = scale;
    },
  };
}
