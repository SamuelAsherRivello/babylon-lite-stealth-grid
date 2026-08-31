import {
  addSprite2D,
  createSprite2DLayer,
  playSprite2DAnimation,
  removeSprite2D,
  stopSpriteAnimation,
  updateSprite2D,
} from "@babylonjs/lite";

import { collidersOverlap } from "../game-logic.js";
import { getYSortedLayerOrder } from "../render-depth.js";

const DEFAULT_API = {
  addSprite2D,
  collidersOverlap,
  createSprite2DLayer,
  playSprite2DAnimation,
  removeSprite2D,
  stopSpriteAnimation,
  updateSprite2D,
};

export function createReactiveDecoration({
  object,
  atlas,
  animationManager,
  screenHeight,
  api = DEFAULT_API,
}) {
  const descriptor = object.decoration;
  const layer = api.createSprite2DLayer(atlas, {
    capacity: 1,
    order: getYSortedLayerOrder(object.position.y, screenHeight),
    pivot: [0.5, 1],
  });
  const sprite = api.addSprite2D(layer, {
    positionPx: [object.position.x, screenHeight - object.position.y],
    sizePx: [descriptor.frameSize.width, descriptor.frameSize.height],
    frame: descriptor.idleFrame,
  });
  let occupants = new Set();
  let armed = true;
  let playing = false;
  let animation = null;
  let disposed = false;
  const acceptedTypes = new Set(descriptor.acceptedCharacterTypes);

  function startAnimation() {
    if (!armed || playing || disposed) return false;
    armed = false;
    playing = true;
    animation = api.playSprite2DAnimation(
      animationManager,
      sprite,
      descriptor.idleFrame,
      descriptor.frameCount - 1,
      false,
      descriptor.frameDurationMs,
      {
        onEnd: () => {
          if (disposed) return;
          playing = false;
          animation = null;
          if (descriptor.resetAfterPlay) {
            api.updateSprite2D(sprite, { frame: descriptor.idleFrame });
          }
        },
      },
    );
    return true;
  }

  return {
    layer,
    sprite,
    sensor: descriptor.sensor,
    get armed() { return armed; },
    get playing() { return playing; },
    get occupantCount() { return occupants.size; },
    update(characters) {
      if (disposed) return;
      const nextOccupants = new Set();
      for (const character of characters) {
        if (!acceptedTypes.has(character.type) || !character.collider) continue;
        if (api.collidersOverlap(descriptor.sensor, character.collider)) {
          nextOccupants.add(character.id);
        }
      }
      const entered = [...nextOccupants].some((id) => !occupants.has(id));
      occupants = nextOccupants;
      if (occupants.size === 0 && descriptor.rearmOnExit) armed = true;
      if (entered) startAnimation();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (animation) api.stopSpriteAnimation(animation);
      api.removeSprite2D(sprite);
      occupants.clear();
      animation = null;
      playing = false;
    },
  };
}
