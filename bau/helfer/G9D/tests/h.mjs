// G9D Test-Helfer: Chromium (Touch-Emulation), App = bau/helfer/G9D/index.html über einen kleinen HTTP-Server
// (/app/index.html = die App, /app/vendor/… = vendor/ des Repos, wie auf GitHub Pages /Synquenzer/…); o.file: true = file:// (ohne Muster)
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import path from 'path'; import {fileURLToPath} from 'url'; import http from 'http'; import fs from 'fs';
export const DIR = path.dirname(fileURLToPath(import.meta.url));
export const APP = path.resolve(DIR, '../index.html');
const ROOT = path.resolve(DIR, '../../../..');
export const NET = {block: false, hits: []};
let SRV = null;
export function server() {
  if (SRV) return SRV;
  SRV = new Promise(res => {
    const s = http.createServer((q, r) => {
      const u = decodeURIComponent(q.url.split('?')[0]); NET.hits.push({url: u, method: q.method});
      let f = null;
      if (u === '/app/' || u === '/app/index.html') f = APP;
      else if (u.startsWith('/app/vendor/')) f = path.join(ROOT, u.slice(5));
      else if (u.startsWith('/app/') && /\.(png|webmanifest|woff2|js)$/.test(u)) f = path.join(ROOT, u.slice(5));
      const blk = NET.block && u.includes('/vendor/g9/');
      if (!f || blk || !fs.existsSync(f)) { r.writeHead(blk ? 503 : 404); r.end(); return; }
      r.writeHead(200, {'Content-Type': f.endsWith('.wasm') ? 'application/wasm' : f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'});
      fs.createReadStream(f).pipe(r);
    });
    s.listen(0, '127.0.0.1', () => { s.unref(); res('http://127.0.0.1:' + s.address().port + '/app/'); });
  });
  return SRV;
}
export const SR = 48000;
export const sleep = ms => new Promise(r => setTimeout(r, ms));
const INIT = () => {
  window.__errs = [];
  const O = window.AudioContext; window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } }; window.webkitAudioContext = window.AudioContext;
};
export async function launch() { return chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']}); }
export async function open(br, o = {}) {
  const ctx = await br.newContext({viewport: o.viewport || {width: 428, height: 926}, hasTouch: o.touch !== false, isMobile: !!o.mobile, deviceScaleFactor: o.dpr || 1});
  const p = await ctx.newPage(); const errs = [], reqs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => reqs.push(r.url()));
  await p.addInitScript(INIT);
  await p.goto((o.file ? 'file://' + APP : await server() + 'index.html') + (o.q || '')); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  await sleep(400);
  return {ctx, p, errs, reqs};
}
// gesungen-ähnliche Silben: je Silbe ein Konsonant-Knack + Vokal (harmonisch), Pausen zwischen Wörtern
export function sung(times, len, o = {}) {
  const n = Math.round(len * SR), y = new Float32Array(n); let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const F = [220, 247, 262, 294, 330, 294, 262, 247];
  for (let i = 0; i < n; i++) y[i] = 0.0004 * rnd();
  times.forEach((t, k) => {
    const end = k + 1 < times.length ? Math.min(times[k + 1] - 0.03, t + (o.dur || 0.4)) : Math.min(len - 0.05, t + (o.dur || 0.4));
    const f = F[k % F.length]; let ph = 0;
    for (let i = Math.round(t * SR); i < Math.round(end * SR) && i < n; i++) {
      const u = i / SR - t; ph += 2 * Math.PI * f / SR;
      const env = Math.min(1, u / 0.01) * Math.min(1, (end - i / SR) / 0.02);
      let s = 0; for (let h = 1; h <= 6; h++) s += Math.sin(h * ph) / h;
      y[i] += 0.18 * env * s + (u < 0.025 ? 0.35 * Math.exp(-u / 0.006) * rnd() : 0);
    }
  });
  return y;
}
export const toI16 = x => Array.from(x, v => Math.max(-32767, Math.min(32767, Math.round(v * 32767))));
export const deq = (a, b) => JSON.stringify(sortK(a)) === JSON.stringify(sortK(b));
function sortK(o) { if (Array.isArray(o)) return o.map(sortK); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) r[k] = sortK(o[k]); return r; } return o; }
// Take mit Silben anlegen, Marken erkennen → {id, ref, marks}
export async function mkTake(p, times, len, scene = 0) {
  const r = await p.evaluate(([pcm, s, L]) => SYNQUENZER.tkInject({pcm, sr: 48000, scene: s, len: L}), [toI16(sung(times, len)), scene, Math.ceil(len / 2)]);
  const marks = await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
  return {id: r.id, ref: {t: r.track, s: scene}, marks};
}
export function report() { let fail = 0, n = 0; const ok = (c, m) => { n++; console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; }; ok.done = () => { console.log(`\n${n - fail}/${n} bestanden`); return fail; }; return ok; }
// Klick-Folge (wie VS5a-Tests): je Zeitpunkt genau eine Marke
export function clicks(times, len, a = 0.5) {
  const n = Math.round(len * SR), y = new Float32Array(n); let seed = 9; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (let i = 0; i < n; i++) y[i] = 0.0005 * rnd();
  for (const t of times) { const i0 = Math.round(t * SR); for (let i = 0; i < 0.12 * SR && i0 + i < n; i++) { const u = i / SR; y[i0 + i] += a * Math.exp(-u / 0.025) * (Math.sin(2 * Math.PI * 1500 * u) * 0.7 + Math.sin(2 * Math.PI * 3100 * u) * 0.3) * Math.min(1, i / 24); } }
  return y;
}
export async function clickTake(p, times, len, scene = 0) {
  const r = await p.evaluate(([pcm, s, L]) => SYNQUENZER.tkInject({pcm, sr: 48000, scene: s, len: L}), [toI16(clicks(times, len)), scene, Math.max(1, Math.ceil(len / 2))]);
  const marks = await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
  return {id: r.id, ref: {t: r.track, s: scene}, marks};
}
export const U = p => p.evaluate(() => SYNQUENZER.undoInfo());
export const V = (p, id) => p.evaluate(id => SYNQUENZER.g9View(id), id);
export const LY = (p, id) => p.evaluate(id => SYNQUENZER.g9Ly(id), id);
export const SET = (p, id, op) => p.evaluate(([id, op]) => SYNQUENZER.g9Set(id, op), [id, op]);
// Silben → Marken-Index-Liste aus der Sicht
export const ks = v => v.syl.map(s => (s.o ? 'o' : s.k));
