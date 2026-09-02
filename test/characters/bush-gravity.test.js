import test from 'node:test';
import assert from 'node:assert/strict';
import { createBushGravity } from '../../src/characters/player/bush-gravity.js';
const bush = { id:'a', isAlive:true, interactionPosition:{x:100,y:80} };
const start = {x:80,y:60};
test('minimum distance is 75% of grid width and allows approach strictly inside that distance', () => {
  for (const gridWidth of [64,100]) {
    const g=createBushGravity({gridWidth});
    const minimumDistance = gridWidth * 0.75;
    g.observe([bush],{x:100-minimumDistance-1,y:80}); assert.equal(g.active,false);
    g.observe([bush],{x:100-minimumDistance,y:80}); assert.equal(g.active,false);
    g.observe([bush],{x:100-minimumDistance+.01,y:80}); assert.equal(g.active,true);
  }
});
test('both axes accelerate, pause, and land exactly after .125 active seconds', () => {
  const g=createBushGravity(); g.observe([bush],start);
  assert.deepEqual(g.step(0),start);
  assert.deepEqual(g.step(.0625),{x:85,y:65});
  const p=g.step(.025); assert.ok(Math.abs(p.x-89.8)<1e-9 && Math.abs(p.y-69.8)<1e-9);
  assert.deepEqual(g.step(.0375),bush.interactionPosition); assert.equal(g.active,false);
});
test('arrival and cancellation require full exit before rearming; overlaps do not queue', () => {
  const g=createBushGravity(), b={...bush,id:'b'};
  g.observe([bush,b],start); g.step(.125); g.observe([bush,b],start); assert.equal(g.active,false);
  g.step(.25);
  g.observe([],start); g.observe([bush],start); assert.equal(g.active,true);
  g.cancel(); g.observe([bush],start); assert.equal(g.active,false);
});
test('centered entry and unavailable target release gravity', () => {
  const g=createBushGravity(); g.observe([bush],bush.interactionPosition); assert.equal(g.active,false);
  g.observe([],start); const b={...bush}; g.observe([b],start); b.isAlive=false;
  assert.equal(g.step(.1),null); assert.equal(g.active,false);
});

test('arrival locks movement for another .25 active seconds without further displacement', () => {
  const g = createBushGravity(); g.observe([bush], start);
  g.step(.125);
  assert.equal(g.active, false);
  assert.equal(g.movementLocked, true);
  assert.equal(g.step(0), null);
  assert.equal(g.step(.249), null);
  assert.equal(g.movementLocked, true);
  assert.equal(g.step(.001), null);
  assert.equal(g.movementLocked, false);
});

test('arrival frame overshoot counts toward hold, and cancellation clears the hold', () => {
  const g = createBushGravity(); g.observe([bush], start);
  assert.deepEqual(g.step(.25), bush.interactionPosition);
  assert.equal(g.movementLocked, true);
  g.step(.125);
  assert.equal(g.movementLocked, false);
  g.observe([], start); g.observe([bush], start); g.step(.125);
  g.cancel();
  assert.equal(g.movementLocked, false);
});



