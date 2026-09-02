import {
  addSprite2D,
  createSprite2DLayer,
  playSprite2DAnimation,
  removeSprite2D,
  stopSpriteAnimation,
  updateSprite2D,
} from "@babylonjs/lite";
import { createGridAlignedMovementController } from "../gameplay/game-logic.js";

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
  obstacles = [],
  movementSpeed = 120,
  api = { addSprite2D, createSprite2DLayer, playSprite2DAnimation, removeSprite2D, stopSpriteAnimation, updateSprite2D },
}) {
  let position = { ...initialPosition };
  let activeAnimation = null;
  let animationManager = null;
  let currentAnimation = null;
  let artYOffset = 0;
  let disposed = false;
  let movementIntent = { x: 0, y: 0 };
  let heading = "right";
  const layers = {};
  const sprites = {};
  const gridMovement = createGridAlignedMovementController(
    { frame: definition.frame, pivot: { x: 0.5, y: 1 - tileSize / 2 / definition.frame.height }, collider: { type: "circle", x: definition.frame.width / 2, y: definition.frame.height - tileSize / 2, radius: definition.movementCollider.radius } },
    tileSize,
  );

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
      // The definition owns placement. Animation descriptors may retain
      // legacy atlas metadata, but must not move the runtime character.
      pivot: [0.5, 1 - tileSize / 2 / definition.frame.height],
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
    setMovementIntent(intent) {
      movementIntent = { x: intent.x, y: intent.y };
      if (Math.abs(movementIntent.y) > Math.abs(movementIntent.x) && movementIntent.y !== 0) {
        heading = movementIntent.y < 0 ? "up" : "down";
      } else if (movementIntent.x !== 0) {
        heading = movementIntent.x < 0 ? "left" : "right";
      }
    },
    getHeading: () => heading,
    update(deltaSeconds) {
      const movement = movementIntent;
      position = gridMovement.move(position, movement, movementSpeed * Math.max(0, deltaSeconds), deltaSeconds, bounds, obstacles);
      if (movement.x !== 0 || movement.y !== 0) {
        if (sprites.walking) this.playAnimation("walking");
      } else this.playAnimation("idle");
      updateSprites();
      return { position: { ...position }, state: movement.x || movement.y ? "walking" : "idle" };
    },
    getGridPosition: (size) => ({
      x: Math.floor(position.x / size), y: Math.floor(position.y / size),
    }),
    setArtYOffset(value) { artYOffset = Number.isFinite(value) ? value : 0; updateSprites(); },
    setVisualTransform(patch) { updateSprites(patch); },
    playAnimation(name) {
      if (!animationManager || disposed || !sprites[name]) return;
      if (currentAnimation === name) return;
      currentAnimation = name;
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
