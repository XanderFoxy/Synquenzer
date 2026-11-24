const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  const p = await c.newPage(); const f = []; p.on('pageerror', (e) => f.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') f.push(m.text()); });
  const t0 = Date.now(); await p.goto('http://127.0.0.1:8977/ticke/?test=1#spiel'); await p.waitForSelector('.sp-held'); const t1 = Date.now() - t0;
  await p.goto('http://127.0.0.1:8977/ticke/?test=1#spiel/wahlen'); await p.waitForSelector('.sp-w'); const n = await p.$$eval('.sp-w', (x) => x.length);
  console.log('Übersicht', t1, 'ms · Wahlen', n, '· Fehler', f.length, f.slice(0, 3)); await b.close(); })();
