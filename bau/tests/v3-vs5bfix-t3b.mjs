// Nachbau Kern-Test 3b mit Profil: wo liegt der Einbruch?
import * as T0 from '../vs-dsp/test-util.mjs'; import * as T1 from '../vs-dsp/test-signals.mjs'; const T = {...T1, ...T0};
const mod = await import(process.env.MOD || '../vs-dsp/stretch.mjs');
const sr = 48000;
const tone = (dur, f0, o = {}) => { const n = Math.round(dur * sr), x = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const f = f0 * Math.pow(2, (o.vib || 0) * Math.sin(2 * Math.PI * 5.5 * i / sr) / 1200); ph += 2 * Math.PI * f / sr;
    let v = 0; for (let h = 1; h * f0 < 7000; h++) { const fh = h * f0; v += Math.sin(h * ph) * (1 / (1 + ((fh - 800) / 90) ** 2) + 0.6 / (1 + ((fh - 1150) / 100) ** 2) + 0.05) / Math.sqrt(h); } x[i] = 0.15 * v; } return x; };
const dur = 4.6, x = tone(dur, 196, {vib: 15}), r = T.rng(5), OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9];
for (let i = 0; i < 0.3 * sr; i++) x[i] = 0;
const ons = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000);
for (const t of ons) { const i0 = Math.round(t * sr); for (let k = 0; k < 0.03 * sr; k++) x[i0 + k] += 0.6 * Math.exp(-k / (0.004 * sr)) * T.gauss(r) * Math.min(1, k / 6); }
const L = 0.004, src = [0, ...ons.map(t => t - L), dur], dst = [0, ...ons.map(t => Math.round(t / 0.25) * 0.25 - L), dur];
const dbg = []; const y = mod.stretch(x, sr, {src, dst}, {lock: 0.02 + L, dbg}).y; if (process.env.DBGJ) console.log(dbg.filter(d => d.k === +process.env.DBGJ).map(d => 'j' + d.j + '/' + d.jf + ' ij ' + d.ij + ' rho ' + d.rho + ' e ' + d.e).join('\n'));
const P2 = Math.round(2 * sr / 196), ref = T.rms(x, Math.round(0.35 * sr), Math.round(0.45 * sr));
const dips = []; for (let s = Math.round(0.6 * sr); s + P2 < Math.round(4.3 * sr); s += Math.round(P2 / 4)) { const d = -20 * Math.log10(T.rms(y, s, s + P2) / ref); if (d > 2) { const t = (s + P2 / 2) / sr; const m = dst.reduce((a, b) => Math.abs(b - t) < Math.abs(a - t) ? b : a); dips.push(((t - m) * 1000).toFixed(1) + 'ms@' + m.toFixed(3) + ':' + d.toFixed(2)); } }
console.log(dips.join(' '));
