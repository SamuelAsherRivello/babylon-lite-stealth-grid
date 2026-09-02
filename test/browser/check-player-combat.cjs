async (page) => {
  const results=[]; const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  const check=(ok,message)=>{if(!ok)throw Error(message);};
  for(const source of ['goblin','warrior','lancer','archer']) {
    await page.goto(`http://localhost:5173/test/browser/player-combat.html?source=${source}`);
    await page.waitForFunction(()=>!!window.combatQA);
    await page.getByRole('button',{name:'Enable sound'}).click();
    const distances=[];
    for(let hit=1;hit<=4;hit++) {
      await page.evaluate(()=>{combatQA.setPlayer({x:352,y:288});combatQA.attack();});
      const impact=await page.evaluate((hit)=>{let state;for(let i=0;i<300;i++){combatQA.step(1/120);state=combatQA.snapshot();if(state.health===100-25*hit)break;}return state;},hit);
      check(impact.health===100-25*hit,`${source} hit ${hit}: ${JSON.stringify(impact)}`);
      if(hit<4) {
        const result=await page.evaluate(()=>combatQA.advance(1.5));
        const distance=Math.hypot(result.position.x-352,result.position.y-288);
        check(Math.abs(distance-({goblin:16,archer:32,warrior:48,lancer:64}[source]))<.01,`${source} distance ${distance}`);distances.push(distance);
      } else {
        check(impact.state==='LEVEL_DYING'&&!impact.lossVisible,'loss appeared before animation');
        const middle=await page.evaluate(()=>combatQA.advance(.125));
        check(middle.state==='LEVEL_DYING'&&!middle.lossVisible&&middle.playerSize<192&&middle.playerSize>0,'missing intermediate death scale');
        await page.screenshot({path:`output/playwright/c058-${source}-dying.png`});
        const paused=await page.evaluate(()=>{combatQA.setPaused(true);combatQA.advance(1);return combatQA.snapshot();});
        check(paused.playerSize===middle.playerSize,'death advances while paused');
        const final=await page.evaluate(()=>{combatQA.setPaused(false);return combatQA.advance(.2);});
        check(final.state==='LEVEL_LOST'&&final.lossVisible&&final.deathCompleted===1,'loss transition');
        const distance=Math.hypot(final.position.x-352,final.position.y-288);
        check(Math.abs(distance-({goblin:16,archer:32,warrior:48,lancer:64}[source]))<.01,`${source} lethal distance ${distance}`);
        const frozen=await page.evaluate(()=>combatQA.advance(2));check(JSON.stringify(frozen)===JSON.stringify(final),'lost game advances');
        await page.getByRole('heading',{name:'You Lost'}).waitFor();
        await page.screenshot({path:`output/playwright/c058-${source}-lost.png`});
        await page.getByRole('button',{name:'Continue'}).click();await page.waitForFunction(()=>window.combatQA?.snapshot().health===100);
        results.push({source,distances,lethalDistance:distance,deathCompleted:1,restartHealth:100});
      }
    }
  }
  await page.goto('http://localhost:5173/test/browser/player-combat.html?source=archer'); await page.waitForFunction(()=>!!window.combatQA);
  await page.getByRole('button',{name:'Enable sound'}).click();
  const landed=await page.evaluate(()=>{combatQA.miss(40);return combatQA.advance(4);});
  check(landed.arrows.length===40&&landed.pickupColliders===40&&landed.capacity>=40,'ground persistence/growth');
  const other=await page.evaluate(()=>{combatQA.collect('player');combatQA.collect('other-archer');combatQA.ownerAlive(false);combatQA.advance(100);return combatQA.snapshot();});
  check(other.arrows.length===40&&other.pickups===0&&other.sounds===0,'other actor/dead owner interactivity');
  await page.screenshot({path:'output/playwright/c058-grounded-capacity.png'});
  const collected=await page.evaluate(()=>{combatQA.ownerAlive(true);combatQA.setEnemy({x:540,y:288});return combatQA.advance(.2);});
  check(collected.arrows.length===0&&collected.pickups===40&&collected.sounds===40,'owner pickup/sound');
  await page.screenshot({path:'output/playwright/c058-picked-up.png'});
  results.push({grounded:landed.arrows.length,capacity:landed.capacity,otherActorIgnored:true,ownerPickups:collected.pickups,sounds:collected.sounds});
  await page.evaluate(()=>combatQA.win()); await page.getByRole('heading',{name:'Level Complete'}).waitFor();
  check(errors.length===0,errors.join('; '));
  return {passed:true,results};
}
