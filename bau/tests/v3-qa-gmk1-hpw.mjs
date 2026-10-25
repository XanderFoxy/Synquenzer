import fs from 'fs';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk1/';
const [pre, nm, a0, a1] = [process.argv[2], process.argv[3], +process.argv[4], +process.argv[5]];
const buf = fs.readFileSync(OUT + pre + '-audio.f32'); const x = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
const {acts, f0, sr} = JSON.parse(fs.readFileSync(OUT + pre + '-acts.json')); const t0 = f0 / sr;
const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
const h = hp(hp(x, 5000, .5412), 5000, 1.3066);
const a = acts.find(a => a.name.includes(nm)); const i0 = Math.round((a.t - t0) * sr), W = Math.round(sr * .002);
const out = []; for (let ms = a0; ms < a1; ms += 2) { const i = i0 + Math.round(ms * sr / 1000); let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; out.push(ms + ':' + (10 * Math.log10(s / W + 1e-20)).toFixed(0)); }
console.log(a.name, out.join(' '));
if (process.argv[6]) { const i = i0 + Math.round(+process.argv[6] * sr / 1000); const s = []; for (let k = i - 20; k < i + 60; k++) s.push(x[k].toFixed(3)); console.log('samples', s.join(' ')); }
