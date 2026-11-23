// ENT1D Sonde 2: Kopf + ↶ nach Übernehmen + ✕-Lage gegen Export-Blatt (hochkant/quer, echte Touch-Taps)
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://127.0.0.1:8764/index.html';
const SHOT = process.argv[3] || '';
const res = []; let fails = 0;
const ok = (n, c, i) => { res.push((c ? 'OK   ' : 'FAIL ') + n + (i !== undefined ? ' :: ' + JSON.stringify(i) : '')); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MEAS = sel => {
  const vw = innerWidth, vh = innerHeight;
  return [...document.querySelectorAll(sel)].filter(b => b.getBoundingClientRect().width > 0).map(b => {
    const r = b.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { t: (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 24), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), r: Math.round(r.right), b: Math.round(r.bottom),
      inV: r.left >= 0 && r.top >= 0 && r.right <= vw && r.bottom <= vh, vis: !!e && (e === b || b.contains(e)) };
  });
};
async function tap(page, sel) {
  const b = await page.$(sel); if (!b) return false; await b.scrollIntoViewIfNeeded(); const r = await b.boundingBox(); if (!r) return false;
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await sleep(350); return true;
}
const overlap = L => { for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const a = L[i], b = L[j]; if (a.x < b.r - 1 && b.x < a.r - 1 && a.y < b.b - 1 && b.y < a.b - 1) return [a.t, b.t]; } return null; };
async function run(browser, w, h, tag) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('console.error: ' + m.text()); });
  await page.goto(URL);
  await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.ke1, null, { timeout: 60000 });
  await sleep(1200);
  // Referenz: ✕ im Export-Blatt
  const xRef = await page.evaluate(async (f) => { try { window[f](); } catch (e) { return 'err ' + e.message; } await new Promise(r => setTimeout(r, 500)); const x = document.querySelector('.pop .psh-x'); const r = x && x.getBoundingClientRect(); const o = r ? { r: Math.round(innerWidth - r.right), t: Math.round(r.top) } : null; try { closePop(); } catch (e) {} return o; }, w < h ? 'imp3Sheet' : 'stSheet');
  await sleep(400);
  const opened = await page.evaluate(() => {
    const sr = 44100, n = sr * 1.2, x = new Float32Array(n);
    for (let i = 0; i < n; i++) { const t = i / sr; x[i] = 0.5 * Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 2) + 0.2 * Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 3); }
    return SYNQUENZER.ke1.open({ pcm: x, sr, name: 'Ein sehr langer Aufnahmename für den Kopf des Blatts Klang erkennen Test' });
  });
  ok(tag + ': Blatt offen', !!opened);
  await page.waitForFunction(() => document.querySelector('.pop.ke1 .ke1-tab'), null, { timeout: 60000 }).catch(() => {});
  await sleep(500);
  const xK = await page.evaluate(() => { const r = document.querySelector('.pop.ke1 .psh-x').getBoundingClientRect(); return { r: Math.round(innerWidth - r.right), t: Math.round(r.top) }; });
  ok(tag + ': ✕ an derselben Stelle wie in den anderen Blättern (±2 px)', xRef && Math.abs(xRef.r - xK.r) <= 2 && (w > h || Math.abs(xRef.t - xK.t) <= 2), { ref: xRef, ke1: xK });
  const head = await page.evaluate(MEAS, '.pop.ke1 .psh-h .psh-b, .pop.ke1 .ke1-tab');
  ok(tag + ': Kopf-Knöpfe + 3 Reiter im Bild, sichtbar, ≥40 px', head.length === 8 && head.every(b => b.inV && b.vis && b.w >= 40 && b.h >= 40), head);
  ok(tag + ': keine Überlappung', !overlap(head), overlap(head));
  const tabs = await page.evaluate(() => [...document.querySelectorAll('.pop.ke1 .ke1-tab')].map(b => b.scrollWidth <= b.clientWidth + 1));
  ok(tag + ': Reiter-Text passt', tabs.every(Boolean), tabs);
  const src = await page.evaluate(() => { const s = document.querySelector('.pop.ke1 .ke1-src'); const r = s.getBoundingClientRect(); return { h: Math.round(r.height), txt: s.textContent.trim().slice(0, 80), full: (s.querySelector('[title]') || {}).title || null }; });
  ok(tag + ': langer Name gekürzt (eine Zeile, voller Name im Hinweis)', src.h <= 46 && !!src.full, src);
  // Übernehmen per Touch → ↶ sichtbar
  ok(tag + ': Übernehmen getippt', await tap(page, '.pop.ke1 .ke1-ok'));
  await sleep(600);
  const un = await page.evaluate(() => { const b = document.querySelector('.pop.ke1 .ke1-un'); if (!b) return null; b.scrollIntoView({ block: 'nearest' }); const r = b.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { h: Math.round(r.height), w: Math.round(r.width), inV: r.top >= 0 && r.bottom <= innerHeight, vis: !!e && (e === b || b.contains(e)) }; });
  ok(tag + ': ↶ Rückgängig da, im Bild, ≥40 px', !!un && un.inV && un.vis && un.h >= 40, un);
  const head2 = await page.evaluate(MEAS, '.pop.ke1 .psh-h .psh-b, .pop.ke1 .ke1-tab');
  ok(tag + ': Kopf nach Übernehmen noch im Bild', head2.length === 8 && head2.every(b => b.inV && b.vis), head2.filter(b => !b.inV || !b.vis));
  if (SHOT) await page.screenshot({ path: SHOT + '-' + tag + '.png' });
  const nT0 = await page.evaluate(() => SYNQUENZER.serialize().length);
  ok(tag + ': ↶ getippt', await tap(page, '.pop.ke1 .ke1-un'));
  await sleep(400);
  ok(tag + ': ↶ macht rückgängig (Knopf weg)', await page.evaluate(() => !document.querySelector('.pop.ke1 .ke1-un')));
  ok(tag + ': ✕ schließt per Touch', await tap(page, '.pop.ke1 .psh-x') && await page.evaluate(() => !document.querySelector('.pop.ke1')));
  ok(tag + ': keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
(async () => {
  const b = await chromium.launch();
  await run(b, 428, 926, 'hoch');
  await run(b, 926, 428, 'quer');
  await b.close();
  console.log(res.join('\n')); console.log(fails ? 'FEHLER: ' + fails : 'ALLE OK');
})();
