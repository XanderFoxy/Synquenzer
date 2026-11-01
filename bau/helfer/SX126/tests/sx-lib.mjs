// SX126 Testhilfen: App öffnen (Ton ohne Geste), Test-Song, Messungen aus dem Offline-Render
import { chromium } from 'playwright';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const APP = process.env.APP || path.resolve(HERE, '../index.html');
export const BASE = process.env.BASE || path.resolve(HERE, '../../../snapshots/R-4300.html');
export const OUT = path.resolve(HERE, 'ergebnis'); export const PICS = path.resolve(HERE, 'bilder');
export async function open(o = {}) {
  const b = o.browser || await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: o.w || 428, height: o.h || 926}, deviceScaleFactor: o.dpr || 1, hasTouch: !!o.touch, isMobile: !!o.touch});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(o.url || ('file://' + (o.app || APP) + (o.q || ''))); await p.waitForTimeout(o.wait || 1500);
  await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 10000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, p, errs};
}
// 8 Takte über die Demo-Clips, zwei Marken (Strophe, Refrain)
export const SONG8 = {bars: 8, lanes: [[{bar: 0, slot: 0}, {bar: 4, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 6, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 4, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'M1', a: 0, len: 4, name: 'Strophe'}, {id: 'M2', a: 4, len: 4, name: 'Refrain'}]};
// im Browser: PCM des letzten Renders als Float-Fenster (dBFS je Fenster)
export const PCM_FN = `window.__sxWin = (t0, t1, win) => { const r = VV.last; const sr = r.sr, L = r.ch[0], Rr = r.ch[1], a = Math.max(0, Math.round(t0 * sr)), b = Math.min(r.n, Math.round(t1 * sr)), n = Math.max(1, Math.round(win * sr)), out = [];
  for (let k = a; k < b; k += n) { let pk = 0, ss = 0, c = 0; for (let j = k; j < Math.min(b, k + n); j++) { const v = Math.max(Math.abs(L[j]), Math.abs(Rr[j])); if (v > pk) pk = v; ss += L[j] * L[j] + Rr[j] * Rr[j]; c += 2; } out.push({t: k / sr, pk, rms: Math.sqrt(ss / Math.max(1, c))}); } return out; };
  window.__sxHash = () => { const r = VV.last; let h1 = 2166136261 >>> 0; const f = new Float32Array(1), u = new Uint32Array(f.buffer); for (let c = 0; c < 2; c++) { const d = r.ch[c]; for (let k = 0; k < r.n; k++) { f[0] = d[k]; h1 = Math.imul(h1 ^ u[0], 16777619) >>> 0; } } return {n: r.n, h: h1.toString(16)}; };`;
export const db = v => 20 * Math.log10(Math.max(v, 1e-12));
