// Kurzprüfung #antworten gegen die echten Modul-Exporte der Arbeitskopie: node kern-live.js <basis-url>
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 428, height: 926 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const p = await c.newPage();
  const f = [];
  p.on('pageerror', (e) => f.push('pageerror ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') f.push(m.type() + ' ' + m.text()); });
  await p.goto(process.argv[2] + '?test=1#antworten'); await p.waitForSelector('.antw-teil');
  await p.waitForFunction(() => [...document.querySelectorAll('.antw-teil [data-stand]')].every((s) => s.textContent !== 'lädt …'), null, { timeout: 10000 });
  console.log(await p.$$eval('.antw-teil', (t) => t.map((x) => x.dataset.teil + ': ' + x.querySelector('[data-stand]').textContent).join('\n')));
  const ns = await p.evaluate(async () => {
    const k = window.__ticke, r = {};
    for (const m of k.module) {
      try { const n = await k.exporte(m.id); if (typeof n.antwortListe !== 'function') { r[m.id] = 'kein Export'; continue; }
        const l = await n.antwortListe(k); r[m.id] = { n: l.length, arten: [...new Set(l.map((a) => a.art))], setzen: typeof n.antwortSetzen, beispiel: l[0] && { ...l[0], optionen: l[0].optionen && l[0].optionen.length } }; }
      catch (e) { r[m.id] = 'FEHLER ' + e.message; }
    }
    return r;
  });
  console.log(JSON.stringify(ns, null, 1).slice(0, 2500));
  await p.click('.antw-teil[data-teil=bigfive] summary'); await p.waitForTimeout(200);
  const z = await p.$('.antw-teil[data-teil=bigfive] .antw-zeile');
  if (z) {
    await z.click(); await p.waitForSelector('dialog.blatt');
    const o = await p.$$('dialog.blatt .antwort'); console.log('Optionen im Blatt:', o.length);
    if (o.length) { await o[3].click(); await p.waitForTimeout(600); }
    console.log('Zeile danach:', await p.$eval('.antw-teil[data-teil=bigfive] .antw-zeile', (x) => x.innerText.replace(/\s+/g, ' ')));
    console.log('Stand:', await p.$eval('.antw-teil[data-teil=bigfive] [data-stand]', (x) => x.textContent));
  }
  console.log('Meldungen:', f.join('\n') || 0);
  await b.close();
})();
