const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 428, height: 926 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' }); const p = await c.newPage();
  await p.goto(process.argv[2] + '?test=1'); await p.waitForSelector('#inhalt h2'); await p.evaluate(() => window.__ticke.setzeEinst({ einstieg: true })); await p.evaluate(() => { location.hash = 'start'; }); await p.waitForTimeout(400);
  console.log(await p.evaluate(() => [...document.querySelectorAll('#inhalt a')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.height < 43.5 && !e.closest('.fuss'); }).map((e) => e.outerHTML.slice(0, 90) + ' | parent ' + e.parentElement.className)));
  await b.close(); })();
