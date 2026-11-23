const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); await p.route('**/*', r => r.request().url().startsWith('http://localhost:9124/') ? r.continue() : r.abort());
  await p.goto('http://localhost:9124/the-wall/werkstatt2/index.html'); await p.waitForFunction(() => window.__ws2 && window.__ws2.PRUEF);
  await p.evaluate(() => { window.__ws2.ansicht(108.8, 3); }); await new Promise(r => setTimeout(r, 600));
  await p.locator('#buehne').screenshot({ path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/test/buehne-pruef.png' });
  await b.close();
})();
