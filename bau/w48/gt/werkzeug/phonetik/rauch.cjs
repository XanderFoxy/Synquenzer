const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true })).newPage();
  const fehler = []; p.on('pageerror', e => fehler.push(e.message));
  await p.goto('http://localhost:8947/app/js/lexikon-en.js');
  const r = await p.evaluate(async () => { const t = performance.now(); const P = await import('/app/js/phonetik.js');
    const k = P.vokalKette("Don't wait, follow the light"); return { k, ms: performance.now() - t, u: P.uebergaenge(k).length }; });
  console.log(JSON.stringify(r), fehler);
  await b.close();
})();
