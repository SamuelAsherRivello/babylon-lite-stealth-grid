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
  let health = 100;
  let isAlive = true;
  let isDying = false;
  let isDead = false;
  let firePlaying = false;
  let deathElapsed = 0;
  const deathRotation = (Math.random() < 0.5 ? -1 : 1) * 20 * Math.PI / 180;
  const acceptedTypes = new Set(descriptor.acceptedCharacterTypes);
  const interactionPosition = getColliderCenter(descriptor.combatCollider);

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
    get health() { return health; },
    get isAlive() { return isAlive; },
    get isDying() { return isDying; },
    get isDead() { return isDead; },
    get firePlaying() { return firePlaying; },
    get id() { return `bush-${object.id}`; },
    get position() { return { ...object.position }; },
    get interactionPosition() { return { ...interactionPosition }; },
    get cell() {
      return {
        x: Math.floor(interactionPosition.x / tileSize),
        y: Math.floor(interactionPosition.y / tileSize),
      };
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
      if (fireEffect) fireEffect.layer.view.zoom = scale;
    },
    update(characters, deltaSeconds = 0) {
      if (disposed) return;
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
      if (fireEffect) fireEffect.dispose();
      occupants.clear();
      animation = null;
      playing = false;
    },
  };
}
