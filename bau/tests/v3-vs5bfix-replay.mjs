// replays the app's stretch call (wpRender S2/D2 rule) in node on a dumped take; M-EINBRUCH exact (5-ms, 1-ms steps)
import fs from 'fs';
const mod = await import(process.env.MOD || '../vs-dsp/stretch.mjs');
const D = JSON.parse(fs.readFileSync(process.argv[2])), sr = D.sr, x = Float32Array.from(D.raw);
function mE(y, p) { const W = Math.round(0.005 * sr), lv = c => { c = Math.round(c); let s = 0; for (let i = c; i < c + W; i++) s += y[i] * y[i]; return 10 * Math.log10(s / W + 1e-14); };
  const P = Math.round(p * sr), ref = []; for (let d = -50; d <= -10; d++) ref.push(lv(P + d * sr / 1000)); const rr = ref.reduce((a, b) => a + b) / ref.length; let w = 0; for (let d = -50; d <= 45; d++) { const v = lv(P + d * sr / 1000) - rr; if (v < w) w = v; } return +w.toFixed(2); }
for (const [name, {map, played}] of Object.entries(D.maps)) {
  const s = map.src, d = map.dst, L = Math.round(0.004 * sr) / sr, S2 = [], D2 = [];
  for (let k = 1; k < s.length - 1; k++) { const l = Math.min(L, Math.max(0, Math.floor(Math.min(s[k], d[k]) * sr) - 1) / sr), a = s[k] - l, c = d[k] - l; if (!S2.length || (a > S2[S2.length - 1] + 1e-6 && c > D2[D2.length - 1] + 1e-6)) { S2.push(a); D2.push(c); } }
  const h = D2[0] - S2[0], e = D2[D2.length - 1] - S2[S2.length - 1], end = s[s.length - 1];
  if (S2[0] > 1e-6 && D2[0] > 1e-6) { if (h >= 0) { S2.unshift(0); D2.unshift(h); } else { S2.unshift(-h); D2.unshift(0); } }
  if (end > S2[S2.length - 1] + 1e-6 && end + e > D2[D2.length - 1] + 1e-6) { S2.push(end); D2.push(end + e); }
  const r = mod.stretch(x, sr, {src: S2, dst: D2}, {lock: .02 + L}), y = r.y;
  let same = y.length === played.length, diff = 0; for (let i = 0; i < Math.min(y.length, played.length); i++) diff = Math.max(diff, Math.abs(y[i] - played[i]));
  const dst = d.slice(1, -1), src = s.slice(1, -1), rows = [];
  dst.forEach((t, k) => { if (k === 0 || t < 0.7) return; rows.push([mE(y, t - 0.0065), mE(x, src[k] - 0.0065), k]); });
  const bad = rows.filter(v => v[0] < -3);
  console.log(`${name}: len ${same} maxdiff vs app ${diff.toExponential(2)}; seams ${rows.length}, worst ${Math.min(...rows.map(v => v[0]))} (orig ${Math.min(...rows.map(v => v[1]))}), >3 dB ${bad.length} ${JSON.stringify(bad.slice(0, 6))}`);
}
