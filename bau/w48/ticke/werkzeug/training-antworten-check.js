const { chromium, devices } = require('playwright'); const fs = require('fs');
const [port, altPfad, foto] = process.argv.slice(2); const ALT = JSON.parse(fs.readFileSync(altPfad, 'utf8'));
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 12 Pro Max'], viewport: { width: 428, height: 926 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  await ctx.addInitScript((alt) => { if (!sessionStorage.getItem('g')) { sessionStorage.setItem('g', '1'); for (const [k, v] of Object.entries(alt)) localStorage.setItem(k, v); } }, ALT);
  const p = await ctx.newPage(); const err = []; p.on('pageerror', (e) => err.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/404|muster\/modul/.test(m.text())) err.push(m.text()); });
  await p.goto(`http://127.0.0.1:${port}/ticke/?test=1#antworten/training`); await p.waitForTimeout(1500);
  const t = await p.evaluate(() => document.getElementById('inhalt').innerText);
  const i = t.indexOf('Training'); console.log(t.slice(i, i + 900).replace(/\n+/g, ' / '));
  // eine Training-Antwort antippen und ändern (Zeit → bis 10 Min.)
  const knopf = await p.$('text=Wie viel Zeit hast du für eine Übung?');
  if (knopf) { await knopf.scrollIntoViewIfNeeded(); await p.screenshot({ path: foto }); await knopf.click(); await p.waitForTimeout(400);
    const opt = await p.$('text=bis 10 Min.'); if (opt) { await opt.click(); await p.waitForTimeout(500); }
    const nachher = await p.evaluate(() => window.__ticke.speicher.lies('training', 'zeit'));
    const vorher = await p.evaluate(() => window.__ticke.speicher.lies('training', 'vorher', {}).zeit);
    console.log('Zeit nach Änderung über „Deine Antworten“:', nachher, '| vorher:', JSON.stringify(vorher));
  } else console.log('Frage nicht gefunden');
  console.log('Fehler (ohne Muster-404):', err.length, err.join(' | '));
  await b.close();
})();
