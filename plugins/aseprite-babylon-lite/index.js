function assertPositiveInteger(value, field) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${field} must be a positive integer.`);
  }
}

function assertPair(value, field) {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new TypeError(`${field} must be a two-number array.`);
  }
  value.forEach((entry) => assertPositiveInteger(entry, field));
}

export function validateAsepriteSpriteDescriptor(descriptor) {
  if (!descriptor || typeof descriptor !== "object") {
    throw new TypeError("descriptor must be an object.");
  }
  if (typeof descriptor.name !== "string" || descriptor.name.length === 0) {
    throw new TypeError("name must be a non-empty string.");
  }
  if (typeof descriptor.imageUrl !== "string" || descriptor.imageUrl.length === 0) {
    throw new TypeError("imageUrl must be a non-empty string.");
  }
  assertPair(descriptor.gridSize, "gridSize");
  assertPair(descriptor.displaySize, "displaySize");
  assertPositiveInteger(descriptor.frameCount, "frameCount");
  assertPositiveInteger(descriptor.frameDurationMs, "frameDurationMs");
  if (descriptor.direction !== "forward") {
    throw new TypeError("direction must be forward.");
  }
  if (typeof descriptor.loop !== "boolean") {
    throw new TypeError("loop must be a boolean.");
  }
  return descriptor;
}

export async function loadAsepriteSpriteAtlas(
  engine,
  descriptor,
  api = BABYLON_LITE_SPRITE_API,
) {
  validateAsepriteSpriteDescriptor(descriptor);
  return api.loadSpriteAtlas(engine, descriptor.imageUrl, {
    gridSize: [...descriptor.gridSize],
    sampling: descriptor.sampling ?? "nearest",
  });
}

export function createAsepriteSpriteInstance({
  atlas,
  descriptor,
  position,
  order = 0,
  visible,
  api = BABYLON_LITE_SPRITE_API,
}) {
  validateAsepriteSpriteDescriptor(descriptor);
  const layerOptions = {
    capacity: 1,
    order,
    pivot: [...(descriptor.pivot ?? [0, 0])],
  };
  if (visible !== undefined) {
    layerOptions.visible = visible;
  }
  const layer = api.createSprite2DLayer(atlas, layerOptions);
  const sprite = api.addSprite2D(layer, {
    positionPx: [...position],
    sizePx: [...descriptor.displaySize],
    frame: 0,
  });

  return { layer, sprite };
}
import {
  addSprite2D,
  createSprite2DLayer,
  loadSpriteAtlas,
  playSprite2DAnimation,
  playSpriteFrameAnimation,
  stopSpriteAnimation,
} from "@babylonjs/lite";

export const BABYLON_LITE_SPRITE_API = Object.freeze({
  addSprite2D,
  createSprite2DLayer,
  loadSpriteAtlas,
  playSprite2DAnimation,
  playSpriteFrameAnimation,
  stopSpriteAnimation,
});
