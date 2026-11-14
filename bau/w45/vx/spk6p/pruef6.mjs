// Unabhaengige Pruefung SPK6 (Ebenen-Werkstatt) – Playwright chromium, Touch, 428x926 und 926x428.
// Aufruf: NODE_PATH=/opt/node-tools/node_modules node pruef6.mjs <abs index.html> [TEIL=a,b,c,d]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file), fotos = path.join(dir, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const TEIL = (process.env.TEIL || 'a,b,c,d').split(',');
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file), res = {}, errs = [], T0 = Date.now();
const log = (k, v) => { res[k] = v; console.log(k, JSON.stringify(v)); };
const foto = (p, n) => p.screenshot({path: path.join(fotos, n)});
const b = await chromium.launch();
const H = `window.__q = {
  pitch(x, sr, f0, f1) { const n = x.length, lo = Math.floor(sr / f1), hi = Math.ceil(sr / f0); const r = l => { let s = 0, e1 = 0, e2 = 0; for (let i = 0; i + l < n; i++) { s += x[i] * x[i + l]; e1 += x[i] * x[i]; e2 += x[i + l] * x[i + l]; } return s / Math.sqrt(e1 * e2 + 1e-20); };
    let best = -1, bl = lo; for (let l = lo; l <= hi; l++) { const v = r(l); if (v > best) { best = v; bl = l; } } const a = r(bl - 1), c = r(bl + 1), d = (a - c) / (2 * (a - 2 * best + c)); return sr / (bl + (isFinite(d) ? d : 0)); },
  ct: (f, g) => 1200 * Math.log2(f / g),
  mono(r) { const n = r.ch[0].length, y = new Float32Array(n); for (const c of r.ch) for (let i = 0; i < n; i++) y[i] += c[i] / r.ch.length; return y; },
  win: (x, sr, t0, t1) => x.subarray(Math.max(0, Math.round(t0 * sr)), Math.min(x.length, Math.round(t1 * sr))),
  rms(x) { let s = 0; for (let i = 0; i < x.length; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, x.length)); },
  d2(x) { let m = 0; for (let i = 2; i < x.length; i++) { const v = Math.abs(x[i] - 2 * x[i - 1] + x[i - 2]); if (v > m) m = v; } return m; },
  maxdiff(a, b) { let d = 0; for (let c = 0; c < a.ch.length; c++) { const x = a.ch[c], y = b.ch[c] || b.ch[0]; const n = Math.max(x.length, y.length); for (let i = 0; i < n; i++) d = Math.max(d, Math.abs((x[i] || 0) - (y[i] || 0))); } return d; },
  band(x, sr, f0, f1) { let N = 1; while (N < x.length) N *= 2; const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < x.length; i++) re[i] = x[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / x.length));
    for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= N; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < N; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr; re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } }
    let e = 0; const k0 = Math.floor(f0 * N / sr), k1 = Math.min(N / 2, Math.ceil(f1 * N / sr)); for (let k = k0; k <= k1; k++) e += re[k] * re[k] + im[k] * im[k]; return e; },
  db: (a, b) => 10 * Math.log10((a + 1e-30) / (b + 1e-30)),
  // Knack-Mass: max. 2. Differenz im Fenster um t / Median der max. 2. Differenz in 5-ms-Stuecken des ruhigen Bereichs
  click(x, sr, t, q0, q1) { const w = this.win(x, sr, t - 0.06, t + 0.06), m = this.d2(w); const ref = []; for (let s = q0; s + 0.005 <= q1; s += 0.005) ref.push(this.d2(this.win(x, sr, s, s + 0.005))); ref.sort((a, b) => a - b); return +(m / (ref[ref.length >> 1] || 1e-9)).toFixed(2); },
};`;
// Legato-Gesang: A3 1,0–2,0 · D4 2,0–3,0 · B3 3,0–4,0 phasenstetig, Formanten; Bass 55 Hz als Rest
const SRC = async (o) => {
  const sr = 48000, n = sr * (o.sek || 5), L = new Float32Array(n), N = o.noten, fo = f => 1 / (1 + ((f - 700) / 180) ** 2) + 0.7 / (1 + ((f - 1200) / 220) ** 2) + 0.3 / (1 + ((f - 2600) / 300) ** 2);
  let ph = 0; const t0 = N[0][0], t1 = N[N.length - 1][1];
  const H = 24, phs = new Float64Array(H + 1);
  for (let i = Math.round(t0 * sr); i < Math.round(t1 * sr); i++) {
    const t = i / sr, q = N.find(z => t >= z[0] && t < z[1]); if (!q) { phs.fill(0); continue; }
    const f = q[2], dp = o.dip != null ? o.dip : 0, e = Math.min(1, (t - t0) / 0.03, (t1 - t) / 0.03, o.gap ? dp + (1 - dp) * Math.min(1, (t - q[0]) / 0.02, (q[1] - t) / 0.03) : 1); let v = 0;
    for (let h = 1; h <= H && h * f < 5000; h++) { phs[h] += 2 * Math.PI * h * f / sr; v += fo(h * f) * Math.sin(phs[h]) / Math.sqrt(h); }
    L[i] += 0.12 * e * v;
  }
  for (let i = 0; i < n; i++) L[i] += 0.15 * Math.sin(2 * Math.PI * 55 * i / sr);
  if (o.pad) for (let i = Math.round((t0 - 0.1) * sr); i < Math.round((t1 + 0.1) * sr); i++) { const t = i / sr, e = Math.min(1, (t - t0 + 0.1) / 0.05, (t1 + 0.1 - t) / 0.05); L[i] += o.pad * e * Math.sin(2 * Math.PI * 659.255 * t); }
  const r = await __spk.load({name: o.name || 'Pruef', sr, ch: [L, L.slice()]}); await __spk.page.open({id: r.meta.id});
  const m = await __spk.mask({von: 'orig', nach: {art: 'gesang', name: 'Gesang'}, sel: {art: 'rect', t0: t0 - 0.2, t1: t1 + 0.2, f0: 150, f1: 9500}});
  spk1Got(SPK1.ui, m);
  const q = await spk1Call('noten', {doc: SPK1.doc, lid: 'L1'}); spk1Got(SPK1.ui, q); spk1TintLoad(SPK1.ui);
  return {id: r.meta.id, notes: (q.meta.teil2.notes.L1 || []).map(z => [z.m, +z.a.toFixed(3), +z.b.toFixed(3), z.st, z.id])};
};
async function page(w, h) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(w + 'x' + h + ' ' + String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(w + 'x' + h + ' ' + m.text()); });
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__spk6, null, {timeout: 60000}); await p.waitForTimeout(800);
  await p.addScriptTag({content: H});
  const cdp = await ctx.newCDPSession(p);
  const tap = async q => { await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(220); };
  const drag = async (x0, y0, x1, y1, n = 8) => {
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y: y0}]});
    for (let i = 1; i <= n; i++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x0 + (x1 - x0) * i / n, y: y0 + (y1 - y0) * i / n}]}); await p.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await p.waitForTimeout(220);
  };
  return {ctx, p, tap, drag, cdp};
}
const btn = (p, sel, txt) => p.evaluate(([s, t]) => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent && (!t || x.textContent.trim() === t)); if (!e) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, Math.round(r.width), Math.round(r.height)]; }, [sel, txt || null]);
const idle = p => p.waitForFunction(() => { const U = __spk.page.ui(); return U && !U.busy; }, null, {timeout: 300000});
const stat = p => p.evaluate(() => __spk.page.info().stat);
const rowInfo = p => p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-lr[data-l]')].map(r => ({l: r.dataset.l, nm: (r.querySelector('.spk1-nm') || {}).textContent || '', tag: (r.querySelector('.spk6-tg') || {}).textContent || ''})));
// Schieberegler per Touch: vom Daumen (aktueller Wert) zum Zielwert ziehen
const slide = async (P, sel, v) => { const g = await P.p.evaluate(([s, v]) => { const e = document.querySelector(s); e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(), mn = +e.min, mx = +e.max, th = 16, x = val => r.left + th / 2 + (r.width - th) * (val - mn) / (mx - mn); return {x0: x(+e.value), x1: x(v), y: r.top + r.height / 2}; }, [sel, v]); await P.drag(g.x0, g.y, g.x1, g.y, 10); return P.p.evaluate(s => +document.querySelector(s).value, sel); };
const LEG = {name: 'Legato', sek: 5, gap: 1, pad: 0.02, noten: [[1.0, 1.92, 220], [2.0, 2.92, 293.665], [3.0, 3.92, 246.942]]};

