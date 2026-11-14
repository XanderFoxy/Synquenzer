// SPK9 Seiten-Prüfung (Playwright, Touch 428x926): Befund 17 (Legato A3 → D4 → H3 ohne Lücke) → 3 Noten, D4 einzeln per Touch umsetzen.
// Kopf (Server, Mess-Helfer __q, SRC, page, btn, idle) aus spk6p/pruef6.mjs übernommen. Aufruf: NODE_PATH=/opt/node-tools/node_modules node spk9-ui.mjs <abs index.html>
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
const LEG = {name: 'Legato', sek: 5, gap: 0, pad: 0.02, noten: [[1.0, 2.0, 220], [2.0, 3.0, 293.665], [3.0, 4.0, 246.942]]};
{
  const P = await page(428, 926), {p, tap, drag} = P;
  const s0 = await p.evaluate(SRC, LEG); await idle(p); log('u0-legato-noten-finden', s0.notes);
  const base = await p.evaluate(async () => { window.__r1 = await __spk.render('L1'); return true; });
  // Noten bearbeiten per Touch (⋯ der Ebene → Noten bearbeiten)
  let m = await btn(p, '#spk1Sheet .spk1-lr[data-l="L1"] [data-a="lmore"]'); await tap(m); m = await btn(p, '#spk1Sheet .spk1-dd [data-s6="ed"]'); await tap(m); await idle(p); await p.waitForTimeout(300);
  const ids = await p.evaluate(() => (SPK1.ui.meta.teil2.notes.L1 || []).map(q => ({id: q.id, m: q.m, a: +q.a.toFixed(3), b: +q.b.toFixed(3)})));
  log('u1-noten-im-editor', ids);
  const idD = (ids.find(q => q.m === 62) || {}).id;
  const geo = await p.evaluate(() => { const U = SPK1.ui; return {rowH: U.v.rowH, pps: U.v.pps}; });
  const bx = await p.evaluate(i => __spk6.edBox(i), idD); await foto(p, 'spk9-01-legato-drei-noten.png');
  await drag(bx.x, bx.y, bx.x, bx.y - 2 * geo.rowH, 10);
  const ed = await p.evaluate(() => __spk6.ed()); log('u2-entwurf', {mv: ed.mv, sel: ed.sel});
  m = await btn(p, '#spk1Sheet .spk1-o.on [data-s6="edGo"]'); const tg = Date.now(); await tap(m); await idle(p); await p.waitForTimeout(200);
  const me = await p.evaluate(async () => { const sr = 48000, r = await __spk.render('L1'), x = __q.mono(r), f = (a, b) => __q.pitch(__q.win(x, sr, a, b), sr, 150, 450);
    return {e4ct: +__q.ct(f(2.3, 2.7), 329.628).toFixed(2), a3ct: +__q.ct(f(1.3, 1.7), 220).toFixed(2), b3ct: +__q.ct(f(3.3, 3.7), 246.942).toFixed(2), undo: SPK1.last.undo, stat: __spk.page.info().stat}; });
  log('u3-anwenden-einzeln', Object.assign(me, {ms: Date.now() - tg}));
  await foto(p, 'spk9-02-d4-umgesetzt.png');
  const ok = ids.length === 3 && ids.map(q => q.m).join() === '57,62,59' && Math.abs(me.e4ct) < 15 && Math.abs(me.a3ct) < 15 && Math.abs(me.b3ct) < 15;
  log('ergebnis', {ok, fehler: errs});
  await P.ctx.close();
}
fs.writeFileSync(path.join(dir, 'spk9-ui.json'), JSON.stringify({ms: Date.now() - T0, res}, null, 1));
await b.close(); srv.close();
