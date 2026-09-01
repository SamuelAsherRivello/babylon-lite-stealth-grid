import {
  addSprite2D,
  createSprite2DLayer,
  playSprite2DAnimation,
  removeSprite2D,
  stopSpriteAnimation,
  updateSprite2D,
} from "@babylonjs/lite";

import {
  getCharacterArtTransform,
  getCharacterCombatCollider,
  getCharacterMovementCollider,
} from "./character-contract.js";
import { getCharacterLayerOrder } from "./character-spatial.js";

export function createSharedCharacterActor({
  definition,
  atlases,
  bounds,
  initialPosition,
  tileSize,
  api = { addSprite2D, createSprite2DLayer, playSprite2DAnimation, removeSprite2D, stopSpriteAnimation, updateSprite2D },
}) {
  let position = { ...initialPosition };
  let activeAnimation = null;
  let animationManager = null;
  let artYOffset = 0;
  let disposed = false;
  const layers = {};
  const sprites = {};

  function transform(size = definition.displaySize) {
    const result = getCharacterArtTransform(position, definition, bounds.height, tileSize, size);
    result.positionPx[1] += artYOffset;
    return result;
  }

  function updateSprites(patch = {}) {
    const order = getCharacterLayerOrder(
      getCharacterMovementCollider(position, definition),
      bounds.height,
    );
    const visual = transform(patch.sizePx
      ? { width: patch.sizePx[0], height: patch.sizePx[1] }
      : definition.displaySize);
    for (const layer of Object.values(layers)) layer.order = order;
    for (const sprite of Object.values(sprites)) {
      api.updateSprite2D(sprite, {
        positionPx: visual.positionPx,
        ...patch,
      });
    }
  }

  for (const [name, descriptor] of Object.entries(definition.animations ?? {})) {
    const layer = api.createSprite2DLayer(atlases[name], {
      capacity: 1,
      order: getCharacterLayerOrder(getCharacterMovementCollider(position, definition), bounds.height),
      pivot: [...(descriptor.pivot ?? [definition.artPivot.x, definition.artPivot.y])],
      visible: name === "idle",
    });
    layers[name] = layer;
    sprites[name] = api.addSprite2D(layer, {
      ...transform(),
      frame: 0,
    });
  }

  return {
    layers: Object.values(layers),
    getPosition: () => ({ ...position }),
    setPosition(next) { position = { ...next }; updateSprites(); },
    getMovementCollider: () => getCharacterMovementCollider(position, definition),
    getCombatCollider: () => getCharacterCombatCollider(position, tileSize),
    getGridPosition: (size) => ({
      x: Math.floor(position.x / size), y: Math.floor(position.y / size),
    }),
    setArtYOffset(value) { artYOffset = Number.isFinite(value) ? value : 0; updateSprites(); },
    setVisualTransform(patch) { updateSprites(patch); },
    playAnimation(name) {
      if (!animationManager || disposed || !sprites[name]) return;
      if (activeAnimation) api.stopSpriteAnimation(activeAnimation);
      for (const [layerName, layer] of Object.entries(layers)) layer.visible = layerName === name;
      const descriptor = definition.animations[name];
      activeAnimation = api.playSprite2DAnimation(animationManager, sprites[name], 0,
        descriptor.frameCount - 1, descriptor.loop, descriptor.frameDurationMs);
      updateSprites();
    },
    setAnimationManager(manager) { animationManager = manager; },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (activeAnimation) api.stopSpriteAnimation(activeAnimation);
      for (const sprite of Object.values(sprites)) api.removeSprite2D(sprite);
      for (const layer of Object.values(layers)) layer.visible = false;
    },
  };
}
