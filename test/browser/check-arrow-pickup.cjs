async (page) => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:5173/test/browser/player-combat.html?source=archer');await page.waitForFunction(()=>!!window.combatQA);
  await page.getByRole('button',{name:'Enable sound'}).click();
  const before=await page.evaluate(()=>{combatQA.miss();combatQA.advance(3);combatQA.setEnemy({x:448,y:288});combatQA.walkOwner({x:1,y:0});return combatQA.snapshot();});
  if(before.arrows.length!==1)throw Error('No landed arrow');
  const pickup=await page.evaluate(()=>combatQA.advance(1));
  if(pickup.arrows.length!==0||pickup.pickups!==1||pickup.sounds!==1)throw Error(JSON.stringify(pickup));
  await page.screenshot({path:'output/playwright/c058-walk-pickup.png'});
  await page.goto('http://localhost:5173/test/browser/player-combat.html?source=lancer');await page.waitForFunction(()=>!!window.combatQA);
  await page.keyboard.down('a');
  const input=await page.evaluate(()=>{combatQA.hit('lancer');return combatQA.advance(.2);});await page.keyboard.up('a');
  if(Math.abs(input.position.x-416)>.01)throw Error('input cancelled knockback: '+JSON.stringify(input));
  const blocked=await page.evaluate(()=>{combatQA.setPlayer({x:352,y:288});combatQA.wall({x:390,y:200,width:2,height:200});combatQA.hit('lancer');return combatQA.advance(.2);});
  if(blocked.position.x<=352||blocked.position.x>=390)throw Error('wall was tunneled: '+JSON.stringify(blocked));
  await page.goto('http://localhost:5173/test/browser/player-combat.html?source=archer');await page.waitForFunction(()=>!!window.combatQA);
  const hit=await page.evaluate(()=>{combatQA.attack();return combatQA.advance(1.5);});
  if(hit.health!==75||hit.arrows.length)throw Error('shared player hit route failed');
  if(errors.length)throw Error(errors.join(';'));
  return {passed:true,walkingPickup:pickup.pickups,bushPlaybacks:pickup.sounds,inputResistantDisplacement:input.position.x-352,wallLimitedDisplacement:blocked.position.x-352,arrowHitHealth:hit.health};
}
