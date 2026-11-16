// LT2 Prüfung – Tests zu den Prüfer-Befunden (A/B gegen basis, je Lauf frischer Kontext).
//  Fall G (Befund 1): Fokus-Lied mit Ebene, echter Ablauf per Tipp (Nur Rest → Alles → Nur Gefundenes → Alles), Ebenen-Farben aus,
//    danach neue Tönung (spk1TintLoad tauscht ta/tb aus) und Tönung aus. Prüft: keine WebGL-Meldung (auch Warnungen), gl.getError() == 0
//    nach jedem erzwungenen Bild, Ersatz-Satz erbt ta/tb (V.G.ta === U.gl.ta), Bilder je Stufe byte-gleich mit basis.
//  Fall R (Befund 2): Stück 180 s, ganze Ansicht, FFT 4096 → 1024 (neu gerechnet) → 4096 (schon gerechnet). Uhr für LT2 vorgetäuscht:
//    „schnell“ (+16 ms je Bild) → mehrere Kacheln je Bild, Aufbau in wenigen Bildern; „langsam“ (+50 ms) → höchstens eine je Bild;
//    „echt“ → Messung (k, Kacheln je Bild, Long Tasks). Endbild je Schritt byte-gleich mit basis.
// Aufruf: node lt2p-test.mjs <index.html> <basis.html>   ENV: FALL=G,R
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const A = path.resolve(process.argv[2]), B = path.resolve(process.argv[3]);
const files = {'/a.html': A, '/b.html': B};
const FALL = (process.env.FALL || 'G,R').split(',');
const srv = http.createServer((q, r) => { const p = files[q.url.split('?')[0]]; if (!p) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port;
const b = await chromium.launch({args: ['--disable-renderer-backgrounding']});
let ok = 0, bad = 0; const res = [];
const chk = (name, cond, info) => { (cond ? ok++ : bad++); res.push({name, ok: !!cond, info}); console.log((cond ? 'OK     ' : 'FEHLER ') + name + (info !== undefined ? '  ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const last = () => 'Last ' + os.loadavg()[0].toFixed(1);
const HASH = `(() => { const u = __spk.page.ui(), gl = u.gl.gl; while (gl.getError()) ; u.dg = true; spk1Frame(u); const e = gl.getError(); const px = new Uint8Array(u.cw * u.ch * 4); gl.readPixels(0, 0, u.cw, u.ch, gl.RGBA, gl.UNSIGNED_BYTE, px); let h = 0x811c9dc5; for (let i = 0; i < px.length; i++) { h ^= px[i]; h = Math.imul(h, 16777619); } return {h: (h >>> 0).toString(16), e}; })()`;
async function page(f) {
  const ctx = await b.newContext({viewport: {width: 926, height: 428}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), con = [];
  p.on('console', m => { if (/WebGL|GL_INVALID|GL ERROR/i.test(m.text())) con.push(m.type() + ': ' + m.text().slice(0, 140)); });
  p.on('pageerror', e => con.push('pageerror: ' + String(e).slice(0, 140)));
  await p.goto(base + '/' + f + '.html');
  await p.evaluate(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({type: 'longtask', buffered: true}); });
  await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__fokus1, null, {timeout: 90000}); await p.waitForTimeout(500);
  return {ctx, p, con};
}

// ---------- Fall G ----------
async function fallG(f) {
  const {ctx, p, con} = await page(f);
  await p.evaluate(async () => { const sr = 44100, n = 14 * sr, x = new Float32Array(n); let s1 = 7; const rnd = () => ((s1 = (s1 * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
    const tone = (f, a, b) => { const i0 = Math.round(a * sr), i1 = Math.round(b * sr), fd = Math.round(0.01 * sr); for (let i = i0; i < i1 && i < n; i++) { const e = Math.min(1, (i - i0) / fd, (i1 - i) / fd); let v = 0; for (let h = 1; h <= 8; h++) v += 0.3 / h * Math.sin(2 * Math.PI * f * h * i / sr); x[i] += e * v; } };
    tone(220, 2, 6); tone(311.13, 8, 12); for (let i = 0; i < n; i++) x[i] += 0.002 * rnd();
    await __spk.page.open({}); const r = await __spk.load({name: 'Fokus-Lied', sr, ch: [x]}); await __spk.page.open({id: r.meta.id}); });
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat) && !__spk.page.ui().specQ; }, null, {timeout: 300000});
  await p.waitForTimeout(1200);
  await p.evaluate(async () => { const u = __spk.page.ui(); const got = r => { spk1Got(u, r); spk1TintLoad(u); return r; };
    const r = got(await __spk.spk2.noten('orig', [{art: 'zeit', t0: 1.5, t1: 6.5}])), N = (r.meta.teil2.notes.orig || []).filter(q => Math.abs(1200 * Math.log2(q.f / 220)) < 60);
    got(await __spk.spk2.zuordnen(N.map(q => ({lid: 'orig', id: q.id})), 'neu', 'lead')); });
  await p.waitForFunction(() => { const U = __spk.page.ui(); return U.tint && U.tint.ids && U.tint.ids.length === U.meta.layers.length; }, null, {timeout: 30000});
  await p.waitForTimeout(1000);
  const n0 = con.length, st = [];
  for (const i of [1, 0, 2, 0]) {   // Nur Rest, Alles, Nur Gefundenes, Alles – per Tipp im Ansicht-Klappfenster
    if (!(await p.evaluate(() => !!__spk.page.ui().dd))) await p.evaluate(() => document.querySelector('#spk1Sheet [data-a="view"]').click());
    await p.waitForTimeout(300);
    await p.evaluate(i => document.querySelectorAll('#spk1Sheet .spk1-dd .spk1-f1 button')[i].click(), i);
    await p.waitForFunction(() => { const f = __fokus1.info(); return __fokus1.idle() && (f.mode === 'alles' || f.tex >= f.n) && f.n > 0 || (f && f.mode === 'alles'); }, null, {timeout: 60000});
    await p.waitForTimeout(500);
    await p.evaluate(() => spk1Dd(__spk.page.ui(), null)); await p.waitForTimeout(200);
    st.push(await p.evaluate(HASH));
  }
  // Ebenen-Farben aus (Knopf im Klappfenster) → Bild ohne Tönung
  await p.evaluate(() => document.querySelector('#spk1Sheet [data-a="view"]').click()); await p.waitForTimeout(300);
  await p.evaluate(() => { const b = [...document.querySelectorAll('#spk1Sheet .spk1-dd button')].find(x => /Ebenen-Farben/.test(x.textContent)); b && b.click(); }); await p.waitForTimeout(500);
  await p.evaluate(() => spk1Dd(__spk.page.ui(), null)); await p.waitForTimeout(200);
  st.push(await p.evaluate(HASH));
  // neue Tönung laden (ta/tb werden ersetzt), Tönung an → Bild, aus → Bild
  await p.evaluate(() => { const U = __spk.page.ui(); U.tintOn = true; spk1TintLoad(U); });
  await p.waitForTimeout(1500);
  st.push(await p.evaluate(HASH));
  await p.evaluate(() => { const U = __spk.page.ui(); U.tintOn = false; spk1Dirty(U, 'g'); }); await p.waitForTimeout(300);
  st.push(await p.evaluate(HASH));
  const inh = await p.evaluate(() => { if (typeof LT2_G === 'undefined') return null; const G = __spk.page.ui().gl, V = LT2_G.get(G); return V && V.G ? {ta: V.G.ta === G.ta, tb: V.G.tb === G.tb, lut: V.G.lut === G.lut, p: V.G.p !== G.p, n0: LT2.n0, mk: LT2.mk, err: LT2.err} : {st: V && V.st}; });
  await ctx.close();
  return {meld: con.slice(n0), st, inh};
}

// ---------- Fall R ----------
async function fallR(f, uhr) {
  const {ctx, p, con} = await page(f);
  await p.evaluate(async () => { await __spk.page.open({}); const sr = 44100, n = 180 * sr, x = new Float32Array(n);
    for (let i = 0; i < n; i++) { const t = i / sr; x[i] = 0.15 * Math.sin(2 * Math.PI * 440 * t) * (1 + Math.sin(t)) + 0.1 * Math.sin(2 * Math.PI * (220 + 30 * Math.sin(t * 0.7)) * t); }
    const r = await __spk.load({name: 'P4', sr, ch: [x]}); await __spk.page.open({id: r.meta.id}); });
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !__spk.page.ui().specQ; }, null, {timeout: 300000});
  await p.waitForTimeout(1500);
  await p.evaluate(uhr => { const U = __spk.page.ui(), v = U.v; v.pps = U.W / 180.1; v.t0 = -0.05; v.rowH = U.H / 84; v.mTop = 110; spk1Clamp(U); spk1Dirty(U, 'all');
    window.__per = []; let cnt = 0; const G = U.gl, t0 = G.tex; G.tex = (w, h, fmt, data, mip) => { if (fmt === 'r') cnt++; return t0(w, h, fmt, data, mip); };
    const o = spk1GlDraw; window.spk1GlDraw = function (u) { const c0 = cnt; o(u); window.__per.push({up: cnt - c0, k: typeof LT2 !== 'undefined' ? LT2.k : 0}); };
    if (typeof LT2 !== 'undefined' && uhr !== 'echt') { let t = 1000; const d = uhr === 'schnell' ? 16 : 50; LT2.now = () => (t += d); } }, uhr);
  await p.waitForTimeout(800);
  const rows = [];
  for (const N of [1024, 4096]) {
    const r = await p.evaluate(async N => { const U = __spk.page.ui(); const miss = () => { const v = U.v, hs = U.spec.hop / U.meta.sr, d = U.dpr; let m = 0, vis = 0; for (const c of U.spec.chunks) { if (!c) continue; const xa = ((c.x0 - 0.5) * hs - v.t0) * v.pps * d, xb = ((c.x0 + c.w - 0.5) * hs - v.t0) * v.pps * d; if (xb < 0 || xa > U.cw) continue; vis++; if (!c.tex) m++; } return {m, vis}; };
      if (typeof LT2 !== 'undefined') { LT2.k = 1; LT2.t = 0; }
      window.__per.length = 0; const t0 = performance.now(); U.N = N; spk1SpecLoad(U); let tDone = 0, tQ = 0, fQ = 0;
      await new Promise(res => { const tick = () => { const now = performance.now(); if (!U.specQ && !tQ) { tQ = now - t0; fQ = window.__per.length; } const s = U.spec && U.spec.hop ? miss() : null; if (!U.specQ && s && s.m === 0 && s.vis > 0) { tDone = now - t0; res(); return; } if (now - t0 > 90000) { res(); return; } requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
      const per = window.__per.slice(), upF = per.filter(x => x.up > 0);
      const lt = window.__lt.filter(e => e.t >= t0 && e.d > 50).map(e => Math.round(e.d)), s = miss();
      return {N, rechnen: Math.round(tQ), komplett: Math.round(tDone), bilderMitUp: upF.length, upMax: Math.max(0, ...per.map(x => x.up)), kMax: Math.max(0, ...per.map(x => x.k)), kacheln: s.vis, fehlt: s.m, lt: lt.length, ltMax: Math.max(0, ...lt), upSeq: upF.map(x => x.up).join('')}; }, N);
    await p.waitForTimeout(600);
    r.bild = await p.evaluate(HASH); rows.push(r);
    await p.waitForTimeout(600);
  }
  await ctx.close();
  return {rows, meld: con};
}

if (FALL.includes('G')) {
  const I = await fallG('a'), Bs = await fallG('b');
  console.log('G index', last(), JSON.stringify(I.st), JSON.stringify(I.inh), 'Meldungen', I.meld.length, JSON.stringify(I.meld.slice(0, 2)));
  console.log('G basis', last(), JSON.stringify(Bs.st), 'Meldungen', Bs.meld.length);
  chk('G keine-webgl-meldung-index', I.meld.length === 0, I.meld.length + ' ' + JSON.stringify(I.meld.slice(0, 2)));
  chk('G keine-webgl-meldung-basis', Bs.meld.length === 0, Bs.meld.length);
  chk('G glGetError-0-je-stufe', I.st.every(s => s.e === 0), I.st.map(s => s.e).join(','));
  chk('G ersatz-erbt-ta-tb-lut', I.inh && I.inh.ta && I.inh.tb && I.inh.lut && I.inh.p && I.inh.mk === 1 && !I.inh.err, I.inh);
  chk('G ersatz-programm-benutzt', I.inh && I.inh.n0 > 0, I.inh && I.inh.n0);
  chk('G bilder-byte-gleich-basis (7 Stufen)', I.st.length === 7 && I.st.every((s, i) => Bs.st[i] && s.h === Bs.st[i].h), I.st.map(s => s.h).join(' ') + ' | ' + Bs.st.map(s => s.h).join(' '));
}
if (FALL.includes('R')) {
  const out = {};
  for (const [f, uhr] of [['a', 'schnell'], ['b', 'echt'], ['a', 'langsam'], ['a', 'echt']]) {
    const r = await fallR(f, uhr); out[f + uhr] = r;
    console.log('R', (f === 'a' ? 'index' : 'basis'), uhr.padEnd(7), last(), r.rows.map(x => `N${x.N}: rechnen ${x.rechnen} ms, komplett ${x.komplett} ms, ${x.bilderMitUp} Bilder mit Hochladen (${x.upSeq}), max ${x.upMax}/Bild, k≤${x.kMax}, ${x.kacheln} Kacheln, fehlt ${x.fehlt}, LT ${x.lt}× max ${x.ltMax}, Bild ${x.bild.h}${x.bild.e ? ' glErr' + x.bild.e : ''}`).join(' | '), 'Meldungen', r.meld.length);
  }
  const S = out.aschnell.rows, L = out.alangsam.rows, E = out.aecht.rows, BB = out.becht.rows;
  chk('R schnell: mehrere Kacheln je Bild (k wächst bis 16)', S.every(x => x.kMax >= 8 && x.upMax >= 4), S.map(x => x.kMax + '/' + x.upMax));
  chk('R schnell: Rückwechsel (schon gerechnet) in ≤ 6 Bildern mit Hochladen', S[1].bilderMitUp <= 6 && S[1].kacheln >= 8, S[1].bilderMitUp + ' Bilder, ' + S[1].kacheln + ' Kacheln');
  chk('R langsam: höchstens 1 Kachel je Bild, k = 1', L.every(x => x.upMax <= 1 && x.kMax === 1), L.map(x => x.kMax + '/' + x.upMax));
  chk('R alle: vollständig (keine fehlende Kachel)', [...S, ...L, ...E, ...BB].every(x => x.fehlt === 0 && x.komplett > 0));
  chk('R Endbild byte-gleich basis (schnell/langsam/echt × 2 Schritte)', [S, L, E].every(R => R.every((x, i) => x.bild.h === BB[i].bild.h)), [S, L, E, BB].map(R => R.map(x => x.bild.h).join('/')).join(' '));
  chk('R keine GL-Fehler/Meldungen', [S, L, E].every(R => R.every(x => !x.bild.e)) && ['aschnell', 'alangsam', 'aecht'].every(k => out[k].meld.length === 0));
  console.log('R echt index: Kacheln je Bild', E.map(x => x.upSeq).join(' | '), 'k≤', E.map(x => x.kMax).join(','), 'LT', E.map(x => x.lt + '×' + x.ltMax).join(','), '· basis LT', BB.map(x => x.lt + '×' + x.ltMax).join(','));
}
console.log(bad ? `FEHLER ${bad} von ${ok + bad}` : `ALLES OK · ${ok} Prüfungen`);
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'lt2p-test.json'), JSON.stringify(res, null, 1));
await b.close(); srv.close();
process.exit(bad ? 1 : 0);
