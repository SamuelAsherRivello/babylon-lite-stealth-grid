import { createEngine, createSpriteRenderer, registerSpriteRenderer, startEngine, createSpriteAnimationManager, updateSpriteAnimationManager } from '@babylonjs/lite';
import { createPlayer, loadPlayerAtlases, PLAYER_FRAME } from '../../src/characters/player/player.js';
import { createGoblin, loadGoblinAtlases } from '../../src/characters/enemies/goblin/goblin.js';
import { createWarrior, loadWarriorAtlases } from '../../src/characters/enemies/warrior/warrior.js';
import { createLancer, loadLancerAtlases } from '../../src/characters/enemies/lancer/lancer.js';
import { createArcher, loadArcherAtlases } from '../../src/characters/enemies/archer/archer.js';
import { createCombatActorState } from '../../src/gameplay/combat-actor.js';
import { damagePlayer, resolveMeleeImpacts, resolveEnemyArrowPlayerHit } from '../../src/gameplay/player-damage.js';
import { createGameStateMachine, GameState } from '../../src/gameplay/game-state.js';
import { createLevelCompleteUi } from '../../src/ui/level-complete-ui.js';
import { loadArrowAtlas, createProjectileRenderer } from '../../src/systems/objects/projectile-renderer.js';
import { collidersOverlap } from '../../src/gameplay/game-logic.js';
import { createSfxPlayer } from '../../src/audio/sfx.js';
import { createCharacterColliderDrawCommands } from '../../src/ui/collider-diagnostics.js';

