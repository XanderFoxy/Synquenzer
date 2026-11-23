const { chromium } = require('playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[428, 926], [926, 428]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await ctx.newPage(); await page.goto('http://127.0.0.1:8764/index.html');
    await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.ke1, null, { timeout: 60000 }); await sleep(1000);
    const out = await page.evaluate(async () => {
      const o = {};
      for (const f of ['va1Sheet', 'mx2Sheet', 'imp3Sheet', 'imp1Sheet', 'stSheet']) {
        try { window[f](); } catch (e) { o[f] = 'err'; continue; }
        await new Promise(r => setTimeout(r, 500));
        const p = document.querySelector('.pop'), x = p && p.querySelector('.psh-x');
        if (x) { const r = x.getBoundingClientRect(), q = p.getBoundingClientRect(); o[f] = { xr: Math.round(innerWidth - r.right), xt: Math.round(r.top), pw: Math.round(q.width), pt: Math.round(q.top), pr: Math.round(innerWidth - q.right) }; } else o[f] = 'kein x';
        try { closePop(); } catch (e) {} await new Promise(r => setTimeout(r, 300));
      }
      return o;
    });
    console.log(w + 'x' + h, JSON.stringify(out));
    await ctx.close();
  }
  await b.close();
})();
