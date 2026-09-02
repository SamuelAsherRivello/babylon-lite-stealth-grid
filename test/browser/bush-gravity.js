import { createEngine, createSpriteRenderer, registerSpriteRenderer, startEngine } from '@babylonjs/lite';
import { createPlayer, loadPlayerAtlases } from '../../src/characters/player/player.js';
import { collidersOverlap } from '../../src/gameplay/game-logic.js';
const canvas = document.querySelector('canvas');
const engine = await createEngine(canvas, { maxDevicePixelRatio: 1 });
engine._w = 576; engine._h = 640;
const atlases = await loadPlayerAtlases(engine);
const bush = { id: 'test', isAlive: true, interactionPosition: { x: 288, y: 320 }, getCombatCollider: () => ({ x:256, y:288, width:64, height:64 }) };
let actor;
function reset(position = { x:268, y:300 }) {
  actor?.dispose();
  actor = createPlayer({ atlases, bounds: { width:576, height:640 }, obstacles: [], initialPosition: position });
  registerSpriteRenderer(createSpriteRenderer(engine, { layers: actor.layers, clearValue:{r:.08,g:.16,b:.1,a:1} }));
}
reset();
await startEngine(engine);
function observe() { actor.observeHidingBushes(bush.isAlive && collidersOverlap(actor.getCombatCollider(), bush.getCombatCollider()) ? [bush] : []); }
function snapshot() { const result = { position:actor.getPosition(), active:actor.isGravityMoving(), hidden:collidersOverlap(actor.getCombatCollider(),bush.getCombatCollider()), cell:actor.getGridPosition(64) }; document.querySelector('#result').textContent=JSON.stringify(result); return result; }
window.gravityTest = { reset, observe, snapshot, step(delta, colliders=[]) { actor.update(delta,colliders); observe(); return snapshot(); }, move(position) { actor.setPosition(position); observe(); }, knockback() { actor.applyKnockback({x:-1,y:0}); }, disable() { actor.setInputEnabled(false); }, bush };
observe(); snapshot();
