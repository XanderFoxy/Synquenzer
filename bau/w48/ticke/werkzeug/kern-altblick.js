const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 428, height: 926 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' }); const p = await c.newPage();
  await p.goto(process.argv[2]); await p.waitForSelector('#inhalt h2');
  console.log(await p.$eval('#inhalt > a.spiel-kachel', (a) => Math.round(a.getBoundingClientRect().height))); await b.close(); })();
