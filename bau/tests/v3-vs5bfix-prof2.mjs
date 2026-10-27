import fs from 'fs';
const mod = await import(process.env.MOD || '../vs-dsp/stretch.mjs');
const D = JSON.parse(fs.readFileSync(process.argv[2])), sr = D.sr, x = Float32Array.from(D.raw);
const {map} = D.maps[process.argv[3]];
const s = map.src, d = map.dst, L = Math.round(0.004 * sr) / sr, S2 = [0], D2 = [0];
for (let k = 1; k < s.length - 1; k++) { S2.push(s[k] - L); D2.push(d[k] - L); }
S2.push(s[s.length - 1]); D2.push(d[d.length - 1]);
const y = mod.stretch(x, sr, {src: S2, dst: D2}, {lock: .02 + L}).y;
const W = Math.round(0.005 * sr), lv = (v, c) => { c = Math.round(c); let q = 0; for (let i = c; i < c + W; i++) q += v[i] * v[i]; return 10 * Math.log10(q / W + 1e-14); };
for (const k of process.argv[4].split(',').map(Number)) {
  const P = (d[k + 1] - 0.0065) * sr, Q = (s[k + 1] - 0.0065) * sr; const ref = []; for (let m = -50; m <= -10; m++) ref.push(lv(y, P + m * sr / 1000)); const r = ref.reduce((a, b) => a + b) / ref.length;
  const row = []; for (let m = -50; m <= 10; m++) { const v = lv(y, P + m * sr / 1000) - r; if (v < -1.5 || m % 10 === 0) row.push(m + ':' + v.toFixed(1)); }
  console.log(k, 'mark', d[k + 1].toFixed(4), 'prev', d[k].toFixed(4), row.join(' '));
}
