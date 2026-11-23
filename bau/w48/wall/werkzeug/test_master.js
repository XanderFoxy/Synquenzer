const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const ctx = await b.newContext({ viewport: { width: 428, height: 926 } });
  const p = await ctx.newPage(); await p.route('**/*', r => r.request().url().startsWith('http://localhost:9124/') ? r.continue() : r.abort());
  await p.goto('http://localhost:9124/the-wall/werkstatt2/index.html'); await p.waitForFunction(() => window.__ws2 && window.__ws2.PRUEF);
  console.log('pos', await p.evaluate(() => window.__ws2.Z.pos));
  await p.click('#bMaster'); await new Promise(r => setTimeout(r, 2500));
  console.log(await p.evaluate(() => ({ t: window.__ws2.MA.v11.currentTime, rs: window.__ws2.MA.v11.readyState })));
  await p.click('#segMaster button[data-m="v10"]'); await new Promise(r => setTimeout(r, 2500));
  console.log(await p.evaluate(() => ({ v10: window.__ws2.MA.v10.currentTime, v11: window.__ws2.MA.v11.currentTime })));
  // Liste: v10<->v11 im Master bei 3:38
  await p.click('#tabA'); await p.click('#listeA button[data-master="219.85"]'); await new Promise(r => setTimeout(r, 2500));
  console.log(await p.evaluate(() => ({ wahl: window.__ws2.MW.wahl, v11: window.__ws2.MA.v11.currentTime, spielt: window.__ws2.MW.spielt })));
  await b.close();
})();
