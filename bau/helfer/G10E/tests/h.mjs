// G10e Test-Hilfen (Playwright + Chromium, Touch über CDP)
import {createRequire} from 'module'; const _rq = createRequire(import.meta.url); let _pw; try { _pw = _rq('playwright'); } catch (e) { _pw = _rq(process.env.PW || '/opt/node-tools/node_modules/playwright'); } const {chromium} = _pw;
import path from 'path';
import {fileURLToPath} from 'url';
export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const APP = process.env.G10E_APP || path.join(HERE, '..', 'index.html');
export const OUT = process.env.G10E_OUT || path.join(HERE, 'out');
export const SR = 48000;
export const sleep = ms => new Promise(r => setTimeout(r, ms));
let fail = 0; export const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; return c; };
export const fails = () => fail;
export const deq = (a, b) => JSON.stringify(sortK(a)) === JSON.stringify(sortK(b));
function sortK(o) { if (Array.isArray(o)) return o.map(sortK); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) r[k] = sortK(o[k]); return r; } return o; }
export const toI16 = x => Array.from(x, v => Math.max(-32767, Math.min(32767, Math.round(v * 32767))));
// gesang-ähnlich: harmonischer Ton mit Tonwechsel + kleinem Einsatz-Buckel je Marke; Pausen zwischen Wörtern
export function voice(times, len, o = {}) {
  const n = Math.round(len * SR), y = new Float32Array(n), F = [220, 247, 262, 294, 330, 294, 262, 247, 220, 196, 220, 247, 262, 294, 330, 349];
  const gaps = o.gaps || [];
  let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR; y[i] = 0.0004 * rnd();
    let k = -1; for (let j = 0; j < times.length; j++) if (t >= times[j]) k = j;
    if (k < 0 || gaps.some(g => t >= g[0] && t < g[1])) continue;
    const f = F[k % F.length], u = t - times[k]; ph += 2 * Math.PI * f / SR;
    let s = 0; for (let h = 1; h <= 8; h++) s += Math.sin(h * ph) / h;
    y[i] += 0.2 * Math.min(1, u / 0.006) * (1 + 0.8 * Math.exp(-u / 0.03)) * s / 2;
  }
  for (const t of times) { const i0 = Math.round(t * SR); for (let i = 0; i < 0.02 * SR && i0 + i < n; i++) { const u = i / SR; y[i0 + i] += 0.5 * Math.exp(-u / 0.004) * (Math.sin(2 * Math.PI * 2100 * u) * 0.6 + rnd() * 0.4) * Math.min(1, i / 6); } }
  return y;
}
const INIT = () => {
  const O = window.AudioContext;
  window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } };
  window.webkitAudioContext = window.AudioContext;
  window.__starts = [];
  const os = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (w, o, d) { try { window.__starts.push({when: w, off: o, dur: d, len: this.buffer ? this.buffer.duration : null, now: this.context.currentTime}); if (window.__starts.length > 400) window.__starts.shift(); } catch (e) {} return os.apply(this, arguments); };
};
export async function launch() {
  return chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']});
}
export async function open(br, vp = {width: 428, height: 926}) {
  const ctx = await br.newContext({viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 3});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT);
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  await sleep(400);
  const cdp = await ctx.newCDPSession(p);
  return {ctx, p, errs, cdp};
}
// Projekt + Gesangs-Take (len Takte) in Szene sc; liefert {id, ref}
export async function take(p, times, len = 4.6, bars = 3, sc = 0, o = {}) {
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
  await sleep(200);
  const x = voice(times, len, o);
  const r = await p.evaluate(a => SYNQUENZER.tkInject({pcm: a.pcm, sr: 48000, scene: a.sc, len: a.bars}), {pcm: toI16(x), sc, bars});
  return {id: r.id, ref: {t: r.track, s: sc}, x};
}
// Touch-Gesten (CDP)
export async function touch(cdp, type, pts) { await cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: q[2] == null ? i : q[2], radiusX: 1, radiusY: 1}))}); }
export async function drag(cdp, x0, y0, x1, y1, steps = 8, dt = 0) {
  await touch(cdp, 'touchStart', [[x0, y0]]);
  for (let k = 1; k <= steps; k++) { await touch(cdp, 'touchMove', [[x0 + (x1 - x0) * k / steps, y0 + (y1 - y0) * k / steps]]); if (dt) await sleep(dt); }
  await touch(cdp, 'touchEnd', []);
}
export async function tap(cdp, x, y, hold = 0) { await touch(cdp, 'touchStart', [[x, y]]); if (hold) await sleep(hold); await touch(cdp, 'touchEnd', []); }
export async function pinch(cdp, cx, cy, d0, d1, steps = 10, dt = 0, dy = 0) {
  const P = d => [[cx - d / 2, cy + dy], [cx + d / 2, cy - dy]];
  await touch(cdp, 'touchStart', P(d0));
  for (let k = 1; k <= steps; k++) { await touch(cdp, 'touchMove', P(d0 + (d1 - d0) * k / steps)); if (dt) await sleep(dt); }
  await touch(cdp, 'touchEnd', []);
}

export const geom = p => p.evaluate(() => SYNQUENZER.wpGeom());
export const info = p => p.evaluate(() => SYNQUENZER.g10Info());
export const marksOf = (p, id) => p.evaluate(id => SYNQUENZER.wpInfo(id).marks || SYNQUENZER.wpInfo(id).det, id);
export const undoN = p => p.evaluate(() => SYNQUENZER.undoInfo().n);
export async function openEd(p, ref, id) { await p.evaluate(r => SYNQUENZER.wpOpen(r), ref); await p.evaluate(id => SYNQUENZER.wpDetect(id), id); await sleep(250); await p.evaluate(() => SYNQUENZER.g10View(null, null)); }
export const popClose = p => p.evaluate(() => SYNQUENZER.g10Pop());
