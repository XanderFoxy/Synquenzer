// VS5b-fix: Node-Schnelltest des Kerns gegen M-EINBRUCH (5-ms-Fenster, 1-ms-Schritte) an den Dehnen-Nähten, Warp wie wpRender (WP_LEAD 4 ms)
import {clickTone} from './v3-vs5b-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
const mod = await import(process.argv[2] || '../vs-dsp/stretch.mjs');
const sr = +(process.argv[3] || 44100);
function mE(y, p) { const W = Math.round(0.005 * sr), lv = c => { c = Math.round(c); let s = 0; for (let i = c; i < c + W; i++) s += y[i] * y[i]; return 10 * Math.log10(s / W + 1e-14); };
  const P = Math.round(p * sr), ref = []; for (let d = -50; d <= -10; d++) ref.push(lv(P + d * sr / 1000)); const rr = ref.reduce((a, b) => a + b) / ref.length; let w = 0; for (let d = -50; d <= 45; d++) { const v = lv(P + d * sr / 1000) - rr; if (v < w) w = v; } return +w.toFixed(2); }
function quant(t, g, st) { const G = g === '1/8' ? 0.25 : 0.125, tg = Math.round(t / G) * G; return Math.abs(tg - t) <= 0.4 * G ? t + (tg - t) * st : t; }
const OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9, 15, -12, 28, -20, 7, -33, 24, -4, 19, -25, 11, -14, 30];
function run(name, x, marks) {
  for (const [g, st] of [['1/8', 0.7], ['1/8', 1], ['1/16', 0.7], ['1/16', 1]]) {
    const L = Math.round(0.004 * sr) / sr, end = x.length / sr;
    const dst = marks.map(t => quant(t, g, st));
    const S2 = [0], D2 = [dst[0] - marks[0] >= 0 ? dst[0] - marks[0] : 0];
    if (dst[0] - marks[0] < 0) { S2[0] = marks[0] - dst[0]; }
    S2.length = 0; D2.length = 0;
    marks.forEach((s, k) => { S2.push(s - L); D2.push(dst[k] - L); });
    const h = D2[0] - S2[0], e = D2[D2.length - 1] - S2[S2.length - 1];
    if (h >= 0) { S2.unshift(0); D2.unshift(h); } else { S2.unshift(-h); D2.unshift(0); }
    S2.push(end); D2.push(end + e);
    const t0 = Date.now(); const r = mod.stretch(x, sr, {src: S2, dst: D2}, {lock: .02 + L}); const ms = Date.now() - t0;
    const y = r.y, rows = [];
    marks.forEach((s, k) => { if (dst[k] < 0.7 || Math.abs(dst[k] - s) < 1e-4) return; rows.push([mE(y, dst[k] - 0.0065), mE(x, s - 0.0065)]); });
    // bitgleich 20 ms ab Marke
    let bit = 0; marks.forEach((s, k) => { const a = Math.round((s - L) * sr), b = Math.round((dst[k] - L) * sr); let ok = true; for (let i = 0; i < Math.round(0.024 * sr); i++) if (y[b + i] !== x[a + i]) { ok = false; break; } if (ok) bit++; });
    const bad = rows.filter(v => v[0] < -3).length, worse = rows.filter(v => v[0] < -3 && v[0] < v[1] - 3).length;
    console.log(`${name} ${g} ${st * 100}%: seams ${rows.length}, worst ${Math.min(...rows.map(v => v[0]))} dB (orig ${Math.min(...rows.map(v => v[1]))}), >3 dB: ${bad} (3 dB worse than orig: ${worse}), bitgleich ${bit}/${marks.length}, warn ${r.warnings.length}, ${ms} ms`);
  }
}
for (const f0 of [220, 196, 110, 330]) {
  const T0 = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), T = T0.map(t => t * 48000 / sr);
  run('click' + f0, clickTone(T0, 8.2 * sr / 48000, {f0}), T);
}
const OFF2 = [22, -31, 14, 40, -18, 27, -42, 11, 35, -25, 19, -12, 44, -36, 9, 30];
const F = [196, 220, 247, 262, 294, 262, 247, 220], notes = [];
for (let k = 0; k < 28; k++) notes.push({t: 0.5 + k * 0.25 + OFF2[k % 16] / 1000, d: 0.3, f0: F[k % 8], vowel: 'aeiou'[k % 5], cons: false});
run('legato', voice(sr, 8.2, notes, {seed: 3}).x, notes.map(n => n.t));
