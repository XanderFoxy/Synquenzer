// M-KLICK max per action window from a saved recording (pre-audio.f32 + pre-acts.json)
import fs from 'fs';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk1/';
const pre = process.argv[2];
const buf = fs.readFileSync(OUT + pre + '-audio.f32'); const x = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
const {acts, f0, sr} = JSON.parse(fs.readFileSync(OUT + pre + '-acts.json')); const t0 = f0 / sr;
const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
const h = hp(hp(x, 5000, .5412), 5000, 1.3066);
const W = Math.round(sr * .002), e = []; for (let i = 0; i + W <= x.length; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(s / W + 1e-20); }
for (let a = 0; a < acts.length; a++) { const ta = acts[a].t, tb = a + 1 < acts.length ? acts[a + 1].t : ta + .7; let worst = -99, wt = 0;
  for (let j = Math.max(10, Math.floor((ta - t0) * sr / W)); j < Math.min(e.length - 10, Math.floor((tb - t0) * sr / W)); j++) { const nb = e.slice(j - 10, j + 11).filter((_, k) => k !== 10).sort((p, q) => p - q), med = nb[10]; const db = 10 * Math.log10(e[j] / med); if (db > worst && e[j] > 1e-10) { worst = db; wt = t0 + j * W / sr; } }
  console.log(acts[a].name.padEnd(42), worst.toFixed(1), '@', ((wt - ta) * 1000).toFixed(0), 'ms'); }
