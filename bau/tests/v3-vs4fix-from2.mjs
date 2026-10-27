import fs from 'fs';
import {DIR} from './v3-qa-vs4-h.mjs';
const core = await import('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-dsp/clean.mjs');
const rd = f => { const b = fs.readFileSync(f); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const mic = rd(DIR + '/cap-sat6-0-mic.f32'), ref = rd(DIR + '/cap-sat6-0-ref.f32'), yv = rd(DIR + '/cap-voice.f32'), sr = 44100, n = mic.length, P = yv.length;
const OFF = +process.env.OFF;
let best = -1, off = 0; for (let o = 0; o < P; o += 8) { let s = 0; for (let i = OFF; i < n; i += 16) s += mic[i] * yv[((i - o) % P + P) % P]; if (s > best) { best = s; off = o; } }
for (let o = off - 8; o <= off + 8; o++) { let s = 0; for (let i = OFF; i < n; i += 2) s += mic[i] * yv[((i - o) % P + P) % P]; if (s > best) { best = s; off = o; } }
const yy = new Float32Array(n); for (let i = 0; i < n; i++) yy[i] = yv[((i - off) % P + P) % P];
for (const o of JSON.parse(process.argv[2])) {
  const t0 = Date.now(), y = core.clean(mic, ref, sr, Object.assign({way: 'notes'}, o));
  let a = 0, b = 0; for (let i = OFF; i < n; i++) { a += y[i] * yy[i]; b += yy[i] ** 2; } const g = a / b;
  const row = []; let E = 0, V = 0;
  for (let s = OFF; s + sr / 2 <= n; s += sr / 2) { let e = 0, v = 0; for (let i = s; i < s + sr / 2; i++) { e += (y[i] - g * yy[i]) ** 2; v += (g * yy[i]) ** 2; } E += e; V += v; row.push((10 * Math.log10(v / e)).toFixed(0)); }
  console.log(JSON.stringify(o).padEnd(40), 'SDR', (10 * Math.log10(V / E)).toFixed(1), 'per0.5s', row.join(' '), Date.now() - t0, 'ms');
}
