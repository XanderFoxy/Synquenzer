// Erzeugt echte Daten der Vorlage 0.2.1 (alt/ticke): ein fertiger Lauf (mit Bonus) und ein angefangener Lauf (mitten in einer
// Kopfnuss-Auflösung). Speichert die localStorage-Inhalte als JSON. Nur erfundene Wahlen.
const { chromium } = require('playwright');
const fs = require('fs');
const PORT = process.argv[2] || '8968', OUT = process.argv[3];
const KERN = JSON.stringify({ format: 1, einwilligung: { an: true, zeit: '2026-11-20T10:00:00.000Z' }, einst: { alter: null, schrift: 1, einstieg: true } });
async function spiele(page, { stopBeiAufl = false, bonus = true } = {}) {
  for (let n = 0; n < 200; n++) {
    if ((await page.evaluate(() => location.hash)) === '#spiel/ergebnis') return 'ergebnis';
    const was = await page.waitForFunction(() => {
      if (location.hash === '#spiel/ergebnis') return 'ergebnis';
      if (document.querySelector('.sp-paar[data-bereit="1"]')) return 'wahl';
      if (document.querySelector('[data-sp=weiter]')) return 'weiter';
      if (document.querySelector('[data-sp=level]')) return 'level';
      if (document.querySelector('[data-sp=bonus]')) return 'bonus';
      return null;
    }, null, { timeout: 8000 }).then((h) => h.jsonValue());
    if (was === 'ergebnis') return 'ergebnis';
    if (was === 'wahl') { await page.click(n % 3 ? '.sp-links' : '.sp-rechts'); await page.waitForTimeout(30); }
    else if (was === 'weiter') { if (stopBeiAufl) return 'aufl'; await page.click('[data-sp=weiter]'); }
    else if (was === 'level') await page.click('[data-sp=level]');
    else if (was === 'bonus') await page.click(bonus ? '[data-sp=bonus]' : '[data-sp=fertig]');
    await page.waitForTimeout(60);
  }
  return 'zu lang';
}
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await ctx.addInitScript((k) => { if (!localStorage.getItem('ticke.v1.kern')) localStorage.setItem('ticke.v1.kern', k); }, KERN);
  const page = await ctx.newPage();
  const fehler = []; page.on('pageerror', (e) => fehler.push(String(e))); page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  await page.goto(`http://127.0.0.1:${PORT}/ticke/?test=1&saat=11#spiel/runde`);
  const r1 = await spiele(page, { bonus: true });
  const fertig = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith('ticke.')).map((k) => [k, localStorage.getItem(k)])));
  // angefangener Lauf: neu anfangen und bis zur ersten Kopfnuss-Auflösung spielen
  await page.goto(`http://127.0.0.1:${PORT}/ticke/?test=1&saat=12#spiel`);
  await page.click('[data-sp=neu]'); await page.waitForTimeout(200);
  const dlg = await page.$('dialog[open] [data-w=ja]'); if (dlg) await dlg.click();
  const r2 = await spiele(page, { stopBeiAufl: true });
  const halb = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith('ticke.')).map((k) => [k, localStorage.getItem(k)])));
  fs.writeFileSync(OUT, JSON.stringify({ fertig, halb }, null, 1));
  const lf = JSON.parse(fertig['ticke.v1.m.spiel']).lauf, lh = JSON.parse(halb['ticke.v1.m.spiel']).lauf;
  console.log('fertig:', r1, 'Antworten', Object.keys(lf.antworten).length, 'ende', !!lf.ende, 'bonus', lf.bonus, '| halb:', r2, 'Antworten', Object.keys(lh.antworten).length, 'aufl', lh.aufl, 'i', lh.i, '| Ergebnisse', Object.keys(JSON.parse(fertig['ticke.v1.ergebnisse'])).join(), '| Fehler', fehler.length, fehler.slice(0, 3));
  await b.close();
})();
