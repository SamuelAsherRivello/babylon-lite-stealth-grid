async (page) => {
  await page.waitForFunction(() => window.gravityTest);
  const check = (ok,msg) => { if(!ok) throw new Error(msg); };
  const start = () => page.evaluate(() => { gravityTest.bush.isAlive=true; gravityTest.reset(); gravityTest.observe(); return gravityTest.snapshot(); });
  check((await start()).active,'entry');
  await page.keyboard.down('ArrowRight');
  let s=await page.evaluate(() => gravityTest.step(.0625));
  check(s.position.x===273 && s.position.y===305 && s.active,'both axes and lock');
  s=await page.evaluate(() => gravityTest.step(.0625));
  check(s.position.x===288 && s.position.y===320 && !s.active && s.hidden,'arrival');
  s=await page.evaluate(() => gravityTest.step(.249)); check(s.position.x===288,'keyboard held during post-pull lock');
  s=await page.evaluate(() => gravityTest.step(.001)); check(s.position.x===288,'hold completes at .25 seconds');
  s=await page.evaluate(() => gravityTest.step(.01)); check(s.position.x>288 && !s.active,'held keyboard resumes');
  await page.keyboard.up('ArrowRight');
  s=await page.evaluate(() => { gravityTest.move({x:270,y:310}); return gravityTest.snapshot(); }); check(!s.active,'inside retrigger');
  s=await page.evaluate(() => { gravityTest.move({x:180,y:320}); gravityTest.move({x:240,y:320}); return gravityTest.snapshot(); }); check(!s.active,'equal threshold');
  s=await page.evaluate(() => { gravityTest.move({x:241,y:320}); return gravityTest.snapshot(); }); check(s.active,'reentry below threshold');
  await start(); await page.keyboard.down('ArrowLeft'); await page.keyboard.up('ArrowLeft');
  await page.evaluate(() => gravityTest.step(.125)); s=await page.evaluate(() => gravityTest.step(.02)); check(s.position.x===288 && s.position.y===320,'released input');
  await start();
  await page.mouse.move(710,360); await page.mouse.down();
  s=await page.evaluate(() => gravityTest.step(.125)); check(s.position.x===288 && s.position.y===320,'joystick lock');
  s=await page.evaluate(() => gravityTest.step(.25)); check(s.position.x===288,'joystick held during post-pull lock');
  s=await page.evaluate(() => gravityTest.step(.05)); check(s.position.x>288,'joystick resumes');
  await page.mouse.up();
  const previous=s.position.x; s=await page.evaluate(() => gravityTest.step(.02)); check(s.position.x===previous,'joystick release');
  await start(); s=await page.evaluate(() => { gravityTest.knockback(); return gravityTest.step(.05); }); check(!s.active && s.position.x<268,'knockback');
  await start(); s=await page.evaluate(() => { gravityTest.bush.isAlive=false; return gravityTest.step(.1); }); check(!s.active,'dead bush');
  await start(); s=await page.evaluate(() => { gravityTest.disable(); return gravityTest.snapshot(); }); check(!s.active,'death input lock');
  await start(); s=await page.evaluate(() => gravityTest.step(.125,[{collider:{x:295,y:270,width:20,height:100}}])); check(!s.active && s.position.x<288,'blocking collider');
  await start(); await page.evaluate(() => gravityTest.step(.125));
  await page.locator('canvas').screenshot({path:'output/playwright/c059-center.png'});
  return {passed:true, checks:14, final:await page.evaluate(() => gravityTest.snapshot())};
}


