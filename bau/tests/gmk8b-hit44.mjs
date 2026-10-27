// G-MK8b-merge: hit areas (elementFromPoint, real app font) of the marks editor (#wpSheet: raster chips, header), the quantize sheet
// head with [Audio folgt] (#qSheet.hasfol) and the library chips Micro + 8 genre tabs, in P1 P2 P3 L1 L2 XL W. Every target >= 44 x 44.
// Also reports the visible size of every measured control (must stay as before) and the waveform height.
// Usage: node gmk8b-hit44.mjs <index.html> [shots]
import {launch, open, sleep} from './vgs7/lib.mjs';
import {clickTone, toI16} from './gs7-v3-vs5b-h.mjs';
const APPF = process.argv[2], SHOTS = process.argv.includes('shots');
const FD = 'file://' + new URL('./fonts/', import.meta.url).pathname;
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const VP = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], XL: [926, 428], W: [844, 1180]};
const ONLY = process.env.FMTS ? process.env.FMTS.split(',') : null;
const br = await launch(null);
const T2 = [0.55, 0.67, 0.95, 1.27, 1.52, 1.74], x2 = toI16(clickTone(T2, 2.6, {toneFrom: 0.2}));
const HIT = () => { window.__hit = (b, lim = 40) => { const q = b.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2;
  const hit = (x, y) => { const e = document.elementFromPoint(x, y); return !!e && (e === b || b.contains(e)); };
  if (!hit(cx, cy)) return [0, 0];
  // the edge to 1/16 px: last hit + first miss bisected (the area is convex around the centre)
  const ext = (dx, dy) => { let a = 0, b = 0; for (let k = 1; k <= lim; k++) { if (!hit(cx + dx * k, cy + dy * k)) { b = k; break; } a = k; } if (!b) return a; for (let i = 0; i < 5; i++) { const m = (a + b) / 2; if (hit(cx + dx * m, cy + dy * m)) a = m; else b = m; } return a; };
  return [ext(-1, 0) + ext(1, 0), ext(0, -1) + ext(0, 1)].map(v => Math.round(v * 10) / 10); }; };