if (TEIL.includes('probe')) {
  const P = await page(428, 926), {p} = P;
  for (const v of [{dip: 0}, {dip: 0, pad: 0}]) { const s0 = await p.evaluate(SRC, Object.assign({}, LEG, {gap: 1}, v)); log('probe-' + v.dip, s0.notes); }
  await P.ctx.close();
}
if (TEIL.includes('a')) {
  const P = await page(428, 926), {p, tap, drag} = P;
  const s0 = await p.evaluate(SRC, LEG); await idle(p); log('a0-quelle', s0);
  const base = await p.evaluate(async () => { const r1 = await __spk.render('L1'), m0 = await __spk.render(null); window.__r1 = r1; window.__m0 = m0; return {n: r1.ch[0].length}; });
  // 1) Kopieren per Touch
  let m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m);
  m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="dup"]'); await tap(m); await idle(p); await p.waitForTimeout(200);
  const k1 = await p.evaluate(async () => { const r2 = await __spk.render('L2'), m1 = await __spk.render(null); window.__r2a = r2; let dmix = 0; for (let c = 0; c < m1.ch.length; c++) for (let i = 0; i < m1.ch[c].length; i++) dmix = Math.max(dmix, Math.abs(m1.ch[c][i] - __m0.ch[c][i] - __r1.ch[c][i])); return {kopieGleich: __q.maxdiff(__r1, r2), mixMinusQuelleAbw: +dmix.toExponential(2), layers: SPK1.ui.meta.layers.map(l => l.id + ':' + l.name + ':k6=' + (l.k6 || 0))}; });
  log('a1-kopie', Object.assign(k1, {rows: await rowInfo(p)}));
  // 2) Unabhaengigkeit der Kopie auf Masken-Ebene: „In Ebene“ (aus Original, verschieben) in die Kopie → was passiert mit der Quelle?
  const ind = await p.evaluate(async () => {
    const before = await __spk.render('L1'); const r = await __spk.mask({von: 'orig', nach: 'L2', modus: 'verschieben', sel: {art: 'rect', t0: 2.2, t1: 2.8, f0: 150, f1: 9500}}); spk1Got(SPK1.ui, r);
    const after = await __spk.render('L1'), sr = 48000, x0 = __q.mono(before), x1 = __q.mono(after);
    const out = {quelleRmsVorher: +__q.rms(__q.win(x0, sr, 2.3, 2.7)).toFixed(4), quelleRmsNachher: +__q.rms(__q.win(x1, sr, 2.3, 2.7)).toFixed(4), undo: SPK1.last.undo};
    const u = await __spk.undo(); spk1Got(SPK1.ui, u); return out; });
  log('a2-kopie-maske-unabhaengig', ind);
  // 3) Noten bearbeiten (Kopie L2) per Touch: D4 zwei Zeilen hoch, Anwenden
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="ed"]'); await tap(m); await idle(p); await p.waitForTimeout(250);
  const ids = await p.evaluate(() => { const N = SPK1.ui.meta.teil2.notes.L2 || []; return N.map(q => ({id: q.id, m: q.m, a: +q.a.toFixed(3), b: +q.b.toFixed(3), st: q.st})); });
  log('a3-noten-L2', ids);
  const idD = (ids.find(q => q.m === 62) || {}).id, idB = (ids.find(q => q.m === 59) || {}).id;
  const geo = await p.evaluate(() => { const U = SPK1.ui; return {rowH: U.v.rowH, pps: U.v.pps, step: spk1Grid0(U).beat / 4}; });
  let bx = await p.evaluate(i => __spk6.edBox(i), idD); await foto(p, 'p6-01-noten-bearbeiten.png');
  await drag(bx.x, bx.y, bx.x, bx.y - 2 * geo.rowH, 10);
  let ed = await p.evaluate(() => __spk6.ed()); log('a3-entwurf', {mv: ed.mv, sel: ed.sel, geo});
  m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edGo"]'); let tg = Date.now(); await tap(m); await idle(p); await p.waitForTimeout(150);
  const t3 = Date.now() - tg;
  const me = await p.evaluate(async () => { const sr = 48000, r = await __spk.render('L2'), x = __q.mono(r), x0 = __q.mono(__r1), L1n = await __spk.render('L1');
    const f = (y, a, b, lo, hi) => __q.pitch(__q.win(y, sr, a, b), sr, lo, hi);
    return {e4ct: +__q.ct(f(x, 2.3, 2.7, 200, 450), 329.628).toFixed(2), a3ct: +__q.ct(f(x, 1.3, 1.7, 150, 400), 220).toFixed(2), b3ct: +__q.ct(f(x, 3.3, 3.7, 150, 400), 246.942).toFixed(2),
      klickOrig: [__q.click(x0, sr, 2.0, 1.3, 1.7), __q.click(x0, sr, 3.0, 1.3, 1.7)], klickNeu: [__q.click(x, sr, 2.0, 1.3, 1.7), __q.click(x, sr, 3.0, 1.3, 1.7)],
      rmsUebergang: [2.0, 3.0].map(t => [+__q.rms(__q.win(x, sr, t - 0.03, t - 0.01)).toFixed(4), +__q.rms(__q.win(x, sr, t - 0.01, t + 0.01)).toFixed(4), +__q.rms(__q.win(x, sr, t + 0.01, t + 0.03)).toFixed(4)]),
      quelleUnveraendert: __q.maxdiff(__r1, L1n), undo: SPK1.last.undo, stat: __spk.page.info().stat}; });
  log('a4-anwenden-tonhoehe-klick', Object.assign(me, {ms: t3}));
  await p.evaluate(async () => { window.__r2b = await __spk.render('L2'); });
  // 4) Zeit: B3 1/16 spaeter ziehen
  bx = await p.evaluate(i => __spk6.edBox(i), idB);
  await drag(bx.x, bx.y, bx.x + geo.step * geo.pps, bx.y, 10); ed = await p.evaluate(() => __spk6.ed());
  m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edGo"]'); await tap(m); await idle(p); await p.waitForTimeout(150);
  const mt = await p.evaluate(async (st) => { const sr = 48000, r = await __spk.render('L2'), x = __q.mono(r); const env = []; for (let t = 2.9; t < 3.4; t += 0.005) env.push(+__q.rms(__q.win(x, sr, t, t + 0.005)).toFixed(3));
    const on = (() => { for (let t = 3.02; t < 3.4; t += 0.001) if (__q.rms(__q.win(x, sr, t, t + 0.004)) > 0.03) return +t.toFixed(3); return null; })();
    return {einsatzB3: on, soll: +(3 + st).toFixed(3), klick: [__q.click(x, sr, 3.0, 1.3, 1.7), __q.click(x, sr, 3 + st, 1.3, 1.7), __q.click(x, sr, 4 + st, 1.3, 1.7)], b3ct: +__q.ct(__q.pitch(__q.win(x, sr, 3.4, 3.8), sr, 150, 400), 246.942).toFixed(2), env}; }, geo.step);
  log('a5-zeit-verschieben', Object.assign(mt, {mv: ed.mv}));
  await foto(p, 'p6-02-nach-zeit.png');
  // 5) Undo/Redo per Touch ueber die Kopf-Tasten
  for (let i = 0; i < 2; i++) { m = await btn(p, '#spk1Sheet [data-a="undo"]'); await tap(m); await idle(p); }
  const ud = await p.evaluate(async () => { const r = await __spk.render('L2'); return {gleichOriginalKopie: __q.maxdiff(r, __r2a), a6: !!SPK1.ui.meta.layers.find(l => l.id === 'L2').a6}; });
  m = await btn(p, '#spk1Sheet [data-a="redo"]'); await tap(m); await idle(p);
  const rd = await p.evaluate(async () => { const r = await __spk.render('L2'); return {gleichNachAnwenden: __q.maxdiff(r, __r2b)}; });
  m = await btn(p, '#spk1Sheet [data-a="redo"]'); await tap(m); await idle(p);
  log('a6-undo-redo', {ud, rd});
  // Fertig
  m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edEnd"]'); if (m) await tap(m);
  // 6) Chor per Touch: 4 Stimmen, Quinten, Breite 50 %, Vorhoeren, A/B, Erzeugen
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chor"]'); await tap(m); await p.waitForTimeout(250);
  m = await btn(p, '#spk1Sheet .spk1-dd button', '4'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd button', 'Quinten'); await tap(m);
  const brv = await slide(P, '#spk1Sheet .spk1-dd input[data-s6="cbr"]', 0.5);
  await foto(p, 'p6-03-chor-blatt.png');
  const chSt = await p.evaluate(() => Object.assign({}, SPK1.ui.s6c));
  m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chorPv"]'); tg = Date.now(); await tap(m);
  await p.waitForFunction(() => SPK1.pl && SPK1.pl.s6, null, {timeout: 120000}); const tpv = Date.now() - tg;
  const pvl = await p.evaluate(() => ({layers: SPK1.ui.meta.layers.length, stat: __spk.page.info().stat, ddOffen: !!SPK1.ui.dd}));
  m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chorAB"]'); if (m) await tap(m);
  m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chorGo"]'); tg = Date.now(); await tap(m); await idle(p); await p.waitForTimeout(200);
  const tch = Date.now() - tg;
  const ch = await p.evaluate(async () => { const sr = 48000, V = SPK1.ui.meta.layers.filter(l => l.r6 === 'chor'), out = [];
    for (const l of V) { const r = await __spk.render(l.id), x = __q.mono(r); const fA = __q.pitch(__q.win(x, sr, 1.3, 1.7), sr, 90, 700), fD = __q.pitch(__q.win(x, sr, 2.3, 2.7), sr, 90, 700); out.push({id: l.id, nm: l.name, pan: l.fx && l.fx.pan, dt: l.a6.dt, ctA: +__q.ct(fA, 220).toFixed(1), ctD: +__q.ct(fD, 293.665).toFixed(1), rmsL: +__q.rms(r.ch[0]).toFixed(4), rmsR: +__q.rms(r.ch[1]).toFixed(4)}); }
    return {key: await __spk6.key('L1'), voices: out, undo: SPK1.last.undo}; });
  log('a7-chor', {chSt, brv, tVorhoeren: tpv, pvl, tErzeugen: tch, ...ch, rows: (await rowInfo(p)).filter(r => /Quinte/.test(r.nm))});
  await foto(p, 'p6-04-chor-ebenen.png');
  m = await btn(p, '#spk1Sheet [data-a="undo"]'); await tap(m); await idle(p);
  const chu = await p.evaluate(() => SPK1.ui.meta.layers.map(l => l.id));
  m = await btn(p, '#spk1Sheet [data-a="redo"]'); await tap(m); await idle(p);
  log('a8-chor-undo', {nachUndo: chu, nachRedo: await p.evaluate(() => SPK1.ui.meta.layers.length)});
  // 7) Effekte per Touch-Regler auf L2
  const pre = await p.evaluate(async () => { window.__r2c = await __spk.render('L2'); return 1; });
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="fx"]'); await tap(m); await p.waitForTimeout(250);
  await foto(p, 'p6-05-effekte.png');
  const lpv = await slide(P, '#spk1Sheet .spk1-dd input[data-s6="lp"]', 1000); await idle(p); await p.waitForTimeout(200);
  const fx1 = await p.evaluate(async () => { const sr = 48000, r = await __spk.render('L2'), x = __q.mono(r), x0 = __q.mono(__r2c), w = y => __q.win(y, sr, 1.2, 1.9);
    return {fx: SPK1.ui.meta.layers.find(l => l.id === 'L2').fx, hfDb: +__q.db(__q.band(w(x), sr, 2500, 6000), __q.band(w(x0), sr, 2500, 6000)).toFixed(1), lowDb: +__q.db(__q.band(w(x), sr, 150, 500), __q.band(w(x0), sr, 150, 500)).toFixed(1), ddOffen: !!SPK1.ui.dd}; });
  log('a9-tiefpass-touch', Object.assign(fx1, {regler: lpv}));
  // Hall + Pan per Touch (Blatt ggf. neu oeffnen)
  if (!(await p.evaluate(() => !!SPK1.ui.dd))) { m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="fx"]'); await tap(m); await p.waitForTimeout(250); }
  const hv = await slide(P, '#spk1Sheet .spk1-dd input[data-s6="hall"]', 0.6); await idle(p); await p.waitForTimeout(150);
  if (!(await p.evaluate(() => !!SPK1.ui.dd))) { m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="fx"]'); await tap(m); await p.waitForTimeout(250); }
  const pnv = await slide(P, '#spk1Sheet .spk1-dd input[data-s6="pan"]', -1); await idle(p); await p.waitForTimeout(150);
  const fx2 = await p.evaluate(async () => { const sr = 48000, r = await __spk.render('L2'), x = __q.mono(r), x0 = __q.mono(__r2c);
    return {fx: SPK1.ui.meta.layers.find(l => l.id === 'L2').fx, schwanzDb: +__q.db(__q.rms(__q.win(x, sr, 4.3, 4.8)) ** 2, __q.rms(__q.win(x0, sr, 4.3, 4.8)) ** 2 + 1e-12).toFixed(1), L: +__q.rms(r.ch[0]).toFixed(4), R: +__q.rms(r.ch[1]).toFixed(4),
      reglerAnzeige: [...document.querySelectorAll('#spk1Sheet .spk1-dd input[type=range]')].map(e => e.dataset.s6 + '=' + e.value).join(' ')}; });
  log('a10-hall-pan-touch', Object.assign(fx2, {hall: hv, pan: pnv, rows: (await rowInfo(p)).filter(r => r.l === 'L2')}));
  await foto(p, 'p6-06-effekte-gesetzt.png');
  // 8) Zwei Regler kurz hintereinander, waehrend die Seite abspielt (Worker rechnet Bloecke mit Hall/Echo)
  await p.evaluate(() => spk1Dd(SPK1.ui, null));
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="fx"]'); await tap(m); await p.waitForTimeout(250);
  const two = await p.evaluate(async () => { __spk.play(0.5); await new Promise(z => setTimeout(z, 400));
    const set = (k, v) => { const e = document.querySelector('#spk1Sheet .spk1-dd input[data-s6="' + k + '"]'); e.value = v; e.dispatchEvent(new Event('input')); e.dispatchEvent(new Event('change')); };
    set('lo', 6); await new Promise(z => setTimeout(z, 60)); set('hi', -6); await new Promise(z => setTimeout(z, 3000)); __spk.stop();
    const f = SPK1.ui.meta.layers.find(l => l.id === 'L2').fx, sh = [...document.querySelectorAll('#spk1Sheet .spk1-dd input[type=range]')].filter(e => /^(lo|hi)$/.test(e.dataset.s6)).map(e => e.dataset.s6 + '=' + e.value);
    return {fxLo: f && f.lo, fxHi: f && f.hi, reglerZeigt: sh, stat: __spk.page.info().stat}; });
  log('a11-zwei-regler-schnell', two);
  await p.evaluate(() => spk1Dd(SPK1.ui, null));
  // 9) Abspielen: Startzeit bis zum ersten Block, Blockzeit mit Hall/Echo + 4 Chorstimmen
  const pl = await p.evaluate(async () => { const t = performance.now(); __spk.play(1.0); while (!(SPK1.pl && SPK1.pl.src.length) && performance.now() - t < 20000) await new Promise(z => setTimeout(z, 10)); const first = performance.now() - t;
    await new Promise(z => setTimeout(z, 1500)); const pos = __spk.pos(); __spk.stop();
    const tb = []; for (const k of [0, 1, 2]) { const a = performance.now(); await spk1Call('block', {doc: SPK1.doc, k: k + 5, mix: null}); tb.push(Math.round(performance.now() - a)); }
    return {ersterBlockMs: Math.round(first), pos: +(pos || 0).toFixed(2), blockMs: tb, blockDauerMs: Math.round(16384 / 48)}; });
  log('a12-abspielen', pl);
  // 10) In die Matrix (Audio) mit Effekten
  const mx = await p.evaluate(async () => { const U = SPK1.ui; U.act = 'L2'; U.loop = [0, 2]; try { spk1Layers(U); } catch (e) {} let r = null, err = null; try { r = await spk2MxAudio(U); } catch (e) { err = String(e); } return {r: r && {kind: r.kind, take: r.take, track: r.track, scene: r.scene}, err, stat: __spk.page.info().stat}; });
  log('a13-in-matrix', mx);
  await p.evaluate(() => { try { SPK1.ui.loop = null; SPK1.ui.act = 'orig'; spk1Layers(SPK1.ui); } catch (e) {} });
  // 11) Quelle loeschen, Kopie bleibt: klingt der Gesang doppelt?
  const del = await p.evaluate(async () => { const sr = 48000; const L = SPK1.ui.meta.layers; const save = []; for (const l of L) if (l.r6 === 'chor') save.push(l.id);
    // Nur Quelle + Kopie: Chor stumm, Effekte der Kopie aus
    for (const id of save) await __spk.layer('mute', id, true); await __spk6.fx('L2', {pan: 0, lo: 0, mi: 0, hi: 0, hp: 0, lp: 0, hall: 0, echo: 0, sat: 0});
    const m1 = await __spk.render(null), r = await __spk.layer('weg', 'L1'); spk1Got(SPK1.ui, r); const m2 = await __spk.render(null);
    const x0 = __q.mono(__m0), x1 = __q.mono(m1), x2 = __q.mono(m2), w = y => __q.rms(__q.win(y, sr, 1.3, 1.7));
    return {rmsOriginalMix: +w(x0).toFixed(4), rmsMitKopie: +w(x1).toFixed(4), rmsNachLoeschenQuelle: +w(x2).toFixed(4), layers: SPK1.ui.meta.layers.map(l => l.id + ':' + l.name)}; });
  log('a14-quelle-loeschen', del);
  await p.evaluate(async () => { const u = await __spk.undo(); spk1Got(SPK1.ui, u); });
  // 12) Speichern / Neuladen der Seite (IDB) – bitgleich?
  const pre2 = await p.evaluate(async () => { const a = await __spk.render(null); const ids = SPK1.ui.meta.layers.map(l => l.id); const per = {}; for (const id of ids) { const r = await __spk.render(id); per[id] = Array.from(r.ch[0].subarray(48000, 48000 + 96000)).reduce((s, v) => s + v * v, 0); } await __spk.save(); window.__keep = {id: SPK1.doc}; return {doc: SPK1.doc, ids, mixE: a.ch[0].reduce((s, v) => s + v * v, 0), per}; });
  await p.reload(); await p.waitForFunction(() => window.__spk, null, {timeout: 60000}); await p.waitForTimeout(800); await p.addScriptTag({content: H});
  const post = await p.evaluate(async id => { await __spk.page.open({id}); await new Promise(z => setTimeout(z, 1500)); const a = await __spk.render(null); const ids = SPK1.ui.meta.layers.map(l => l.id); const per = {}; for (const i of ids) { const r = await __spk.render(i); per[i] = Array.from(r.ch[0].subarray(48000, 48000 + 96000)).reduce((s, v) => s + v * v, 0); } return {ids, mixE: a.ch[0].reduce((s, v) => s + v * v, 0), per, rows: [...document.querySelectorAll('#spk1Sheet .spk1-lr[data-l]')].map(r => r.dataset.l + ':' + ((r.querySelector('.spk6-tg') || {}).textContent || ''))}; }, pre2.doc);
  log('a15-neuladen', {vor: pre2, nach: post, mixGleich: Math.abs(pre2.mixE - post.mixE) < 1e-6 * Math.max(1, pre2.mixE)});
  await foto(p, 'p6-07-nach-neuladen.png');
  // 13) Dokument wechseln, waehrend „Noten bearbeiten“ offen ist (Andere Quelle)
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="ed"]'); await tap(m); await idle(p); await p.waitForTimeout(250);
  const n0 = await p.evaluate(() => (SPK1.ui.meta.teil2.notes.L2 || []).find(q => q.m === 64 || q.m === 57) || SPK1.ui.meta.teil2.notes.L2[0]);
  bx = await p.evaluate(i => __spk6.edBox(i), n0.id); const rh = await p.evaluate(() => SPK1.ui.v.rowH); await drag(bx.x, bx.y, bx.x, bx.y - rh, 8);
  const sw = await p.evaluate(async () => { const sr = 48000, n = sr * 3, L = new Float32Array(n); for (let i = sr; i < 2 * sr; i++) L[i] = 0.3 * Math.sin(2 * Math.PI * 330 * i / sr);
    const r = await __spk.load({name: 'Zweites', sr, ch: [L]}); const q = await __spk.page.open({id: r.meta.id}); await new Promise(z => setTimeout(z, 800));
    const m = await __spk.mask({von: 'orig', nach: {art: 'lead', name: 'Lead'}, sel: {art: 'rect', t0: 0.9, t1: 2.1, f0: 150, f1: 3000}}); spk1Got(SPK1.ui, m);
    const U = SPK1.ui; return {doc: SPK1.doc, tool: U.tool, s6e: U.s6e ? {lid: U.s6e.lid, mv: __spk6.ed().mv.length} : null, optZeile: (U.op.querySelector('.spk1-o.on label') || {}).textContent || '', toolKnopfAn: [...U.tl.querySelectorAll('button[data-tool].on')].map(x => x.dataset.tool)}; });
  // Rechteck ziehen im neuen Dokument – entsteht eine Auswahl?
  const R0 = await p.evaluate(() => { const r = SPK1.ui.mn.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  await drag(R0[0] + R0[2] * 0.3, R0[1] + R0[3] * 0.4, R0[0] + R0[2] * 0.6, R0[1] + R0[3] * 0.6, 8);
  const sw2 = await p.evaluate(() => ({sel: SPK1.ui.sel.length, tool: SPK1.ui.tool, stat: __spk.page.info().stat}));
  log('a16-dokwechsel-im-notenmodus', {sw, nachZiehen: sw2});
  await foto(p, 'p6-08-dokwechsel.png');
  await P.ctx.close();
}

if (TEIL.includes('b')) {   // quer 926x428: Erreichbarkeit der Blaetter, Kennungen
  const P = await page(926, 428), {p, tap, drag} = P;
  const s0 = await p.evaluate(SRC, LEG); await idle(p);
  await p.evaluate(async () => { const r = await __spk6.dup('L1'); spk1Got(SPK1.ui, r); const f = await __spk6.fx('L2', {echo: 0.3}); spk1Got(SPK1.ui, f); });
  const reach = async (name, open) => { await open(); await p.waitForTimeout(300);
    const g = await p.evaluate(() => { const d = SPK1.ui.dd; if (!d) return null; const r = d.getBoundingClientRect(), xl = r.left + 5, it = [...d.querySelectorAll('button,input')].filter(e => e.offsetParent);
      return {xl, ddX: [Math.round(r.left), Math.round(r.right)], dd: [Math.round(r.top), Math.round(r.bottom), Math.round(r.height)], vp: innerHeight, scrollH: d.scrollHeight, clientH: d.clientHeight, oy: getComputedStyle(d).overflowY, n: it.length,
        last: (it[it.length - 1].textContent || it[it.length - 1].dataset.s6 || '').trim().slice(0, 20), lastBottom: Math.round(it[it.length - 1].getBoundingClientRect().bottom)}; });
    // per Touch im Blatt nach oben wischen, dann letztes Element sichtbar?
    if (g) { await drag(g.xl, g.dd[0] + g.dd[2] - 20, g.xl, g.dd[0] + 20, 10);
      g.nachWischen = await p.evaluate(() => { const d = SPK1.ui.dd; if (!d) return 'Blatt zu'; const it = [...d.querySelectorAll('button,input')].filter(e => e.offsetParent), l = it[it.length - 1].getBoundingClientRect(), r = d.getBoundingClientRect(); return {scrollTop: d.scrollTop, lastIn: l.bottom <= r.bottom + 1 && l.top >= r.top - 1 && l.bottom <= innerHeight}; }); }
    await foto(p, 'p6-q-' + name + '.png'); log('b-' + name, g); await p.evaluate(() => spk1Dd(SPK1.ui, null)); };
  await reach('menue', async () => { const m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); });
  await reach('chor', async () => { let m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chor"]'); await tap(m); });
  await reach('effekte', async () => { let m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="fx"]'); await tap(m); });
  // Kennung in der Zeile: ueberdeckt sie andere Bedienelemente?
  const tagGeo = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-lr[data-l]')].map(r => { const nm = r.querySelector('.spk1-nm'), t = r.querySelector('.spk6-tg'); if (!t) return null; const a = nm.getBoundingClientRect(), c = t.getBoundingClientRect(), s = r.querySelector('.spk1-s'); const sr = s && s.getBoundingClientRect(); return {l: r.dataset.l, nmR: Math.round(a.right), tagR: Math.round(c.right), sL: sr ? Math.round(sr.left) : null, tagIn: c.right <= a.right + 0.5}; }).filter(Boolean));
  log('b-kennung-quer', tagGeo);
  // Notenmodus quer: Optionszeile per Touch wischen bis „Fertig“
  let m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="ed"]'); await tap(m); await idle(p); await p.waitForTimeout(300);
  const op0 = await p.evaluate(() => { const o = SPK1.ui.op, r = o.getBoundingClientRect(), f = o.querySelector('.spk1-o.on [data-s6="edEnd"]').getBoundingClientRect(); return {op: [Math.round(r.left), Math.round(r.right), Math.round(r.top), Math.round(r.bottom)], fertigX: Math.round(f.left), scrollW: o.scrollWidth, clientW: o.clientWidth}; });
  await drag(op0.op[1] - 30, (op0.op[2] + op0.op[3]) / 2, op0.op[0] + 30, (op0.op[2] + op0.op[3]) / 2, 12);
  const op1 = await p.evaluate(() => { const o = SPK1.ui.op, f = o.querySelector('.spk1-o.on [data-s6="edEnd"]').getBoundingClientRect(); return {scrollLeft: o.scrollLeft, fertigX: Math.round(f.left), fertigSichtbar: f.right <= innerWidth}; });
  log('b-optionszeile-wischen', {op0, op1, ed: await p.evaluate(() => __spk6.ed())});
  await foto(p, 'p6-q-notenmodus.png');
  await P.ctx.close();
}

if (TEIL.includes('c')) {   // Leistung + Speicher: 3-min-Lied
  const P = await page(428, 926), {p} = P;
  const L3 = {name: 'Lang', sek: 180, gap: 1, noten: []}; const sc = [220, 246.942, 277.183, 293.665, 329.628, 369.994, 415.305, 440];
  for (let t = 2, k = 0; t < 176; t += 0.5, k++) L3.noten.push([t, t + 0.42, sc[(k * 3) % 8]]);
  const tl = Date.now(); const s0 = await p.evaluate(SRC, L3); await idle(p); log('c0-laden-noten', {ms: Date.now() - tl, n: s0.notes.length});
  const wk = () => p.workers().find(w => true);
  const mem = async () => { const w = p.workers()[0]; if (!w) return null; return w.evaluate(id => { const d = K.docs.get(id); if (!d) return null; let by = 0; for (const x of (d.a6 || new Map()).values()) by += x.byteLength; return {a6: d.a6 ? d.a6.size : 0, mb: +(by / 1e6).toFixed(1), undo: d.undo.length, undoMbStreifen: +(d.undo.reduce((a, u) => a + u.bytes, 0) / 1e6).toFixed(1)}; }, s0.id); };
  const r = await p.evaluate(async () => { const N = SPK1.ui.meta.teil2.notes.L1, o = {anwenden: []};
    for (let k = 0; k < 12; k++) { const q = N[20 + k * 7]; const t = performance.now(); const a = await __spk6.plan('L1', [{id: q.id, dm: 1, dt: 0}]); spk1Got(SPK1.ui, a); o.anwenden.push(Math.round(performance.now() - t)); }
    let t = performance.now(); await __spk6.plan('L1', [{id: N[5].id, dm: 1, dt: 0}], 1, [N[5].a - 0.4, N[5].a + 7.6]); o.vorhoeren = Math.round(performance.now() - t);
    return o; });
  log('c1-anwenden-12x', Object.assign(r, {speicher: await mem()}));
  const r2 = await p.evaluate(async () => { const o = {}; let t = performance.now(); const c = await __spk6.chor('L1', 4, 'satz'); spk1Got(SPK1.ui, c); o.chor4 = Math.round(performance.now() - t);
    t = performance.now(); const f = await __spk6.fx('L1', {hall: 0.5, echo: 0.4, lp: 6000}); spk1Got(SPK1.ui, f); o.fx = Math.round(performance.now() - t);
    for (const l of SPK1.ui.meta.layers.filter(x => x.r6 === 'chor')) { const g = await __spk6.fx(l.id, {hall: 0.3}); spk1Got(SPK1.ui, g); }
    const tb = []; for (let k = 100; k < 108; k++) { const a = performance.now(); await spk1Call('block', {doc: SPK1.doc, k, mix: null}); tb.push(Math.round(performance.now() - a)); } o.bloeckeMs = tb; o.blockDauerMs = 341;
    t = performance.now(); __spk.play(60); while (!(SPK1.pl && SPK1.pl.src.length) && performance.now() - t < 30000) await new Promise(z => setTimeout(z, 10)); o.startMs = Math.round(performance.now() - t);
    const P0 = SPK1.pl; let gaps = 0; const t1 = performance.now(); while (performance.now() - t1 < 6000) { await new Promise(z => setTimeout(z, 50)); if (SPK1.pl === P0 && P0.pend >= 1 && P0.src.length === 0) gaps++; } o.posNach6s = +(__spk.pos() || 0).toFixed(2); o.leerlaufProben = gaps; __spk.stop();
    return o; });
  log('c2-chor-fx-abspielen', Object.assign(r2, {speicher: await mem()}));
  await P.ctx.close();
}

if (TEIL.includes('e')) {   // Zusatz: Chor-Intervalle sauber gemessen, Tiefpass, Kopie einer Audio-Ebene, Transponieren + Note, Chor ohne Noten, Fertig mit Entwurf
  const P = await page(428, 926), {p, tap, drag} = P;
  const s0 = await p.evaluate(SRC, Object.assign({}, LEG, {pad: 0})); await idle(p); log('e0-quelle', s0.notes);
  const ci = await p.evaluate(async () => { const sr = 48000, out = {}; const exp = {57: 220, 62: 293.665, 59: 246.942};
    const meas = async (lid, segs) => { const r = await __spk.render(lid), x = __q.mono(r); return segs.map(([a, b, f]) => +__q.ct(__q.pitch(__q.win(x, sr, a, b), sr, f * 0.84, f * 1.19), f).toFixed(1)); };
    for (const art of ['terz', 'quinte', 'oktave', 'dopplung']) { const c = await __spk6.chor('L1', 2, art); const v = c.voices; out[art] = [];
      for (const z of v) { const iv = {'t+': null, 't-': null, 'q+': null, 'q-': null, 'o+': 12, 'o-': -12, u: 0}[z.iv];
        // Soll aus Tonart D-Dur: A3→Cis4/Fis3 (Terz), E4/D3 (Quinte); D4→Fis4/H3, A4/G3; B3→D4/G3, Fis4/E3
        const T = {'t+': [4, 4, 3], 't-': [-3, -3, -4], 'q+': [7, 7, 7], 'q-': [-7, -7, -7], 'o+': [12, 12, 12], 'o-': [-12, -12, -12], u: [0, 0, 0]}[z.iv];
        const segs = [[1.3, 1.7, 220 * Math.pow(2, T[0] / 12)], [2.3, 2.7, 293.665 * Math.pow(2, T[1] / 12)], [3.3, 3.7, 246.942 * Math.pow(2, T[2] / 12)]];
        const m = await meas(z.lid, segs); out[art].push({iv: z.iv, streuCt: z.ct, gemessenCt: m, abwVomZiel: m.map(c => +(c - z.ct).toFixed(1))}); }
      const u = await __spk.undo(); spk1Got(SPK1.ui, u); }
    // Klicks in einer Chorstimme an den Notengrenzen
    const c = await __spk6.chor('L1', 2, 'terz'); const r = await __spk.render(c.voices[0].lid), x = __q.mono(r);
    out.klickChor = [__q.click(x, sr, 1.96, 1.3, 1.7), __q.click(x, sr, 2.96, 1.3, 1.7)];
    const u = await __spk.undo(); spk1Got(SPK1.ui, u);
    return out; });
  log('e1-chor-intervalle', ci);
  const lp = await p.evaluate(async () => { const sr = 48000, r0 = await __spk.render('L1'); const o = {};
    for (const v of [200, 1000, 3000, 10000, 20000]) { const f = await __spk6.fx('L1', {lp: v}); const r = await __spk.render('L1'), w = y => __q.win(__q.mono(y), sr, 1.2, 1.9); o['lp' + v] = +__q.db(__q.band(w(r), sr, 2500, 6000), __q.band(w(r0), sr, 2500, 6000)).toFixed(1); }
    const f = await __spk6.fx('L1', {lp: 0}); spk1Got(SPK1.ui, f); return o; });
  log('e2-tiefpass-wirkung-dB-ueber-2500Hz', lp);
  // Regler-Abbildung Tiefpass: welcher Bruchteil des Reglerwegs liegt im Bereich 200 Hz…5 kHz?
  log('e2b-tiefpass-regler', {min: 0, max: 20000, step: 100, anteilWeg200bis5000: +((5000 - 200) / 20000).toFixed(3), hinweis: '0 = aus, 100 → 200 Hz (stärkste Wirkung), 20000 ≈ aus'});
  // Kopie einer schon umgesetzten Ebene (Audio-Ebene)
  const da = await p.evaluate(async () => { const N = SPK1.ui.meta.teil2.notes.L1, q = N.find(z => z.m === 62); let a = await __spk6.plan('L1', [{id: q.id, dm: 2, dt: 0}]); spk1Got(SPK1.ui, a);
    const r1 = await __spk.render('L1'); const d = await __spk6.dup('L1'); spk1Got(SPK1.ui, d); const r2 = await __spk.render(d.lid);
    const N2 = SPK1.ui.meta.teil2.notes[d.lid], q2 = N2.find(z => z.m === 59); a = await __spk6.plan(d.lid, [{id: q2.id, dm: -2, dt: 0}]); spk1Got(SPK1.ui, a);
    const r1b = await __spk.render('L1'), r2b = await __spk.render(d.lid), sr = 48000, x = __q.mono(r2b);
    return {kopieGleich: __q.maxdiff(r1, r2), quelleUnberuehrt: __q.maxdiff(r1, r1b), kopieB3nachA3ct: +__q.ct(__q.pitch(__q.win(x, sr, 3.3, 3.7), sr, 180, 260), 220).toFixed(1), kopieD4nachE4ct: +__q.ct(__q.pitch(__q.win(x, sr, 2.3, 2.7), sr, 280, 390), 329.628).toFixed(1), a6b: SPK1.ui.meta.layers.find(l => l.id === d.lid).a6.b}; });
  log('e3-kopie-audio-ebene', da);
  // Ganze Ebene +1 per Touch, danach eine Note +2 im Editor → 3 Halbtöne
  let m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="tr1"]'); await tap(m); await idle(p);
  const tr = await p.evaluate(async () => { const sr = 48000, r = await __spk.render('L1'), x = __q.mono(r); return {A3: +__q.ct(__q.pitch(__q.win(x, sr, 1.3, 1.7), sr, 190, 290), 233.082).toFixed(1), stat: __spk.page.info().stat, noten: SPK1.ui.meta.teil2.notes.L1.map(q => q.m)}; });
  const tr2 = await p.evaluate(async () => { const sr = 48000, N = SPK1.ui.meta.teil2.notes.L1, q = N.find(z => Math.abs(z.a - 1.0) < 0.1); const a = await __spk6.plan('L1', [{id: q.id, dm: 2, dt: 0}]); spk1Got(SPK1.ui, a); const r = await __spk.render('L1'), x = __q.mono(r);
    return {A3plus3ct: +__q.ct(__q.pitch(__q.win(x, sr, 1.3, 1.7), sr, 220, 310), 261.626).toFixed(1), B3plus1ct: +__q.ct(__q.pitch(__q.win(x, sr, 3.3, 3.7), sr, 220, 310), 261.626).toFixed(1)}; });
  log('e4-transponieren-dann-note', {tr, tr2});
  // Chor auf einer Ebene ohne Noten (Blatt per Touch)
  await p.evaluate(async () => { const m = await __spk.mask({von: 'orig', nach: {art: 'lead', name: 'Ohne Noten'}, sel: {art: 'rect', t0: 0.5, t1: 4.5, f0: 40, f1: 120}}); spk1Got(SPK1.ui, m); });
  const lidN = await p.evaluate(() => SPK1.ui.meta.layers.find(l => l.name === 'Ohne Noten').id);
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="' + lidN + '"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chor"]'); await tap(m); await p.waitForTimeout(200);
  m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chorGo"]'); await tap(m); await idle(p); await p.waitForTimeout(200);
  log('e5-chor-ohne-noten', {stat: await stat(p)});
  // Fertig mit offenem Entwurf: fragt einmal, zweiter Tipp schliesst
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="ed"]'); await tap(m); await idle(p); await p.waitForTimeout(250);
  m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edM1"]'); await tap(m);
  m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edEnd"]'); await tap(m); const t1 = await p.evaluate(() => ({txt: document.querySelector('#spk1Sheet .spk1-o.on [data-s6="edEnd"]').textContent, ed: !!__spk6.ed()}));
  m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edEnd"]'); await tap(m); const t2 = await p.evaluate(() => ({ed: !!__spk6.ed(), tool: SPK1.ui.tool}));
  log('e6-fertig-mit-entwurf', {t1, t2});
  // Enter-Taste, waehrend ein Knopf im Notenmodus den Fokus hat
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="ed"]'); await tap(m); await idle(p); await p.waitForTimeout(250);
  const before = await p.evaluate(() => SPK1.last.nu);
  await p.evaluate(() => { const b = document.querySelector('#spk1Sheet .spk1-o.on [data-s6="edM1"]'); b.focus(); });
  await p.keyboard.press('Enter'); await idle(p); await p.waitForTimeout(400);
  log('e7-enter-auf-knopf', {fokus: '+1', undoVorher: before, undoNachher: await p.evaluate(() => SPK1.last.nu), entwurf: await p.evaluate(() => __spk6.ed() && __spk6.ed().mv), stat: await stat(p)});
  await P.ctx.close();
}

