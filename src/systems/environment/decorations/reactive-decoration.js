import {
  addSprite2D,
  createSprite2DLayer,
  playSprite2DAnimation,
  removeSprite2D,
  stopSpriteAnimation,
  updateSprite2D,
} from "@babylonjs/lite";

import { collidersOverlap } from "../../../gameplay/game-logic.js";
import { getColliderCenter } from "../../../characters/character-spatial.js";
import { getYSortedLayerOrder } from "../render-depth.js";
import { GridSpot } from "../grid-spot.js";
import { createBushLeaves } from "../../../particle-fx/bush-leaves.js";

export const REACTIVE_DECORATION_PIVOT = Object.freeze({ x: 0.5, y: 0.84 });
// Keep artwork independently offset from the shared collider anchor.
export const REACTIVE_DECORATION_ART_OFFSET = Object.freeze({ x: 0, y: -52 });

const DEFAULT_API = {
  addSprite2D,
  collidersOverlap,
  createSprite2DLayer,
  playSprite2DAnimation,
  removeSprite2D,
  stopSpriteAnimation,
  updateSprite2D,
};

export function getCenteredEffectPosition({
  position,
  frameSize,
  effectSize,
  screenHeight,
}) {
  return [
    position.x - effectSize.width / 2,
    screenHeight - position.y - frameSize.height / 2 - effectSize.height / 2,
  ];
}

export function createReactiveDecoration({
  object,
  atlas,
  animationManager,
  screenHeight,
  tileSize = 64,
  fireEffect = null,
  leafAtlas = null,
  onCharacterEnter = () => {},
  api = DEFAULT_API,
}) {
  const descriptor = object.decoration;
  const layer = api.createSprite2DLayer(atlas, {
    capacity: 1,
    order: getYSortedLayerOrder(object.position.y, screenHeight),
    pivot: [REACTIVE_DECORATION_PIVOT.x, REACTIVE_DECORATION_PIVOT.y],
  });
  const sprite = api.addSprite2D(layer, {
    positionPx: [
      object.position.x + REACTIVE_DECORATION_ART_OFFSET.x,
      screenHeight - (object.position.y + REACTIVE_DECORATION_ART_OFFSET.y),
    ],
    sizePx: [descriptor.frameSize.width, descriptor.frameSize.height],
    frame: descriptor.idleFrame,
  });
  let occupants = new Set();
  const leafEffect = leafAtlas ? createBushLeaves({
    atlas: leafAtlas,
    position: [
      object.position.x + REACTIVE_DECORATION_ART_OFFSET.x + (0.5 - REACTIVE_DECORATION_PIVOT.x) * descriptor.frameSize.width,
      screenHeight - (object.position.y + REACTIVE_DECORATION_ART_OFFSET.y) + (0.5 - REACTIVE_DECORATION_PIVOT.y) * descriptor.frameSize.height,
    ],
    order: layer.order + 0.1,
    api,
  }) : null;
  let armed = true;
  let playing = false;
  let animation = null;
  let disposed = false;
  let health = 100;
  let isAlive = true;
  let isDying = false;
  let isDead = false;
  let firePlaying = false;
  let deathElapsed = 0;
  const deathRotation = (Math.random() < 0.5 ? -1 : 1) * 20 * Math.PI / 180;
  const acceptedTypes = new Set(descriptor.acceptedCharacterTypes);
  const interactionPosition = getColliderCenter(descriptor.combatCollider);
  const gridSpot = new GridSpot(interactionPosition, { width: tileSize, height: tileSize });

  function startAnimation() {
    if (!armed || playing || disposed) return false;
    armed = false;
    playing = true;
    leafEffect?.burst();
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
    layers: [layer, ...(leafEffect ? [leafEffect.layer] : [])],
    sprite,
    sensor: descriptor.sensor,
    getMovementCollider() { return descriptor.sensor; },
    get armed() { return armed; },
    get playing() { return playing; },
    get occupantCount() { return occupants.size; },
    get health() { return health; },
    get isAlive() { return isAlive; },
    get isDying() { return isDying; },
    get isDead() { return isDead; },
    get firePlaying() { return firePlaying; },
    get id() { return `bush-${object.id}`; },
    get position() { return { ...object.position }; },
    getGridSpot() { return gridSpot; },
    get interactionPosition() { return { ...interactionPosition }; },
    get cell() {
      return { ...gridSpot.cell };
    },
    getCombatCollider() {
      return isAlive ? descriptor.combatCollider : null;
    },
    getSnapshot() {
      return {
        id: `bush-${object.id}`,
        type: "bush",
        position: { ...interactionPosition },
        cell: this.cell,
        isAlive,
        isBurning: firePlaying,
        combatCollider: this.getCombatCollider(),
        applyFireDamage: (amount) => this.applyFireDamage(amount),
      };
    },
    applyFireDamage(amount) {
      if (!isAlive || firePlaying || amount <= 0) return false;
      health = Math.max(0, health - amount);
      if (health === 0) isAlive = false;
      firePlaying = true;
      if (fireEffect) {
        fireEffect.layer.visible = true;
        fireEffect.playOnce(() => {
          if (disposed) return;
          firePlaying = false;
          fireEffect.layer.visible = false;
          if (health === 0) isDying = true;
        });
      } else {
        firePlaying = false;
        if (health === 0) isDying = true;
      }
      return true;
    },
    setViewportScale(scale) {
      layer.view.zoom = scale;
      if (leafEffect) leafEffect.layer.view.zoom = scale;
      if (fireEffect) fireEffect.layer.view.zoom = scale;
    },
    update(characters, deltaSeconds = 0) {
      if (disposed) return;
      leafEffect?.update(deltaSeconds);
      if (isDying) {
        deathElapsed += Math.max(0, deltaSeconds);
        const progress = Math.min(1, deathElapsed / 0.25);
        const value = 1 - progress;
        api.updateSprite2D(sprite, {
          sizePx: [descriptor.frameSize.width * value, descriptor.frameSize.height * value],
          scaleX: value, scaleY: value, alpha: value,
          rotation: deathRotation * progress,
        });
        if (progress >= 1) {
          isDying = false;
          isDead = true;
          layer.visible = false;
          api.removeSprite2D(sprite);
          if (fireEffect) fireEffect.dispose();
        }
        return;
      }
      if (!isAlive) return;
      const nextOccupants = new Set();
      for (const character of characters) {
        if (!acceptedTypes.has(character.type) || !character.collider) continue;
        if (api.collidersOverlap(descriptor.sensor, character.collider)) {
          nextOccupants.add(character.id);
          if (!occupants.has(character.id)) onCharacterEnter(character);
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
      leafEffect?.dispose();
      if (animation) api.stopSpriteAnimation(animation);
      api.removeSprite2D(sprite);
      if (fireEffect) fireEffect.dispose();
      occupants.clear();
      animation = null;
      playing = false;
    },
  };
}