for (const [nm, [w, h]] of Object.entries(VP)) {
  if (ONLY && !ONLY.includes(nm)) continue;
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const p = await open(br, w, h, {ctx, url: 'file://' + APPF});
  const f = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
  await p.addStyleTag({content: f.map(([fam, file, ws]) => ws.map(wt => `@font-face{font-family:"${fam}";font-style:normal;font-weight:${wt};src:url(${FD}${file}-latin-${wt}-normal.woff2) format("woff2")}`).join('')).join('')});
  await p.evaluate(async () => { await Promise.all(['500 12px "Barlow Semi Condensed"', '700 12px "Barlow Semi Condensed"', '700 12px "JetBrains Mono"'].map(s => document.fonts.load(s))); await document.fonts.ready; });
  await p.evaluate(HIT);
  await p.evaluate(() => { UI.kbRelayout = true; window.dispatchEvent(new Event('resize')); });
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
  const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), x2), ref = {t: r.track, s: 1};
  const page0 = await p.evaluate(() => [document.scrollingElement.scrollHeight, document.scrollingElement.scrollWidth]);
  await p.evaluate(r => SYNQUENZER.wpOpen(r), ref); await sleep(500);
  const E = await p.evaluate(() => { const sh = document.getElementById('wpSheet'), out = [];
    for (const b of sh.querySelectorAll('.qh button, .qchips button')) { const q = b.getBoundingClientRect(); out.push({t: (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 14), vis: [Math.round(q.width), Math.round(q.height)], hit: __hit(b)}); }
    const cv = sh.querySelector('canvas').getBoundingClientRect();
    // the neighbours keep their own hit area: the waveform's bottom and the slider row
    const sl = sh.querySelector('.wpsl input[type=range]');
    return {out, cv: Math.round(cv.height), sl: sl ? __hit(sl, 60) : null, page: [document.scrollingElement.scrollHeight, document.scrollingElement.scrollWidth]}; });
  const small = E.out.filter(x => x.hit[0] < 43.5 || x.hit[1] < 43.5);
  ok(!small.length, nm + ' #wpSheet raster + head ≥ 44×44 ' + (small.length ? JSON.stringify(small) : E.out.map(x => x.t + ' ' + x.vis.join('×') + '→' + x.hit.join('×')).join(' | ')));
  console.log('     waveform ' + E.cv + ' px, Stärke slider hit ' + (E.sl || []).join('×'));
  ok(E.page[0] === page0[0] && E.page[1] === page0[1], nm + ' page size unchanged');
  if (SHOTS) await p.screenshot({path: new URL('./gmk8b/hit-wp-' + nm + '.png', import.meta.url).pathname});
  await p.evaluate(() => { if (typeof wpClose === 'function') wpClose(); }); await sleep(200);
  await p.evaluate(id => { SYNQUENZER.setClip(5, 0, {len: 2, notes: [{t: 0.05, d: 0.4, n: 60, v: 0.8}], take: id}); openQuantSheet(5, 0); }, r.id); await sleep(300);
  const Q = await p.evaluate(() => { const sh = document.getElementById('qSheet'), out = []; for (const b of sh.querySelectorAll('.qh button')) { const q = b.getBoundingClientRect(); if (!q.width) continue; out.push({t: (b.textContent || '').trim().slice(0, 14), vis: [Math.round(q.width), Math.round(q.height)], hit: __hit(b)}); } return out; });
  const qs = Q.filter(x => x.hit[0] < 43.5 || x.hit[1] < 43.5);
  ok(!qs.length && Q.some(x => x.t === 'Audio folgt'), nm + ' #qSheet head [Audio folgt] ✕ ≥ 44×44 ' + (qs.length ? JSON.stringify(qs) : Q.map(x => x.t + ' ' + x.vis.join('×') + '→' + x.hit.join('×')).join(' | ')));
  await p.evaluate(() => closeQuantSheet(false, true)); await sleep(200);
  // library: Micro + 8 genre tabs (each brought into view first, not under the sticky engine segment)
  await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); await MKK.decodeAll(); SYNQUENZER.openBrowser(0); }); await sleep(300);
  await p.evaluate(() => { BR.kp = 1; brRefresh(); }); await sleep(100);
  const C = await p.evaluate(async () => { const out = [], c = document.querySelector('#sndSheet .brcats'), sg = c.querySelector('.brseg');
    for (const b of c.querySelectorAll('.chip.brkp, .chip.brkg')) {
      const cr = c.getBoundingClientRect(), sr = sg.getBoundingClientRect(), land = innerWidth > innerHeight, q0 = b.getBoundingClientRect();
      if (land) c.scrollTop += q0.top - cr.top - sr.height - 20; else c.scrollLeft += q0.left - cr.left - sr.width - 20;
      await new Promise(r => setTimeout(r, 30)); const q = b.getBoundingClientRect(), sp = [...b.querySelectorAll('span')].filter(s => getComputedStyle(s).display !== 'none');
      out.push({t: sp.map(s => s.textContent).join('/'), vis: [Math.round(q.width), Math.round(q.height)], hit: __hit(b), clip: sp.some(s => s.scrollWidth > s.clientWidth + 1) || b.scrollWidth > b.clientWidth + 1}); }
    return out; });
  const cs = C.filter(x => x.hit[0] < 43.5 || x.hit[1] < 43.5);
  ok(!cs.length, nm + ' library Micro + genre tabs ≥ 44×44 ' + (cs.length ? JSON.stringify(cs) : C.map(x => x.t + ' ' + x.vis.join('×') + '→' + x.hit.join('×')).join(' | ')));
  const names = C.filter(x => x.t !== 'Micro').map(x => x.t).join(' · ');
  ok(names === 'TRANCE · TECHNO/HOUSE · ELECTRONICA · D&B/BREAKS · HIPHOP/VINTAGE · RETRO · S.E./HIT · VOCODER' && C[0].t === 'Micro' && !C.some(x => x.clip), nm + ' genre tabs carry the spec names, nothing clipped: ' + C.map(x => x.t).join(' · '));
  if (SHOTS) await p.screenshot({path: new URL('./gmk8b/hit-lib-' + nm + '.png', import.meta.url).pathname});
  ok(!p.errs.length, nm + ' console ' + JSON.stringify(p.errs.slice(0, 2)));
  await ctx.close();
}
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL PASS');
