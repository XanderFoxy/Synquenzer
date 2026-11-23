// ENT1D Sonde: Kopf des Blatts „Klang erkennen" (hochkant/quer)
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://127.0.0.1:8764/index.html';
const SHOT = process.argv[3] || '';
const res = []; let fails = 0;
const ok = (n, c, i) => { res.push((c ? 'OK   ' : 'FAIL ') + n + (i !== undefined ? ' :: ' + JSON.stringify(i) : '')); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(browser, w, h, tag) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('console.error: ' + m.text()); });
  await page.goto(URL);
  await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.ke1, null, { timeout: 60000 });
  await sleep(1200);
  const opened = await page.evaluate(() => {
    const sr = 44100, n = sr * 1.2, x = new Float32Array(n);
    for (let i = 0; i < n; i++) { const t = i / sr; x[i] = 0.5 * Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 2) + 0.2 * Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 3); }
    return SYNQUENZER.ke1.open({ pcm: x, sr, name: 'Ein sehr langer Aufnahmename für den Kopf des Blatts Klang erkennen Test' });
  });
  ok(tag + ': Blatt offen', !!opened);
  await page.waitForFunction(() => document.querySelector('.pop.ke1 .ke1-tab'), null, { timeout: 60000 }).catch(() => {});
  await sleep(600);
  const m = await page.evaluate(() => {
    const p = document.querySelector('.pop.ke1'); if (!p) return null;
    const R = e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), r: Math.round(r.right), b: Math.round(r.bottom) }; };
    const vis = e => { const r = e.getBoundingClientRect(); if (!r.width) return false; const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!el && (el === e || e.contains(el)); };
    const btns = [...p.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).slice(0, 14);
    return { pop: R(p), vw: innerWidth, vh: innerHeight,
      list: btns.map(b => ({ c: b.className, t: (b.textContent || '').trim().slice(0, 30), a: b.getAttribute('aria-label'), ...R(b), vis: vis(b) })),
      head: (p.querySelector('.pop-hd,.sh-hd,.pop-head,header') || {}).outerHTML ? p.querySelector('.pop-hd,.sh-hd,.pop-head,header').outerHTML.slice(0, 900) : p.innerHTML.slice(0, 1200) };
  });
  ok(tag + ': Masse', !!m, m);
  if (SHOT) await page.screenshot({ path: SHOT + '-' + tag + '.png' });
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
