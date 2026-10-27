import fs from 'fs';
globalThis.SDBG = [];
const mod = await import('./st-dbg2.mjs');
const D = JSON.parse(fs.readFileSync(process.argv[2])), sr = D.sr, x = Float32Array.from(D.raw);
const {map} = D.maps[process.argv[3] || '1/8 0.7'];
const s = map.src, d = map.dst, L = Math.round(0.004 * sr) / sr, S2 = [0], D2 = [0];
for (let k = 1; k < s.length - 1; k++) { S2.push(s[k] - L); D2.push(d[k] - L); }
S2.push(s[s.length - 1]); D2.push(d[d.length - 1]);
mod.stretch(x, sr, {src: S2, dst: D2}, {lock: .02 + L});
const want = (process.argv[4] || '').split(',').map(Number);
for (const k of want) { const t = d[k + 1] - L; const r = SDBG.find(v => Math.abs(v.t - t) < 0.002); console.log(k, t.toFixed(4), JSON.stringify(r)); }
const y = mod.stretch(x, sr, {src: S2, dst: D2}, {lock: .02 + L}).y;
for (const k of want) { const t = d[k + 1] - L, P = Math.round(t * sr); const row = []; for (let ms = -20; ms <= 6; ms += 1) { const a = P + Math.round(ms * sr / 1000), W = Math.round(0.001 * sr); let q = 0; for (let i = a; i < a + W; i++) q += y[i] * y[i]; row.push(ms + ':' + (10 * Math.log10(q / W)).toFixed(1)); } console.log(k, row.join(' ')); }
