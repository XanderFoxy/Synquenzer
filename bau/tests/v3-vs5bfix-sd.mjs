import fs from 'fs';
globalThis.SD = [];
const mod = await import('./st-dbg3.mjs');
const D = JSON.parse(fs.readFileSync(process.argv[2])), sr = D.sr, x = Float32Array.from(D.raw);
const {map} = D.maps[process.argv[3]];
const s = map.src, d = map.dst, L = Math.round(0.004 * sr) / sr, S2 = [0], D2 = [0];
for (let k = 1; k < s.length - 1; k++) { S2.push(s[k] - L); D2.push(d[k] - L); }
S2.push(s[s.length - 1]); D2.push(d[d.length - 1]);
const r = mod.stretch(x, sr, {src: S2, dst: D2}, {lock: .02 + L}), y = r.y;
for (const k of process.argv[4].split(',').map(Number)) {
  const t = d[k + 1] - L; console.log(k, JSON.stringify(SD.find(v => Math.abs(v.t - t) < 0.001)), JSON.stringify(r.segs.find(g => Math.abs(g.d0 / sr - t) < 0.001)));
  const P = Math.round(d[k + 1] * sr), row = []; for (let ms = -35; ms <= 2; ms++) { const a = P + Math.round(ms * sr / 1000), W = Math.round(0.005 * sr); let q = 0; for (let i = a; i < a + W; i++) q += y[i] * y[i]; row.push(ms + ':' + (10 * Math.log10(q / W)).toFixed(1)); } console.log(row.join(' '));
}
if (process.argv[5]) console.log(SD.filter(v => v.J && Math.abs(v.oj - process.argv[5]) < 3000).map(v => JSON.stringify(v)).join('\n'));
