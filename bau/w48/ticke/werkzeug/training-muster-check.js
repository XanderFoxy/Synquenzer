const { chromium, devices } = require('playwright'); const fs = require('fs');
const [port, altPfad] = process.argv.slice(2); const ALT = JSON.parse(fs.readFileSync(altPfad, 'utf8'));
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 12 Pro Max'], viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  await ctx.addInitScript((alt) => { if (!sessionStorage.getItem('g')) { sessionStorage.setItem('g', '1'); for (const [k, v] of Object.entries(alt)) localStorage.setItem(k, v); } }, ALT);
  const p = await ctx.newPage(); const err = []; p.on('pageerror', (e) => err.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') err.push(m.text()); });
  const U = `http://127.0.0.1:${port}/ticke/?test=1`;
  const r = {};
  for (const h of ['#muster', '#muster/ast/training.fokus', '#muster/ast/training.wachsen', '#antworten/training']) {
    await p.goto(U + h); await p.waitForTimeout(1200);
    r[h] = await p.evaluate(() => { const el = document.getElementById('inhalt'); return { h2: (el.querySelector('h2') || {}).textContent, laenge: el.innerText.length, ausschnitt: el.innerText.slice(0, 300).replace(/\n+/g, ' / '), breit: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 }; });
  }
  if (r['#antworten/training']) { await p.screenshot({ path: process.argv[4] || '/dev/null' }).catch(() => {}); }
  console.log(JSON.stringify({ r, err }, null, 1)); await b.close();
})();