if (typeof document !== 'undefined') await setup();
async function setup() {
  const source=new URLSearchParams(location.search).get('source') ?? 'archer';
  const bounds={width:768,height:576};
  const canvas=document.querySelector('#game');
  const engine=await createEngine(canvas,{maxDevicePixelRatio:1}); engine._w=768;engine._h=576;
  const manager=createSpriteAnimationManager();
  const factories={goblin:createGoblin,warrior:createWarrior,lancer:createLancer,archer:createArcher};
  const loaders={goblin:loadGoblinAtlases,warrior:loadWarriorAtlases,lancer:loadLancerAtlases,archer:loadArcherAtlases};
  const [playerAtlases,enemyAtlases,arrowAtlas]=await Promise.all([loadPlayerAtlases(engine),loaders[source](engine),loadArrowAtlas(engine)]);
  const audio=createSfxPlayer({context:new AudioContext(),baseUrl:'/'}); await audio.ready;
  document.querySelector('#unlock').onclick=()=>audio.unlock();
  let pickups=0,sounds=0,deathCompleted=0,paused=false;
  const machine=createGameStateMachine(); machine.assetsLoaded();
  const loss=createLevelCompleteUi({host:document.body,outcome:'loss',onContinue:()=>location.reload()});
  const win=createLevelCompleteUi({host:document.body,onContinue:()=>location.reload()});
  const walls=[];
  const playerActor=createPlayer({atlases:playerAtlases,bounds,obstacles:walls,initialPosition:{x:352,y:288}});
  playerActor.playAnimation(manager);
  const player={actor:playerActor,combat:createCombatActorState({label:'player',getCombatCollider:()=>playerActor.getCombatCollider(),
    setVisualTransform:t=>playerActor.setVisualTransform(t), onKnockback:(d,o)=>playerActor.applyKnockback(d,o),
    onDeathProgress:v=>playerActor.setVisualTransform({sizePx:[PLAYER_FRAME.width*v,PLAYER_FRAME.height*v]}),
    onDeathStart:()=>{playerActor.setInputEnabled(false);machine.playerDefeated();},
    onDeathComplete:()=>{deathCompleted++;machine.deathCompleted();loss.show();}})};
  const arrows=createProjectileRenderer({atlas:arrowAtlas,bounds,obstacles:[],onPickup:()=>{pickups++;if(audio.play('bush'))sounds++;}});
  const enemyActor=factories[source]({atlases:enemyAtlases,bounds,obstacles:[],initialPosition:{x:288,y:288},
    onShoot:(position,target,options)=>arrows.shoot(position,options.initialVelocityDirection,'owner',{target,speedMultiplier:.5,collisionEnabled:true,...options})});
  enemyActor.playAnimation(manager);
  const enemy={actor:enemyActor,character:source,combat:{isAlive:true,label:'owner'}};
  registerSpriteRenderer(createSpriteRenderer(engine,{layers:[...playerActor.layers,...enemyActor.layers,arrows.layer],clearValue:{r:.12,g:.24,b:.18,a:1}}));
  await startEngine(engine);
  const ctx=document.querySelector('#overlay').getContext('2d');
  function snapshot() {return {source,health:player.combat.health,position:playerActor.getPosition(),state:machine.state,deathCompleted,
    arrows:arrows.getProjectiles().map(({id,state,position})=>({id,state,position})),pickupColliders:arrows.getPickupColliders().length,pickups,sounds,capacity:arrows.layer._capacity,renderedArrows:arrows.layer._count,
    lossVisible:!loss.backdrop.hidden,playerSize:playerActor.layers[0]._savedSize?.[0]};}
  function draw() {
    ctx.clearRect(0,0,768,576);
    const commands=createCharacterColliderDrawCommands([{combatCollider:player.combat.getCombatCollider()}, {combatCollider:enemyActor.getCombatCollider()}, ...arrows.getPickupColliders().map(({collider})=>({combatCollider:collider})),...arrows.getColliders().map(({collider})=>({combatCollider:collider}))]);
    for(const {collider:c} of commands){ctx.strokeStyle='#f76868';ctx.strokeRect(c.x,576-c.y-c.height,c.width,c.height);}
    document.querySelector('#result').textContent=JSON.stringify(snapshot(),null,2);
  }
  function step(delta) {
    if(paused || machine.state===GameState.LEVEL_LOST || machine.state===GameState.LEVEL_COMPLETE) return;
    updateSpriteAnimationManager(manager,delta*1000);
    playerActor.update(delta);
    player.combat.updateDeath(delta);
    if(enemy.combat.isAlive)enemyActor.update(delta,[],[],null);
    resolveMeleeImpacts([enemy],player);
    arrows.update(delta,[],(arrow)=>resolveEnemyArrowPlayerHit(arrow,player));
    arrows.collectGroundedArrows(enemy.combat.isAlive?[{id:'owner',collider:enemyActor.getCombatCollider()}]:[]);
    draw();
  }
  window.combatQA={snapshot,step,advance(seconds){for(let left=seconds;left>1e-9;left-=1/120)step(Math.min(left,1/120));return snapshot();},
    attack(){const target=playerActor.getPosition();const p=enemyActor.getPosition();const d={x:Math.sign(target.x-p.x),y:Math.sign(target.y-p.y)};return source==='archer'?enemyActor.shootAt(target):source==='goblin'?enemyActor.attack(d):enemyActor.attack('attack-1',d);},
    setPlayer(p){playerActor.setPosition(p);draw();},setEnemy(p){enemyActor.setPosition(p);draw();},setPaused(v){paused=v;},
    hit(type=source){damagePlayer(player,type,{x:1,y:0});draw();},
    walkOwner(direction){enemyActor.setMovementIntent(direction);},
    ownerAlive(v){enemy.combat.isAlive=v;},wall(collider){walls.push(collider);},
    miss(count=1){playerActor.setPosition({x:100,y:100});for(let i=0;i<count;i++)arrows.shoot({x:288,y:317.55},{x:1,y:0},'owner',{target:{x:544,y:288},landingCenterY:288,collisionEnabled:true,initialVelocityDirection:{x:1,y:.85}});draw();},
    collect(id){arrows.collectGroundedArrows([{id,collider:{x:0,y:0,width:768,height:576}}]);draw();},
    win(){machine.goalReached();if(machine.state===GameState.LEVEL_COMPLETE)win.show();},
  };
  draw();
}
