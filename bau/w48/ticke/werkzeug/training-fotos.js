// Bildschirmfotos (1×) ausgewählter Stellen zum Ansehen. Aufruf: node training-fotos.js <port> <altdaten.json> <ordner>
const { chromium, devices } = require('playwright'); const fs = require('fs');
const [port, altPfad, ord] = process.argv.slice(2); const ALT = JSON.parse(fs.readFileSync(altPfad, 'utf8'));
(async () => {
  const b = await chromium.launch();
  for (const dunkel of [false, true]) {
    const ctx = await b.newContext({ ...devices['iPhone 12 Pro Max'], viewport: { width: 428, height: 926 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, serviceWorkers: 'block', colorScheme: dunkel ? 'dark' : 'light' });
    await ctx.addInitScript((alt) => { if (!sessionStorage.getItem('g')) { sessionStorage.setItem('g', '1'); for (const [k, v] of Object.entries(alt)) localStorage.setItem(k, v); } }, ALT);
    const p = await ctx.newPage(); const U = `http://127.0.0.1:${port}/ticke/?test=1`;
    const schuss = async (h, sel, name) => { await p.goto(U + h); await p.waitForSelector('#inhalt h2'); await p.waitForTimeout(300); if (sel) await p.$eval(sel, (e) => e.scrollIntoView({ block: 'start' })); await p.waitForTimeout(150); await p.screenshot({ path: `${ord}/tr-${name}${dunkel ? '-dunkel' : ''}.png` }); };
    await schuss('#training', null, 'heute-oben');
    await schuss('#training', '.tr-tagebuch', 'heute-tagebuch');
    await schuss('#training/gruppe/fokus', '.tr-pole', 'bereich-pole');
    await schuss('#training/uebung/f-ein-ding', '.tr-fertig', 'uebung-gefuehl');
    if (!dunkel) { await p.goto(U + '#training/uebung/h-atem'); await p.waitForSelector('[data-tr=t-start]'); await p.click('[data-tr=t-start]'); await p.waitForTimeout(4200); await p.$eval('.tr-timer', (e) => e.scrollIntoView({ block: 'center' })); await p.screenshot({ path: `${ord}/tr-atem.png` }); }
    await schuss('#training/woche', null, 'woche');
    await ctx.close();
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