if (TEIL.includes('f')) {   // Kennungen: Ueberdeckung in beiden Lagen, mit „Kopie · neu · FX“
  for (const [w, h] of [[428, 926], [926, 428]]) {
    const P = await page(w, h), {p} = P;
    await p.evaluate(SRC, Object.assign({}, LEG, {pad: 0})); await idle(p);
    await p.evaluate(async () => { const r = await __spk6.dup('L1'); spk1Got(SPK1.ui, r); const N = SPK1.ui.meta.teil2.notes.L2; let a = await __spk6.plan('L2', [{id: N[0].id, dm: 1, dt: 0}]); spk1Got(SPK1.ui, a); a = await __spk6.fx('L2', {hall: 0.3}); spk1Got(SPK1.ui, a); a = await __spk6.chor('L1', 2, 'terz'); spk1Got(SPK1.ui, a); a = await __spk6.fx(a.voices[0].lid, {echo: 0.3}); spk1Got(SPK1.ui, a); spk1Layers(SPK1.ui); });
    await p.waitForTimeout(400);
    const g = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-lr[data-l]')].map(r => { const nm = r.querySelector('.spk1-nm'), t = r.querySelector('.spk6-tg'), s = r.querySelector('.spk1-s'), a = nm.getBoundingClientRect(), sr = s ? s.getBoundingClientRect() : null, c = t ? t.getBoundingClientRect() : null, sp = nm.querySelector('span');
      return {l: r.dataset.l, name: sp ? sp.textContent : nm.textContent, tag: t ? t.textContent : '', nm: [Math.round(a.left), Math.round(a.right)], tagR: c ? Math.round(c.right) : null, soloL: sr ? Math.round(sr.left) : null, ueberS: c && sr ? Math.round(c.right - sr.left) : null, nameAbgeschnitten: sp ? sp.scrollWidth > sp.clientWidth : nm.scrollWidth > nm.clientWidth, zeileH: Math.round(r.getBoundingClientRect().height)}; }));
    log('f-kennung-' + w + 'x' + h, g);
    const box = await p.evaluate(() => { const r = SPK1.ui.ly.getBoundingClientRect(); return {x: r.left, y: r.top, width: r.width, height: Math.min(r.height, innerHeight - r.top)}; });
    await p.screenshot({path: path.join(fotos, 'p6-kennung-' + w + 'x' + h + '.png'), clip: box});
    await p.evaluate(() => { const r = SPK1.ui.ly.querySelector('.spk1-lr[data-l="L2"]'); r.scrollIntoView({block: 'center'}); });
    const b2 = await p.evaluate(() => { const r = SPK1.ui.ly.querySelector('.spk1-lr[data-l="L2"]').getBoundingClientRect(); return {x: r.left, y: r.top, width: r.width, height: r.height}; });
    await p.screenshot({path: path.join(fotos, 'p6-kennung-L2-' + w + 'x' + h + '.png'), clip: b2});
    await P.ctx.close();
  }
}
if (TEIL.includes('g')) {   // 3-min-Lied: Anwenden waehrend der Wiedergabe → Aussetzer? Ganze Ebene ±1, Kopieren
  const P = await page(428, 926), {p} = P;
  const L3 = {name: 'Lang', sek: 180, gap: 1, noten: []}; const sc = [220, 246.942, 277.183, 293.665, 329.628, 369.994, 415.305, 440];
  for (let t = 2, k = 0; t < 176; t += 0.5, k++) L3.noten.push([t, t + 0.42, sc[(k * 3) % 8]]);
  await p.evaluate(SRC, L3); await idle(p);
  const r = await p.evaluate(async () => { const N = SPK1.ui.meta.teil2.notes.L1, o = {};
    __spk.play(30); const t0 = performance.now(); while (!(SPK1.pl && SPK1.pl.src.length) && performance.now() - t0 < 20000) await new Promise(z => setTimeout(z, 10));
    await new Promise(z => setTimeout(z, 1000)); const P0 = SPK1.pl, c = AU.ctx; let leer = 0, maxLeer = 0, cur = 0; const tA = performance.now();
    const pr = __spk6.plan('L1', [{id: N[100].id, dm: 1, dt: 0}]).then(a => { spk1Got(SPK1.ui, a); o.anwendenMs = Math.round(performance.now() - tA); });
    const tl = performance.now(); while (performance.now() - tl < 9000) { await new Promise(z => setTimeout(z, 20)); const live = P0.src.some(s => true) && SPK1.pl === P0; const ahead = P0.src.length; if (SPK1.pl === P0 && ahead === 0) { cur += 20; leer += 20; maxLeer = Math.max(maxLeer, cur); } else cur = 0; }
    await pr; o.stilleMsGesamt = leer; o.laengsteStilleMs = maxLeer; o.wiedergabeLaeuft = SPK1.pl === P0; __spk.stop();
    let t = performance.now(); const tr = await __spk6.trans('L1', 1); spk1Got(SPK1.ui, tr); o.ganzeEbenePlus1Ms = Math.round(performance.now() - t);
    t = performance.now(); const d = await __spk6.dup('L1'); spk1Got(SPK1.ui, d); o.kopierenMs = Math.round(performance.now() - t);
    return o; });
  log('g1-anwenden-waehrend-wiedergabe', r);
  await P.ctx.close();
}
if (TEIL.includes('h')) {   // Regler / Kopieren, waehrend eine lange Rechnung (Chor) laeuft
  const P = await page(428, 926), {p, tap} = P;
  const L3 = {name: 'Mittel', sek: 40, gap: 1, noten: []}; const sc = [220, 246.942, 277.183, 293.665, 329.628, 369.994, 415.305, 440];
  for (let t = 2, k = 0; t < 38; t += 0.5, k++) L3.noten.push([t, t + 0.42, sc[(k * 3) % 8]]);
  await p.evaluate(SRC, L3); await idle(p);
  await p.evaluate(async () => { const r = await __spk6.dup('L1'); spk1Got(SPK1.ui, r); });
  // Chor-Blatt per Touch: 6 Stimmen, Erzeugen
  let m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chor"]'); await tap(m); await p.waitForTimeout(200);
  m = await btn(p, '#spk1Sheet .spk1-dd button', '6'); await tap(m);
  m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chorGo"]'); await tap(m);
  // sofort: Effekte der Kopie oeffnen und Hall-Regler ziehen
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="fx"]'); await tap(m); await p.waitForTimeout(150);
  const busy1 = await p.evaluate(() => SPK1.ui.busy);
  const hv = await slide(P, '#spk1Sheet .spk1-dd input[data-s6="hall"]', 0.7);
  const mid = await p.evaluate(() => ({regler: +document.querySelector('#spk1Sheet .spk1-dd input[data-s6="hall"]').value, fx: SPK1.ui.meta.layers.find(l => l.id === 'L2').fx || null, busy: SPK1.ui.busy, stat: __spk.page.info().stat}));
  await idle(p); await p.waitForTimeout(300);
  const end = await p.evaluate(() => ({fx: SPK1.ui.meta.layers.find(l => l.id === 'L2').fx || null, chor: SPK1.ui.meta.layers.filter(l => l.r6 === 'chor').length, stat: __spk.page.info().stat}));
  log('h1-regler-waehrend-chor', {busyBeimZiehen: busy1, hv, mid, end});
  // Kopieren waehrend einer laufenden Rechnung
  await p.evaluate(() => spk1Dd(SPK1.ui, null));
  const t = await p.evaluate(() => { const N = SPK1.ui.meta.teil2.notes.L1; return spk1Call('s6chor', {doc: SPK1.doc, lid: 'L1', n: 4, art: 'terz', dry: 0}).then(() => 1); });
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chor"]'); await tap(m); await p.waitForTimeout(100);
  m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="chorGo"]'); await tap(m); await p.waitForTimeout(150);
  const n0 = await p.evaluate(() => SPK1.ui.meta.layers.length);
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="dup"]'); await tap(m); await p.waitForTimeout(150);
  const k1 = await p.evaluate(() => ({busy: SPK1.ui.busy, stat: __spk.page.info().stat, dd: !!SPK1.ui.dd}));
  await idle(p); await p.waitForTimeout(300);
  const k2 = await p.evaluate(() => ({layers: SPK1.ui.meta.layers.map(l => l.name), stat: __spk.page.info().stat}));
  log('h2-kopieren-waehrend-rechnung', {k1, k2});
  await P.ctx.close();
}
if (TEIL.includes('i')) {   // Formant-Erhalt bei Oktave + (Gesang) und bei Chor Oktave ↓
  const P = await page(428, 926), {p, tap} = P;
  await p.evaluate(SRC, Object.assign({}, LEG, {pad: 0})); await idle(p);
  const r = await p.evaluate(async () => { const sr = 48000;
    const cen = (x) => { const w = __q.win(x, sr, 1.2, 1.9); let N = 32768; const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < w.length && i < N; i++) re[i] = w[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / Math.min(N, w.length)));
      const bands = [[300, 1000], [1000, 2000], [2000, 3500]]; return bands.map(([a, b]) => __q.band(w, sr, a, b)); };
    const r0 = __q.mono(await __spk.render('L1')); const b0 = cen(r0);
    const t = await __spk6.trans('L1', 12); spk1Got(SPK1.ui, t); const r1 = __q.mono(await __spk.render('L1')); const b1 = cen(r1);
    const rel = b => b.map(v => +(10 * Math.log10(v / b[0])).toFixed(1));
    return {vorher_dB_rel_300_1000: rel(b0), nachOktave_dB_rel: rel(b1), pitch: +__q.ct(__q.pitch(__q.win(r1, sr, 1.3, 1.7), sr, 380, 520), 440).toFixed(1)}; });
  log('i1-formant-oktave-plus', r);
  await P.ctx.close();
}
if (TEIL.includes('j')) {   // hochkant: sichtbare Knoepfe im Notenmodus ohne Wischen; Trefferhoehe der Balken; Ebene loeschen im Notenmodus
  const P = await page(428, 926), {p, tap} = P;
  await p.evaluate(SRC, Object.assign({}, LEG, {pad: 0})); await idle(p);
  let m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="ed"]'); await tap(m); await idle(p); await p.waitForTimeout(300);
  const vis = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-o.on [data-s6]')].map(e => { const r = e.getBoundingClientRect(); return e.textContent.trim() + (r.right <= innerWidth && r.left >= 0 ? '' : ' (nur nach Wischen)'); }));
  const hit = await p.evaluate(() => { const U = SPK1.ui, q = SPK1.ui.meta.teil2.notes.L1[0], b = __spk6.edBox(q.id); return {balkenH: b.h, trefferH: Math.max(b.h, 18), rowH: U.v.rowH}; });
  const verw = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet button')].filter(b => b.textContent.trim() === 'Verwerfen').length);
  log('j1-notenmodus-hochkant', {knoepfe: vis, hit, knoepfeMitText_Verwerfen: verw});
  // Ebene loeschen, waehrend ihr Notenmodus offen ist
  await p.evaluate(async () => { const r = await __spk6.dup('L1'); spk1Got(SPK1.ui, r); });
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="ed"]'); await tap(m); await idle(p); await p.waitForTimeout(250);
  m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L2"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd button', 'Ebene löschen'); await tap(m); await p.waitForTimeout(300); const tx = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-dd button')].map(b => b.textContent.trim()).slice(-2)); m = await btn(p, '#spk1Sheet .spk1-dd button', tx[tx.length - 1]); if (m) await tap(m); await idle(p); await p.waitForTimeout(500); log('j2-knopftexte', tx);
  const st = await p.evaluate(() => ({tool: SPK1.ui.tool, s6e: SPK1.ui.s6e && SPK1.ui.s6e.lid, layers: SPK1.ui.meta.layers.map(l => l.id), zeile: (SPK1.ui.op.querySelector('.spk1-o.on label') || {}).textContent || ''}));
  log('j2-ebene-geloescht-im-notenmodus', st);
  await foto(p, 'p6-09-geloescht-im-notenmodus.png');
  await P.ctx.close();
}
if (TEIL.includes('k')) {   // 3-min: Fortschritt beim Anwenden ueber die Bedienung (Zeitverlauf der Anzeige)
  const P = await page(428, 926), {p, tap} = P;
  const L3 = {name: 'Lang', sek: 180, gap: 1, noten: []}; const sc = [220, 246.942, 277.183, 293.665, 329.628, 369.994, 415.305, 440];
  for (let t = 2, k = 0; t < 176; t += 0.5, k++) L3.noten.push([t, t + 0.42, sc[(k * 3) % 8]]);
  await p.evaluate(SRC, L3); await idle(p);
  let m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="ed"]'); await tap(m); await idle(p); await p.waitForTimeout(300);
  const q0 = await p.evaluate(() => { const N = spk6EdNotes(SPK1.ui); return N[0].id; }); const bx = await p.evaluate(i => __spk6.edBox(i), q0); await tap([bx.x, bx.y]);
  m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edM1"]'); await tap(m);
  await p.evaluate(() => { window.__tl = []; const t0 = performance.now(); const o = new MutationObserver(() => { __tl.push(Math.round(performance.now() - t0) + 'ms ' + SPK1.ui.st.textContent + ' | ' + (SPK1.ui.s6go ? SPK1.ui.s6go.textContent : '')); }); o.observe(SPK1.ui.st, {childList: true, characterData: true, subtree: true}); o.observe(SPK1.ui.s6go, {childList: true, characterData: true, subtree: true}); window.__ob = o; window.__t0 = t0; });
  m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edGo"]'); await tap(m); await idle(p); await p.waitForTimeout(200);
  const tl = await p.evaluate(() => { __ob.disconnect(); return __tl; });
  // erste Fortschrittsangabe > 0 %
  log('k1-fortschritt-zeitverlauf', {n: tl.length, erste: tl.slice(0, 6), letzte: tl.slice(-3)});
  await P.ctx.close();
}
if (TEIL.includes('l')) {   // „▶ Auswahl“ (Auswahl abspielen) mit umgesetzter Ebene / Chorstimme
  const P = await page(428, 926), {p, tap, drag} = P;
  await p.evaluate(SRC, Object.assign({}, LEG, {pad: 0})); await idle(p);
  const r = await p.evaluate(async () => { const sel = [{art: 'rect', t0: 0.5, t1: 4.5, f0: 100, f1: 9000}], E = async (mix) => { let e = 0; for (const k of [3, 4, 5, 6, 7, 8, 9, 10, 11]) { const b = await spk1Call('block', {doc: SPK1.doc, k, mix, sel, sv: 77}); for (const c of b.ch) for (let i = 0; i < c.length; i++) e += c[i] * c[i]; } return +e.toFixed(2); };
    const o = {}; o.vorher_L1 = await E('L1'); o.vorher_mix = await E(null);
    const N = SPK1.ui.meta.teil2.notes.L1; let a = await __spk6.plan('L1', [{id: N[1].id, dm: 2, dt: 0}]); spk1Got(SPK1.ui, a);
    o.nachUmsetzen_L1 = await E('L1'); o.nachUmsetzen_mix = await E(null);
    const ohneSel = async (mix) => { let e = 0; for (const k of [3, 4, 5, 6, 7, 8, 9, 10, 11]) { const b = await spk1Call('block', {doc: SPK1.doc, k, mix}); for (const c of b.ch) for (let i = 0; i < c.length; i++) e += c[i] * c[i]; } return +e.toFixed(2); };
    o.nachUmsetzen_L1_ohneAuswahl = await ohneSel('L1'); return o; });
  log('l1-auswahl-abspielen', r);
  await P.ctx.close();
}
if (TEIL.includes('m')) {   // Zerlegen erneut, nachdem die Gesang-Ebene kopiert wurde
  const P = await page(428, 926), {p} = P;
  const r = await p.evaluate(async () => { const sr = 48000, n = sr * 6, L = new Float32Array(n);
    for (let i = 0; i < n; i++) { const t = i / sr; L[i] = 0.15 * Math.sin(2 * Math.PI * 55 * t) + (t > 1 && t < 5 ? 0.1 * (Math.sin(2 * Math.PI * 330 * t) + 0.5 * Math.sin(2 * Math.PI * 660 * t) + 0.3 * Math.sin(2 * Math.PI * 990 * t)) : 0) + ((i % 24000) < 400 ? 0.4 * (Math.random() * 2 - 1) : 0); }
    const d = await __spk.load({name: 'Zerl', sr, ch: [L, L.slice()]}); await __spk.page.open({id: d.meta.id}); await new Promise(z => setTimeout(z, 500));
    let z = await __spk.zerlegen({}); spk1Got(SPK1.ui, z);
    const g = SPK1.ui.meta.layers.find(l => l.z === 'gesang'), E = async id => { const r = await __spk.render(id); return +r.ch[0].reduce((s, v) => s + v * v, 0).toFixed(2); };
    const o = {layers1: SPK1.ui.meta.layers.map(l => l.id + ':' + l.name), gesang1: await E(g.id), mix1: await E(null)};
    const c = await __spk6.dup(g.id); spk1Got(SPK1.ui, c); o.kopie = await E(c.lid);
    z = await __spk.zerlegen({weiter: false}); spk1Got(SPK1.ui, z);
    o.layers2 = SPK1.ui.meta.layers.map(l => l.id + ':' + l.name); o.gesang2 = await E(g.id); o.kopie2 = await E(c.lid); o.mix2 = await E(null);
    return o; });
  log('m1-zerlegen-nach-kopie', r);
  await P.ctx.close();
}
log('konsole-fehler', errs.slice(0, 10));
fs.writeFileSync(path.join(dir, 'pruef6-' + TEIL.join('') + '.json'), JSON.stringify({ms: Date.now() - T0, res}, null, 1));
await b.close(); srv.close();
console.log('fertig', Math.round((Date.now() - T0) / 1000) + ' s');
