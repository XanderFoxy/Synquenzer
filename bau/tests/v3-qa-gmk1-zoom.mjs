import fs from 'fs';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk1/';
const pre = process.argv[2] || 'clk', names = process.argv.slice(3);
const buf = fs.readFileSync(OUT + pre + '-audio.f32'); const x = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
const {acts, f0, sr} = JSON.parse(fs.readFileSync(OUT + pre + '-acts.json')); const t0 = f0 / sr;
const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
const h = hp(hp(x, 5000, .5412), 5000, 1.3066);
const W = Math.round(sr * .002), e = []; for (let i = 0; i + W <= x.length; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(s / W + 1e-20); }
for (const nm of names) {
  const a = acts.find(a => a.name.includes(nm)); if (!a) { console.log('no', nm); continue; }
  const j0 = Math.floor((a.t - t0) / .002);
  const rows = [];
  for (let j = j0 - 5; j < j0 + 200; j++) { const nb = e.slice(j - 10, j + 11).filter((_, k) => k !== 10).sort((p, q) => p - q), med = nb[10]; const db = 10 * Math.log10(e[j] / med); if (db > 5) { const i = j * W; let pk = 0; for (let k = i; k < i + W; k++) pk = Math.max(pk, Math.abs(x[k])); let d2 = 0; for (let k = i + 1; k < i + W; k++) d2 = Math.max(d2, Math.abs(x[k] - x[k - 1])); rows.push({ms: (j - j0) * 2, db: +db.toFixed(1), lvHP: +(10 * Math.log10(e[j])).toFixed(1), pk: +pk.toFixed(3), dmax: +d2.toFixed(3)}); } }
  // typical sample step in the 50 ms before
  let d2b = 0; for (let k = j0 * W - 2400; k < j0 * W; k++) d2b = Math.max(d2b, Math.abs(x[k] - x[k - 1]));
  console.log(a.name, 'ta', a.t.toFixed(3), 'max |Δx| before', d2b.toFixed(3), JSON.stringify(rows));
}
