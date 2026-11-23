// ENT1C Sonde: Video-Spur-Chips, 16 Teile a 1 Takt, hochkant + quer, echte Touch-Taps
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://127.0.0.1:8763/index.html';
const OUT = process.argv[3] || null;
const res = []; let fails = 0;
const ok = (n, c, i) => { res.push((c ? 'OK   ' : 'FAIL ') + n + (i !== undefined ? ' :: ' + JSON.stringify(i) : '')); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(b, w, h, tag) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });
  await p.goto(URL);
  await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.songView, null, { timeout: 60000 }); await sleep(1200);
  const setup = await p.evaluate(() => {
    SYNQUENZER.songView(true); const s = songEnsure(); s.bars = 16; s.marks = [];
    for (let a = 0; a < 16; a++) s.marks.push({ id: newMarkId(s), a, len: 1 });
    const V = ['klav', 'kino', 'matrix', 'text', 'app', 'kino', 'matrix', 'text'];
    s.video = []; for (let a = 0; a < 16; a++) s.video.push({ a, b: a + 1, v: V[a % V.length] });
    vvDirTidy(s); songChanged(); vd3CutSet(true); svLayout(); svDraw(true);
    return { bars: s.bars, n: (s.video || []).length };
  });
  await sleep(600);
  const m = await p.evaluate(() => {
    svDraw(true); const G = VD3.geo; if (!G) return null;
    const cv = SV.wrap.getBoundingClientRect();
    const L = G.list, ov = []; let minW = 1e9, vis = 0, noTxt = 0;
    const g = document.createElement('canvas').getContext('2d'); g.font = '700 ' + (G.h < 22 ? 9 : 10) + 'px ' + vvCols().ui;
    const chips = vd3Chips(S.song);
    for (let k = 0; k < L.length; k++) {
      const c = L[k]; if (c.x1 < 0 || c.x0 > SV.w) continue; vis++; minW = Math.min(minW, c.x1 - c.x0);
      if (k + 1 < L.length && L[k + 1].x0 < c.x1) ov.push(k);
      if (c.x0 >= 0 && c.x1 <= SV.w) { const room = c.x1 - c.x0 - 10; if (room < 14) noTxt++; }
    }
    return { y: G.y, h: G.h, n: L.length, vis, minW: +minW.toFixed(1), ov: ov.length, noTxt, cellW: SV.cellW, vvS: SV.vvS, rulerH: SV.rulerH, top: cv.top, left: cv.left, svH: SV.h };
  });
  ok(tag + ': Spur da', !!m && m.n >= 16, m);
  if (m) ok(tag + ': Spur im Bild, Raster bleibt', m.svH - m.rulerH > 120, { rest: m.svH - m.rulerH });
  if (!m) { await ctx.close(); return; }
  ok(tag + ': Überlappung 0', m.ov === 0, m.ov);
  ok(tag + ': alle sichtbaren Chips mit Text', m.noTxt === 0, m.noTxt);
  // Tippziel messen: Tap in 2px-Schritten über/unter der Spurmitte auf Chip 2 (Mitte), zählen, wo das Chip-Menü aufgeht
  const L2 = await p.evaluate(() => { const c = VD3.geo.list.find(c => c.x0 > 4); return c ? (c.x0 + c.x1) / 2 : null; });
  const cy = m.top + m.y + m.h / 2; let hits = [];
  for (let dy = -30; dy <= 30; dy += 2) {
    await p.evaluate(() => { document.querySelectorAll('.pop,.vd3pop').forEach(e => { try { e.remove(); } catch (_) {} }); try { closePop && closePop(); } catch (_) {} });
    await sleep(60);
    const before = await p.evaluate(() => typeof VD3 !== 'undefined' && VD3.popT || 0);
    await p.evaluate(() => { window.__pop = 0; if (!window.__wrapPop) { window.__wrapPop = 1; const o = vd3ChipPop; vd3ChipPop = function () { window.__pop++; return o.apply(this, arguments); }; } });
    await p.touchscreen.tap(m.left + L2, cy + dy); await sleep(420);
    const got = await p.evaluate(() => window.__pop | 0);
    if (got) hits.push(dy);
  }
  const span = hits.length ? hits[hits.length - 1] - hits[0] + 2 : 0;
  ok(tag + ': Tippziel ≥ 40 px', span >= 40, { span, von: hits[0], bis: hits[hits.length - 1] });
  await p.evaluate(() => { try { closePop && closePop(); } catch (_) {} });
  await p.screenshot({ path: __dirname + '/shot-' + tag + (OUT ? '-' + OUT : '') + '.png', clip: { x: 0, y: Math.max(0, m.top - 10), width: w, height: Math.min(140, h - m.top + 10) } });
  ok(tag + ': keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
(async () => {
  const b = await chromium.launch();
  await run(b, 428, 926, 'hoch'); await run(b, 926, 428, 'quer');
  await b.close();
  console.log(res.join('\n')); console.log('FAILS', fails);
  process.exit(fails ? 1 : 0);
})();
