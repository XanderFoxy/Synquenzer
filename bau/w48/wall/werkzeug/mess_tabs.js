const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); await p.route('**/*', r => r.request().url().startsWith('http://localhost:9123/') ? r.continue() : r.abort());
  await p.goto('http://localhost:9123/the-wall/werkstatt2/index.html'); await p.waitForFunction(() => window.__ws2 && window.__ws2.PRUEF);
  console.log(await p.evaluate(() => { const t = document.querySelector('.tabs'); return { sw: t.scrollWidth, cw: t.clientWidth, w: [...t.children].map(c => Math.round(c.getBoundingClientRect().width)) } }));
  await b.close();
})();
