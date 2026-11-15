// SPK12 FFT-Probe (Long Tasks beim FFT-Wechsel, Basis vs Paket) – Ähnliches mit Merkmalen (tonal/Transient/Rauschen/Pegel) + ‹ › Alle, Auswahl merken (Speichern/Laden/Export identisch),
// „Alle Ebenen abtasten“, FFT-Text ms / Hz. Touch über CDP, synthetische Signale, Messungen statt Bildvergleich. Aufruf: node spk12-test3.mjs <abs. index.html>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const res = {}; let nOk = 0, nF = 0;
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; c ? nOk++ : nF++; console.log((c ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const b = await chromium.launch({args: ['--disable-renderer-backgrounding']});
const VIEWS = (process.env.VIEWS || '428x926,926x428,926x370').split(',').map(s => s.split('x').map(Number));
for (const [W, H] of VIEWS) {
  const tag = W + 'x' + H, errs = [];
  const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: q[2] ?? i, radiusX: 2, radiusY: 2, force: 1}))});
  const wait = ms => p.waitForTimeout(ms);
  const path3 = async (pts, dt = 18) => { await touch('touchStart', [pts[0]]); await wait(40); for (let i = 1; i < pts.length; i++) { await touch('touchMove', [pts[i]]); await wait(dt); } await touch('touchEnd', []); await wait(250); };
  const drag = (a, z, steps = 14) => path3(Array.from({length: steps + 1}, (_, i) => [a[0] + (z[0] - a[0]) * i / steps, a[1] + (z[1] - a[1]) * i / steps]));
  const tap = async q => { if (!q) throw new Error('Knopf fehlt'); await touch('touchStart', [q]); await wait(50); await touch('touchEnd', []); await wait(250); };
  const hold = async (q, ms) => { if (!q) throw new Error('Knopf fehlt'); await touch('touchStart', [q]); await wait(ms); await touch('touchEnd', []); await wait(250); };
  const sel = s => p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, s);
  const box = s => p.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetParent).map(e => { e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(), af = getComputedStyle(e, '::after'), ex = af.content && af.content !== 'none' ? Math.max(0, -parseFloat(af.top) || 0) + Math.max(0, -parseFloat(af.bottom) || 0) : 0; return {t: e.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height + ex), l: Math.round(r.left), r: Math.round(r.right), top: Math.round(r.top), bot: Math.round(r.bottom)}; }), s);
  const inView = L => L.length > 0 && L.every(x => x.w >= 44 && x.h >= 44 && x.l >= 0 && x.r <= W + 0.5 && x.top >= 0 && x.bot <= H + 0.5);
  const mark = n => p.evaluate(n => { (window.__ph = window.__ph || []).push([n, Math.round(performance.now())]); }, n);
  const shot = n => p.screenshot({path: path.join(fotos, n + '-' + tag + '.png')});
  const U_ = () => p.evaluate(() => { const U = __spk.page.ui(); return {tool: U.tool, n: U.sel.length, arts: U.sel.map(s => s.art + (s.op ? ':' + s.op : '')), stat: __spk.page.info().stat}; });
  const scr = (t, f) => p.evaluate(([t, f]) => { const U = __spk.page.ui(), r = U.mn.getBoundingClientRect(); return [r.left + spk1X(U, t), r.top + spk1Y(U, f)]; }, [t, f]);
  const view = (t0, t1, mTop, mBot) => p.evaluate(([t0, t1, a, z]) => { (window.__vj = window.__vj || []).push(performance.now()); const U = __spk.page.ui(), v = U.v; v.pps = U.W / (t1 - t0); v.t0 = t0; v.rowH = U.H / (a - z); v.mTop = a; spk1Clamp(U); spk1Dirty(U, 'all'); }, [t0, t1, mTop, mBot]);
  const tool = async (grp, k) => { await hold(await sel(`#spk1Sheet .spk1-tl button[data-s12slot="${grp}"]`), 700); const q = await sel(`#spk1Sheet .spk1-dd [data-s12t="${k}"]`); await tap(q); return p.evaluate(() => __spk.page.info().tool); };
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__spk12, null, {timeout: 60000}); await wait(600);
  await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await p.evaluate(async () => { await __spk.page.open({}); const sr = 44100, n = 24 * sr, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = 0.2 * Math.sin(2 * Math.PI * 440 * i / sr) * (1 + Math.sin(i / sr)); const r = await __spk.load({name: 'FFT-Probe', sr, ch: [x]}); await __spk.page.open({id: r.meta.id}); });
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 300000}); await wait(800);
  const res = [];
  for (let rep = 0; rep < 2; rep++) {
    await p.evaluate(() => { window.__lt0 = performance.now(); });
    await tap(await sel('#spk1Sheet [data-a="view"]')); await wait(150); await tap(await sel('#spk1Sheet .spk1-dd .spk1-n button:nth-child(4)')); await wait(2500);
    await p.evaluate(() => { const U = __spk.page.ui(); spk1Dd(U, null); U.N = 4096; spk1SpecLoad(U); }); await wait(2500);
    res.push(await p.evaluate(() => window.__lt.filter(e => e.t >= window.__lt0 && e.d > 50).map(e => Math.round(e.d))));
  }
  console.log(path.basename(path.dirname(file)) + '/' + path.basename(file) + ' ' + tag + ' FFT-Wechsel Long Tasks: ' + JSON.stringify(res));
  await ctx.close();
}
await b.close(); srv.close();
