import { addSprite2D, createSprite2DLayer, playSprite2DAnimation, removeSprite2D, stopSpriteAnimation, updateSprite2D } from "@babylonjs/lite";
import { getYSortedLayerOrder } from "../environment/render-depth.js";

const DEFAULT_API = { addSprite2D, createSprite2DLayer, playSprite2DAnimation, removeSprite2D, stopSpriteAnimation, updateSprite2D };
const DEATH_SECONDS = 0.25;

export function createGoldStone({ object, atlas = null, animationManager = null, screenHeight = 1024, random = Math.random, onDeathComplete = () => {}, api = DEFAULT_API }) {
  const descriptor = object.goldStone;
  const layer = api.createSprite2DLayer(atlas, { capacity: 1, order: getYSortedLayerOrder(object.position.y, screenHeight), pivot: [0.5, 1] });
  const sprite = api.addSprite2D(layer, {
    positionPx: [object.position.x, screenHeight - object.position.y],
    sizePx: [descriptor.frameSize.width, descriptor.frameSize.height], frame: 0,
  });
  let health = 1; let dying = false; let dead = false; let elapsed = 0; let idleRemaining = 5 + random() * 5; let animation = null;
  const rotation = Math.PI / 9;
  return {
    layer, sprite, type: "GoldObject", id: `gold-object-${object.id}`,
    position: { ...object.position },
    get health() { return health; }, get isAlive() { return !dying && !dead; },
    get isDying() { return dying; }, get isDead() { return dead; },
    getCombatCollider() { return this.isAlive ? descriptor.combatCollider : null; },
    applyDamage(amount) { if (!this.isAlive || amount <= 0) return false; health = 0; dying = true; return true; },
    update(deltaSeconds = 0) {
      if (this.isAlive && animationManager && !animation) {
        idleRemaining -= Math.max(0, deltaSeconds);
        if (idleRemaining <= 0) {
          animation = api.playSprite2DAnimation(animationManager, sprite, 0, descriptor.frameCount - 1, false, 100, { onEnd: () => { animation = null; idleRemaining = 5 + random() * 5; } });
        }
      }
      if (!dying) return;
      elapsed += Math.max(0, deltaSeconds);
      const value = 1 - Math.min(1, elapsed / DEATH_SECONDS);
      api.updateSprite2D(sprite, { scaleX: value, scaleY: value, alpha: value, rotation: rotation * (1 - value), sizePx: [descriptor.frameSize.width * value, descriptor.frameSize.height * value] });
      if (value <= 0) { dying = false; dead = true; layer.visible = false; api.removeSprite2D(sprite); onDeathComplete({ ...object.position }); }
    },
    dispose() { if (animation) api.stopSpriteAnimation(animation); if (!dead) api.removeSprite2D(sprite); },
  };
}
