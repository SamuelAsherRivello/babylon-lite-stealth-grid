import test from 'node:test';
import assert from 'node:assert/strict';
import { createCombatActorState } from '../../src/gameplay/combat-actor.js';
import { createGameStateMachine, GameState } from '../../src/gameplay/game-state.js';
import { createGoblin } from '../../src/characters/enemies/goblin/goblin.js';
import { createWarrior } from '../../src/characters/enemies/warrior/warrior.js';
import { createLancer } from '../../src/characters/enemies/lancer/lancer.js';
import { createSpriteAnimationManager, updateSpriteAnimationManager } from '@babylonjs/lite';
import { resolveMeleeImpacts, damagePlayer, resolveEnemyArrowPlayerHit } from '../../src/gameplay/player-damage.js';

test('player routing excludes own and unowned arrows and stops damage after death', () => {
  const collider={x:10,y:10,width:20,height:20};
  const player={combat:createCombatActorState({label:'player',getCombatCollider:()=>collider,setVisualTransform:()=>{}})};
  for (const ownerId of [null,'player']) assert.equal(resolveEnemyArrowPlayerHit({ownerId,collider,direction:{x:1,y:0}},player),false);
  assert.equal(player.combat.health,100);
  for (const health of [75,50,25,0]) {
    assert.equal(resolveEnemyArrowPlayerHit({ownerId:'removed-archer',collider,direction:{x:1,y:0}},player),true);
    assert.equal(player.combat.health,health);
  }
  assert.equal(resolveEnemyArrowPlayerHit({ownerId:'removed-archer',collider,direction:{x:1,y:0}},player),false);
});

test('adjacent melee misses outside its committed direction and counts independent swings', () => {
  let position={x:288,y:224}; const pushes=[];
  const combat=createCombatActorState({label:'player',getCombatCollider:()=>({x:position.x-10,y:position.y-10,width:20,height:20}),setVisualTransform:()=>{},onKnockback:(d,o)=>pushes.push(o.distance)});
  const player={combat,actor:{getPosition:()=>position}};
  let events=[{id:1,direction:{x:1,y:0}}];
  const enemy={character:'goblin',combat:{isAlive:true},actor:{getGridPosition:()=>({x:3,y:3}),getPosition:()=>({x:224,y:224}),drainAttackImpacts:()=>events.splice(0)}};
  resolveMeleeImpacts([enemy],player); assert.equal(combat.health,75);
  resolveMeleeImpacts([enemy],player); assert.equal(combat.health,75);
  position={x:160,y:224}; events.push({id:2,direction:{x:1,y:0}});
  resolveMeleeImpacts([enemy],player); assert.equal(combat.health,75);
  position={x:288,y:224}; events.push({id:3,direction:{x:1,y:0}});
  resolveMeleeImpacts([enemy],player); damagePlayer(player,'archer',{x:1,y:0}); damagePlayer(player,'lancer',{x:1,y:0});
  assert.equal(combat.health,0); assert.deepEqual(pushes,[16,16,32,64]);
  assert.equal(damagePlayer(player,'warrior',{x:1,y:0}),false);
});

for (const [name, factory] of Object.entries({ goblin: createGoblin, warrior: createWarrior, lancer: createLancer })) {
  test(`${name} emits one committed impact per swing, including successive swings`, () => {
    const atlas = { frames: Array.from({length: 20}, () => ({uvMin:[0,0],uvMax:[1,1],sourceSizePx:[192,192]})) };
    const actor = factory({atlases:new Proxy({}, {get:()=>atlas}), initialPosition:{x:224,y:224}, bounds:{width:768,height:768}, obstacles:[]});
    const manager=createSpriteAnimationManager(); actor.playAnimation(manager);
    assert.equal(typeof actor.drainAttackImpacts, 'function');
    const ids=[];
    for(let swing=0;swing<4;swing++) {
      assert.equal(name==='goblin' ? actor.attack({x:1,y:0}) : actor.attack('attack-1',{x:1,y:0}), true);
      assert.deepEqual(actor.drainAttackImpacts(), []);
      const events=[];
      for(let i=0;i<80;i++) { updateSpriteAnimationManager(manager,16); actor.update(.016); events.push(...actor.drainAttackImpacts()); }
      assert.equal(events.length,1); assert.deepEqual(events[0].direction,{x:1,y:0}); ids.push(events[0].id);
    }
    assert.equal(new Set(ids).size,4); actor.dispose();
  });
}

test('lethal damage signals defeat and completes once after active death time', () => {
  const state=createGameStateMachine(); state.assetsLoaded(); let completions=0;
  const combat=createCombatActorState({label:'player',getCombatCollider:()=>({x:0,y:0,width:10,height:10}),setVisualTransform:()=>{},
    onDeathStart:()=>state.playerDefeated(), onDeathComplete:()=>{completions++; state.deathCompleted();}});
  for(const health of [75,50,25,0]) { combat.applyDamage(25); assert.equal(combat.health,health); }
  assert.equal(state.state,GameState.LEVEL_DYING); state.goalReached();
  combat.applyDamage(100); assert.equal(combat.health,0);
  combat.updateDeath(0); combat.updateDeath(.125); assert.equal(completions,0);
  combat.updateDeath(.125); assert.equal(completions,1); assert.equal(state.state,GameState.LEVEL_LOST);
  combat.updateDeath(1); assert.equal(completions,1);
});
