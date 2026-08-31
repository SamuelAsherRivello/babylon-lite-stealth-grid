import { addSprite2D, createSprite2DLayer, loadSpriteAtlas, playSprite2DAnimation, removeSprite2D, updateSprite2D } from "@babylonjs/lite";
import { getCharacterCollider, worldToScreen } from "../../game-logic.js";
import { getYSortedLayerOrder } from "../../render-depth.js";

export const ARCHER_FRAME = Object.freeze({ width: 192, height: 192 });
export const ARCHER_PIVOT = Object.freeze({ x: 0.5, y: 0.84 });
export const ARCHER_MOVEMENT_COLLIDER = Object.freeze({ type: "circle", x: 96, y: 123, radius: 24 });
export const ARCHER_COMBAT_COLLIDER = Object.freeze({ x: 60, y: 40, width: 72, height: 112 });
const ANIMS = Object.freeze({ idle: ["Archer_Idle.png", 6, true], walking: ["Archer_Run.png", 6, true], shooting: ["Archer_Shoot.png", 6, false] });

export async function loadArcherAtlases(engine) {
  return Object.fromEntries(await Promise.all(Object.entries(ANIMS).map(async ([name, [file]]) => [name, await loadSpriteAtlas(engine, `./assets/units/archer/${file}`, { gridSize: [192, 192], sampling: "nearest" })])));
}

export function createArcher({ atlases, initialPosition, bounds }) {
  let position = { ...initialPosition }; let disposed = false; let manager = null; let active = null; let state = "idle";
  const layers = {}; const sprites = {};
  for (const [name] of Object.entries(ANIMS)) {
    const layer = createSprite2DLayer(atlases[name], { capacity: 1, order: getYSortedLayerOrder(position.y, bounds.height), pivot: [0.5, 0.84], visible: name === "idle" });
    layers[name] = layer; const screen = worldToScreen(position, 1, bounds.height); sprites[name] = addSprite2D(layer, { positionPx: [screen.x, screen.y], sizePx: [192, 192], frame: 0 });
  }
  function play(name) { state = name; if (!manager || disposed) return; if (active) active.stop?.(); Object.entries(layers).forEach(([key, layer]) => { layer.visible = key === name; }); const [, count, loop] = ANIMS[name]; active = playSprite2DAnimation(manager, sprites[name], 0, count - 1, loop, 100, loop ? undefined : { onEnd: () => play("idle") }); }
  return { layers: Object.values(layers), get state() { return state; }, get isAttacking() { return state === "shooting"; }, getPosition: () => ({ ...position }), getMovementCollider: () => getCharacterCollider(position, ARCHER_FRAME, ARCHER_PIVOT, ARCHER_MOVEMENT_COLLIDER), getCombatCollider: () => getCharacterCollider(position, ARCHER_FRAME, ARCHER_PIVOT, ARCHER_COMBAT_COLLIDER), getGridPosition: () => ({ x: Math.floor(position.x / 64), y: Math.floor(position.y / 64) }), playAnimation(m) { manager = m; play("idle"); }, setMovementIntent() {}, update() {}, shoot() { play("shooting"); return true; }, setVisualTransform(transform) { Object.values(sprites).forEach((sprite) => updateSprite2D(sprite, transform)); }, applyKnockback() {}, dispose() { if (disposed) return; disposed = true; Object.values(sprites).forEach(removeSprite2D); Object.values(layers).forEach((layer) => { layer.visible = false; }); } };
}
