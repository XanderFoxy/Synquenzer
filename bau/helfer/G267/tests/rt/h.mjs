// Retest-Helfer (unabhängig): App-Kopie, Tonhöhen-Messung (eigene YIN-Variante), Klick-Maß, Tonart setzen
process.env.G_APP = process.env.G_APP || '/home/user/Synquenzer/bau/helfer/G267/tests/rt/index.html';
export {launch, sleep, toI16, deq} from '../g1/n5-g-h.mjs';
import {openG as _openG} from '../g1/n5-g-h.mjs';
export const openG = (br, o) => _openG(br, o);
export const hz = m => 440 * Math.pow(2, (m - 69) / 12), ct = (a, b) => 1200 * Math.log2(a / b);
export const median = a => { const b = a.filter(v => v === v).sort((p, q) => p - q); return b.length ? (b.length % 2 ? b[b.length >> 1] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2) : NaN; };
// YIN (CMND, Schwelle 0.12, parabolisch), 40-ms-Fenster, Hop 5 ms – andere Methode als NSDF des Bauenden
export function yinTrack(x, sr, a, b, fmin = 70, fmax = 1100) {
  const W = Math.round(0.04 * sr), hop = Math.round(0.005 * sr), tmax = Math.ceil(sr / fmin), tmin = Math.floor(sr / fmax), out = [];
  const d = new Float64Array(tmax + 2);
  for (let s = Math.max(0, Math.round(a * sr)); s + W + tmax + 1 < Math.min(x.length, b * sr); s += hop) {
    let e0 = 0; for (let j = 0; j < W; j++) e0 += x[s + j] * x[s + j]; if (e0 / W < 1e-7) { out.push(NaN); continue; }
    let run = 0; d[0] = 1;
    for (let t = 1; t <= tmax + 1; t++) { let q = 0; for (let j = 0; j < W; j++) { const v = x[s + j] - x[s + j + t]; q += v * v; } run += q; d[t] = run > 0 ? q * t / run : 1; }
    let t = tmin; for (; t <= tmax; t++) if (d[t] < 0.12) { while (t + 1 <= tmax && d[t + 1] < d[t]) t++; break; }
    if (t > tmax) { out.push(NaN); continue; }
    const y0 = d[t - 1], y1 = d[t], y2 = d[t + 1], den = y0 - 2 * y1 + y2; out.push(sr / (t + (den > 0 ? 0.5 * (y0 - y2) / den : 0)));
  }
  return out;
}
export const notePitch = (y, sr, a, b) => median(yinTrack(y, sr, a, b));
// Biquad-HP + Klick-Maß (eigene Variante: 1-ms-Fenster, Spitze über Median ±15 ms)
export function hp2(x, fc, sr) { const y = new Float32Array(x.length), w = Math.tan(Math.PI * fc / sr), k1 = Math.SQRT2 * w, k2 = w * w, a0 = 1 + k1 + k2, b0 = 1 / a0, a1 = 2 * (k2 - 1) / a0, a2 = (1 - k1 + k2) / a0; let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = x[i], o = b0 * (v - 2 * x1 + x2) - a1 * y1 - a2 * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; } return y; }
export function clickAt(x, sr, times, fc = 4000) {   // je Zeitpunkt: max. HP-Energie (1 ms) im Bereich ±8 ms über dem Median der Umgebung ±30 ms (dB)
  const h = hp2(x, fc, sr), W = Math.round(0.001 * sr), n = Math.floor(h.length / W), e = new Float64Array(n);
  for (let k = 0; k < n; k++) { let s = 0; for (let i = k * W; i < (k + 1) * W; i++) s += h[i] * h[i]; e[k] = 10 * Math.log10(s / W + 1e-14); }
  return times.map(t => { const c = Math.round(t * sr / W); let pk = -200; for (let k = c - 8; k <= c + 8; k++) if (k >= 0 && k < n) pk = Math.max(pk, e[k]); const nb = []; for (let k = c - 30; k <= c + 30; k++) if (k >= 0 && k < n && Math.abs(k - c) > 8) nb.push(e[k]); return pk - median(nb); });
}
export async function setKey(p, root, scale) {
  return p.evaluate(([root, scale]) => { const o = JSON.parse(SYNQUENZER.serialize()); const pr = o.project || o; pr.key = {root, scale}; delete o.sum; const ok = SYNQUENZER.importJSON(JSON.stringify(o)); return {ok, key: SYNQUENZER.project().key}; }, [root, scale]);
}
export function errsOf(p) { const e = []; p.on('pageerror', x => e.push(String(x))); p.on('console', m => { if (m.type() === 'error') e.push('console: ' + m.text()); }); return e; }
export async function longTasks(p) { await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {} }); }
export const ltGet = p => p.evaluate(() => { const a = window.__lt || []; window.__lt = []; return a; });
