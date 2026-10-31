// K1 browser helpers: launch the branch app, unlock audio, wait for the worklet
import {chromium} from 'playwright';
export const APP = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-K/index.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test';
export async function launch(o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: o.viewport || {width: 390, height: 844}, hasTouch: !!o.touch, isMobile: !!o.mobile, deviceScaleFactor: o.dpr || 1});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000});
  if (o.init !== false) await p.evaluate(() => SYNQUENZER.newProject({init: true}));
  await p.evaluate(() => { SYNQUENZER.keyOn(60); SYNQUENZER.keyOff(60); });
  await p.waitForFunction(() => SYNQUENZER.engineInfo().synth === 'worklet', null, {timeout: 20000});
  await p.waitForTimeout(300);
  return {b, ctx, p, errs};
}
// seeded Math.random in front of the worklet text (renders comparable)
export const seedWorklet = p => p.evaluate(() => { const el = document.getElementById('sq-worklet-src'); if (!el.dataset.k1) { el.dataset.k1 = 1; el.textContent = 'Math.random = (() => { let s = 12345; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; })();\n' + el.textContent; } });
// render a sound object in the page (mkRender), back as Float32Array (left)
export async function renderIn(p, sound, ev, o) {
  const b64 = await p.evaluate(async ([s, ev, o]) => { const r = await SYNQUENZER.mkRender(s, ev, o); const u = new Uint8Array(r.l.buffer.slice(0)); let bin = ''; for (let i = 0; i < u.length; i += 8192) bin += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(bin); }, [sound, ev, o || {sec: 2, seed: 1}]);
  return new Float32Array(Buffer.from(b64, 'base64').buffer.slice(0));
}
export function dbDiff(x, y) { let s = 0, r = 0; for (let i = 0; i < x.length; i++) { const d = x[i] - y[i]; s += d * d; r += y[i] * y[i]; } return r > 0 ? 10 * Math.log10(Math.max(1e-30, s) / r) : (s > 0 ? 0 : -999); }
// equal renders: mkRender may post its events late under load (a time shift): up to 3 tries
export async function sameRender(p, a, b, ev, o) { let best = 1e9; for (let k = 0; k < 3 && best > -90; k++) best = Math.min(best, dbDiff(await renderIn(p, a, ev, o), await renderIn(p, b, ev, o))); return best; }
// frequency of a steady tone by zero crossings with linear interpolation over [i0, i1)
export function freqZC(x, sr, i0, i1) { let first = -1, last = -1, n = 0; for (let i = i0 + 1; i < i1; i++) if (x[i - 1] < 0 && x[i] >= 0) { const t = i - 1 + (-x[i - 1]) / (x[i] - x[i - 1]); if (first < 0) first = t; else n++; last = t; } return n > 0 ? n * sr / (last - first) : 0; }
