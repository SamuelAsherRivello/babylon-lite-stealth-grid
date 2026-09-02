import test from 'node:test';
import assert from 'node:assert/strict';
import * as module from '../../src/gameplay/player-damage.js';

test('distance impulse is independent of frame rate, pauses, and replaces prior travel', () => {
  assert.equal(typeof module.createDistanceImpulse, 'function');
  for(const dt of [1/30,1/60,1/144,.25]) for(const distance of [16,32,48,64]) {
    const impulse=module.createDistanceImpulse(); impulse.start({x:1,y:0},{distance,duration:.2});
    assert.deepEqual(impulse.step(0),{x:0,y:0});
    let x=0; for(let i=0;i<150;i++) x+=impulse.step(dt)?.x??0;
    assert.ok(Math.abs(x-distance)<1e-8);
    impulse.start({x:1,y:0},{distance:64,duration:.2}); impulse.step(.1);
    impulse.start({x:-1,y:0},{distance:16,duration:.2}); assert.deepEqual(impulse.step(.2),{x:-16,y:0});
  }
});
