const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); 
  for (const [n, vp] of [['vorher-quer', { width: 926, height: 428 }]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); await p.route('**/*', r => r.request().url().startsWith('http://localhost:9123/') ? r.continue() : r.abort());
    await p.goto('http://localhost:9123/the-wall/werkstatt2/vorher-test.html'); await p.waitForFunction(() => document.getElementById('laden').hidden); await new Promise(r => setTimeout(r, 500));
    await p.screenshot({ path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/test/' + n + '.png' });
  }
  await b.close();
})();
