import { addSprite2D, createSprite2DLayer, loadSpriteAtlas, playSprite2DAnimation, removeSprite2D, stopSpriteAnimation, updateSprite2D } from "@babylonjs/lite";
import { getCharacterCollider, moveWithCollisions, worldToScreen } from "../../../gameplay/game-logic.js";
import { getCharacterGridCell, getCharacterLayerOrder } from "../../character-spatial.js";
import { MONK_ANIMATION_CATALOG, MONK_ANIMATION_NAMES } from "./monk-animation-catalog.js";

export const MONK_FRAME = Object.freeze({ width: 192, height: 192 });
export const MONK_PIVOT = Object.freeze({ x: 0.5, y: 0.84 });
export const MONK_ART_OFFSET = Object.freeze({ x: 0, y: 0 });
export const MONK_MOVEMENT_COLLIDER = Object.freeze({ type: "circle", x: 96, y: 161.28, radius: 24 });
export const MONK_COMBAT_COLLIDER = Object.freeze({ x: 64, y: 97.28, width: 64, height: 64 });
const api = { addSprite2D, createSprite2DLayer, loadSpriteAtlas, playSprite2DAnimation, removeSprite2D, stopSpriteAnimation, updateSprite2D };

export async function loadMonkAtlases(engine, runtimeApi = api) {
  return Object.fromEntries(await Promise.all(MONK_ANIMATION_NAMES.map(async (name) => [name, await runtimeApi.loadSpriteAtlas(engine, MONK_ANIMATION_CATALOG[name].imageUrl, { gridSize: [192, 192], sampling: "nearest" })])));
}

export function createMonk({ atlases, initialPosition, bounds, obstacles = [], movementSpeed = 100, runtimeApi = api }) {
  let position = { ...initialPosition }; let intent = { x: 0, y: 0 }; let facing = 1; let manager = null; let active = null; let disposed = false;
  const character = { frame: MONK_FRAME, pivot: MONK_PIVOT, collider: MONK_MOVEMENT_COLLIDER }; const layers = {}; const sprites = {};
  const screen = (p) => worldToScreen({ x: p.x + MONK_ART_OFFSET.x, y: p.y + MONK_ART_OFFSET.y }, 1, bounds.height); const update = () => { const p = screen(position); const order = getCharacterLayerOrder(getCharacterCollider(position, MONK_FRAME, MONK_PIVOT, MONK_MOVEMENT_COLLIDER), bounds.height); Object.values(layers).forEach((l) => { l.order = order; }); Object.values(sprites).forEach((s) => runtimeApi.updateSprite2D(s, { positionPx: [p.x, p.y], flipX: facing < 0 })); };
  for (const name of MONK_ANIMATION_NAMES) { const l = runtimeApi.createSprite2DLayer(atlases[name], { capacity: 1, order: 0, pivot: [0.5, 0.84], visible: name === "idle" }); layers[name] = l; sprites[name] = runtimeApi.addSprite2D(l, { positionPx: [0, 0], sizePx: [192, 192], frame: 0 }); }
  const play = (name) => { if (!manager || disposed) return; if (active) runtimeApi.stopSpriteAnimation(active); Object.entries(layers).forEach(([key, layer]) => { layer.visible = key === name; }); const d = MONK_ANIMATION_CATALOG[name]; active = runtimeApi.playSprite2DAnimation(manager, sprites[name], 0, d.frameCount - 1, d.loop, d.frameDurationMs, d.loop ? undefined : { onEnd: () => play("idle") }); update(); };
  update();
  return { layers: Object.values(layers), getMovementCollider: () => getCharacterCollider(position, MONK_FRAME, MONK_PIVOT, MONK_MOVEMENT_COLLIDER), getCombatCollider: () => getCharacterCollider(position, MONK_FRAME, MONK_PIVOT, MONK_COMBAT_COLLIDER), getPosition: () => ({ ...position }), getGridPosition: (size) => getCharacterGridCell(getCharacterCollider(position, MONK_FRAME, MONK_PIVOT, MONK_MOVEMENT_COLLIDER), size), playAnimation: (m) => { manager = m; play("idle"); }, playHeal: () => play("heal"), playHealEffect: () => play("heal-effect"), setMovementIntent: () => {}, update: () => { update(); return { position: { ...position }, state: "idle" }; }, setVisualTransform: (transform) => Object.values(sprites).forEach((s) => runtimeApi.updateSprite2D(s, transform)), applyKnockback: () => {}, dispose: () => { if (disposed) return; disposed = true; if (active) runtimeApi.stopSpriteAnimation(active); Object.values(sprites).forEach((s) => runtimeApi.removeSprite2D(s)); Object.values(layers).forEach((l) => { l.visible = false; }); } };
}
