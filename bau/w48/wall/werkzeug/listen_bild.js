const { chromium } = require('playwright');
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/test/';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: process.argv[2] || 'light' });
  const p = await ctx.newPage(); await p.route('**/*', r => r.request().url().startsWith('http://localhost:9123/') ? r.continue() : r.abort());
  await p.goto('http://localhost:9123/the-wall/werkstatt2/index.html'); await p.waitForFunction(() => window.__ws2 && window.__ws2.PRUEF && window.__ws2.AEND);
  await p.click('#tabP'); await new Promise(r => setTimeout(r, 200));
  await p.locator('#listen').screenshot({ path: OUT + 'liste-p-' + (process.argv[2] || 'light') + '.png' });
  await p.click('#tabA'); await new Promise(r => setTimeout(r, 200));
  await p.locator('#listen').screenshot({ path: OUT + 'liste-a-' + (process.argv[2] || 'light') + '.png' });
  await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: OUT + 'start-' + (process.argv[2] || 'light') + '.png' });
  await b.close();
})();
