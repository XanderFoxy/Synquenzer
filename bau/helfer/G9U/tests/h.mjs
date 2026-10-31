// G9U Test-Helfer: Chromium (Touch-Emulation), App = bau/helfer/G9U/index.html
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import path from 'path'; import {fileURLToPath} from 'url';
export const DIR = path.dirname(fileURLToPath(import.meta.url));
export const APP = path.resolve(DIR, '../index.html');
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
  await p.goto('file://' + APP + (o.q || '')); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
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
