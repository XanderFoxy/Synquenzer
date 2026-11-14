// SPK6 Prüfung – Seiten-Test zu den Befunden 2, 7–15 (Playwright chromium, Touch, 428×926 und 926×428): Notenmodus nach Dokumentwechsel/Löschen,
// Regler/Kopieren während einer Rechnung (Warteschlange), Kennungen in der Ebenen-Zeile, Fein ±10 ct, Filter-Regler logarithmisch, Chor ohne Noten,
// Trefferfläche, Erfolgsmeldung bleibt stehen; 3-min-Lied: Anwenden während der Wiedergabe ohne Lücke, Speicher. Konsole ohne Fehler.
// Aufruf: node spk6-pruef-ui.mjs <abs. index.html> [TEIL=kurz,lang]   → spk6-pruef-ui.json, Fotos fotos/spk6-p*.png
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const file = path.resolve(process.argv[2] || 'index.html'), dir = path.dirname(file), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(dir, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const TEIL = (process.env.TEIL || 'kurz,lang').split(',');
const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file), res = {}, errs = [], T0 = Date.now(); let fails = 0;
const ok = (k, v, cond) => { res[k] = {v, ok: !!cond}; if (!cond) fails++; console.log((cond ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const foto = (p, n) => p.screenshot({path: path.join(fotos, n)});
const b = await chromium.launch();
async function page(w, h) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__spk6, null, {timeout: 60000}); await p.waitForTimeout(800);
  const cdp = await ctx.newCDPSession(p);
  const tap = async q => { await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(220); };
  const drag = async (x0, y0, x1, y1, n = 8) => {   // echter Touch-Zug (touchstart → moves → touchend)
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y: y0}]});
    for (let i = 1; i <= n; i++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x0 + (x1 - x0) * i / n, y: y0 + (y1 - y0) * i / n}]}); await p.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await p.waitForTimeout(220);
  };
  return {ctx, p, tap, drag};
}
const btn = (p, sel) => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent); if (!e) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, Math.round(r.width), Math.round(r.height)]; }, sel);
const idle = p => p.waitForFunction(() => { const U = __spk.page.ui(); return U && !U.busy; }, null, {timeout: 120000});
const stat = p => p.evaluate(() => __spk.page.info().stat);
const sizes = (p, sel) => p.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetParent).map(e => { const q = e.getBoundingClientRect(); return {t: (e.textContent || e.dataset.s6 || '').trim().slice(0, 16), w: Math.round(q.width), h: Math.round(q.height), inX: q.left >= -0.5 && q.right <= innerWidth + 0.5, inY: q.top >= -0.5 && q.bottom <= innerHeight + 0.5}; }), sel);
const klein = a => a.filter(x => x.w < 36 || x.h < 36).map(x => x.t + ' ' + x.w + '×' + x.h);
const rowInfo = p => p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-lr[data-l]')].map(r => ({l: r.dataset.l, nm: (r.querySelector('.spk1-nm') || {}).textContent || '', tag: (r.querySelector('.spk6-tg') || {}).textContent || '', blink: /stepFl/.test(r.style.animation || '')})));
// Tonhöhe (Autokorrelation, parabolisch verfeinert) eines Ausschnitts – läuft in der Seite
const PITCH = `window.__p6 = (x, sr, f0, f1) => { const n = x.length, lo = Math.floor(sr / f1), hi = Math.ceil(sr / f0); let best = -1, bl = lo; const r = l => { let s = 0, e1 = 0, e2 = 0; for (let i = 0; i + l < n; i++) { s += x[i] * x[i + l]; e1 += x[i] * x[i]; e2 += x[i + l] * x[i + l]; } return s / Math.sqrt(e1 * e2 + 1e-20); };
  for (let l = lo; l <= hi; l++) { const v = r(l); if (v > best) { best = v; bl = l; } } const a = r(bl - 1), c = r(bl + 1), d = (a - c) / (2 * (a - 2 * best + c)); return sr / (bl + (isFinite(d) ? d : 0)); };
  window.__ct = (f, g) => 1200 * Math.log2(f / g);`;
const SRC = async () => {
  const sr = 48000, n = sr * 6, L = new Float32Array(n), N = [[1.0, 2.0, 220], [2.2, 3.2, 293.665], [3.4, 4.4, 246.942]], fo = f => 1 / (1 + ((f - 700) / 180) ** 2) + 0.7 / (1 + ((f - 1200) / 220) ** 2);
  for (const [a, b, f] of N) for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) { const t = i / sr, e = Math.min(1, (t - a) / 0.02, (b - t) / 0.03); let v = 0; for (let h = 1; h <= 30 && h * f < 9000; h++) v += fo(h * f) * Math.sin(2 * Math.PI * h * f * t) / Math.sqrt(h); L[i] += 0.12 * e * v; }
  for (let i = 0; i < n; i++) L[i] += 0.2 * Math.sin(2 * Math.PI * 55 * i / sr);
  const r = await __spk.load({name: 'Werkstatt', sr, ch: [L, L.slice()]}); await __spk.page.open({id: r.meta.id});
  await __spk.mask({von: 'orig', nach: {art: 'gesang', name: 'Gesang'}, sel: {art: 'rect', t0: 0.8, t1: 4.7, f0: 150, f1: 9500}});
  const q = await spk1Call('noten', {doc: SPK1.doc, lid: 'L1'}); spk1Got(SPK1.ui, q); spk1TintLoad(SPK1.ui);
  return {id: r.meta.id, notes: (q.meta.teil2.notes.L1 || []).map(z => z.m)};
};
