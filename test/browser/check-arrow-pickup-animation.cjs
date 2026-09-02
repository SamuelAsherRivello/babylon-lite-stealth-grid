async (page) => {
  await page.goto('http://localhost:5173/test/browser/player-combat.html?source=archer');
  await page.waitForFunction(()=>!!window.combatQA);
  await page.getByRole('button',{name:'Enable sound'}).click();
  await page.evaluate(()=>{combatQA.miss();combatQA.advance(3);combatQA.collect('owner');});
  const start=await page.evaluate(()=>combatQA.snapshot());
  if(start.arrows[0]?.state!=='pickingUp'||start.pickupColliders!==0||start.sounds!==1)throw Error(JSON.stringify(start));
  await page.evaluate(()=>combatQA.advance(.09));
  const middle=await page.evaluate(()=>combatQA.snapshot());
  if(middle.arrows.length!==1||middle.sounds!==1)throw Error('midpoint disappeared');
  await page.screenshot({path:'output/playwright/c058-arrow-pickup-midpoint.png'});
  await page.evaluate(()=>combatQA.advance(.1));
  const end=await page.evaluate(()=>combatQA.snapshot());
  if(end.arrows.length||end.sounds!==1)throw Error('pickup did not finish once');
  return {passed:true,start:start.arrows[0].state,midpointVisible:true,endCount:end.arrows.length,bushPlaybacks:end.sounds};
}
