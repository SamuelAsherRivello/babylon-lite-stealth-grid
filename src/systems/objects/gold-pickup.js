import { addSprite2D, createSprite2DLayer, removeSprite2D, updateSprite2D } from "@babylonjs/lite";
import { getYSortedLayerOrder } from "../environment/render-depth.js";

const DEFAULT_API = { addSprite2D, createSprite2DLayer, removeSprite2D, updateSprite2D };
const SPAWN_SECONDS = 0.35;
const PICKUP_ANIMATION_SECONDS = 0.18;
const PICKUP_ANIMATION_RISE = 50;
function getSpritePosition(position, screenHeight) {
  return [position.x, screenHeight - position.y];
}

export function getNineGridOffsets() {
  return [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }];
}

export function chooseNineGridDestinations(origin, count, isValid = () => true, random = Math.random) {
  const choices = getNineGridOffsets().filter((offset) => isValid({ x: origin.x + offset.x, y: origin.y + offset.y }));
  for (let i = choices.length - 1; i > 0; i -= 1) { const j = Math.floor(random() * (i + 1)); [choices[i], choices[j]] = [choices[j], choices[i]]; }
  return choices.slice(0, Math.min(count, choices.length)).map((offset) => ({ x: origin.x + offset.x, y: origin.y + offset.y }));
}

export function createPickup({ type = "pickup", id = "pickup", object = { id }, atlas = null, startPosition, destination, screenHeight = 1024, api = DEFAULT_API }) {
  const layer = api.createSprite2DLayer(atlas, {
    capacity: 1,
    order: getYSortedLayerOrder(startPosition.y, screenHeight),
    pivot: [0.5, 0.5],
  });
  const sprite = api.addSprite2D(layer, { positionPx: getSpritePosition(startPosition, screenHeight), sizePx: [64, 64], frame: 0, alpha: 0, scaleX: 0.1, scaleY: 0.1 });
  let elapsed = 0; let state = "spawning";
  const start = { ...startPosition }; const end = { x: destination.x, y: destination.y };
  return {
    layer, sprite, type, id: `${type}-${object.id}`,
    get isAlive() { return state !== "dead"; }, get isSpawning() { return state === "spawning"; }, get isPickingUp() { return state === "pickingUp"; }, get isDying() { return state === "pickingUp"; }, get isDead() { return state === "dead"; },
    getCombatCollider() {
      return this.isAlive
        ? { x: this.position.x - 12, y: this.position.y - 12, width: 24, height: 24 }
        : null;
    },
    getMovementCollider() { return null; },
    // Collection uses the non-blocking combat collider; pickups have no
    // movement collider and therefore never obstruct player movement.
    getCollider() { return this.getCombatCollider(); },
    position: { ...start },
    collect() { if (!this.isAlive) return false; state = "pickingUp"; elapsed = 0; return true; },
    update(deltaSeconds = 0) {
      elapsed += Math.max(0, deltaSeconds);
      if (state === "spawning") {
        const t = Math.min(1, elapsed / SPAWN_SECONDS); const smooth = t * t * (3 - 2 * t);
        this.position = { x: start.x + (end.x - start.x) * smooth, y: start.y + (end.y - start.y) * smooth + Math.sin(Math.PI * t) * 64 };
        api.updateSprite2D(sprite, { positionPx: getSpritePosition(this.position, screenHeight), alpha: smooth, scaleX: 0.1 + 0.9 * smooth, scaleY: 0.1 + 0.9 * smooth });
        if (t >= 1) state = "landed";
      } else if (state === "pickingUp") {
        const progress = Math.min(1, elapsed / PICKUP_ANIMATION_SECONDS);
        const opacity = 1 - progress;
        api.updateSprite2D(sprite, {
          positionPx: getSpritePosition({ x: this.position.x, y: start.y + PICKUP_ANIMATION_RISE * progress }, screenHeight),
          alpha: opacity,
        });
        if (progress >= 1) { state = "dead"; layer.visible = false; api.removeSprite2D(sprite); }
      }
    },
    dispose() { api.removeSprite2D(sprite); },
  };
}

export function createGoldPickup(options) {
  return createPickup({ ...options, type: "GoldPickup" });
}
