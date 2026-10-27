import fs from 'fs';
import {DIR} from './v3-qa-vs4-h.mjs';
const core = await import(process.env.CORE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-dsp/clean.mjs');
const rd = f => { const b = fs.readFileSync(f); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const M = process.argv[2] || 'sat6', mic = rd(DIR + `/cap-${M}-0-mic.f32`), ref = rd(DIR + `/cap-${M}-0-ref.f32`), yv = rd(DIR + '/cap-voice.f32'), sr = 44100, n = mic.length, P = yv.length;
let best = -1, off = 0; for (let o = 0; o < P; o += 8) { let s = 0; for (let i = 0; i < n; i += 16) s += mic[i] * yv[((i - o) % P + P) % P]; if (s > best) { best = s; off = o; } }
for (let o = off - 8; o <= off + 8; o++) { let s = 0; for (let i = 0; i < n; i += 2) s += mic[i] * yv[((i - o) % P + P) % P]; if (s > best) { best = s; off = o; } }
const yy = new Float32Array(n); for (let i = 0; i < n; i++) yy[i] = yv[((i - off) % P + P) % P];
const o = JSON.parse(process.argv[3] || '{"way":"notes"}'), y = core.clean(mic, ref, sr, o);
const pj = z => { let a = 0, b = 0; for (let i = 0; i < n; i++) { a += z[i] * yy[i]; b += yy[i] ** 2; } return a / b; };
const g1 = pj(mic), g2 = pj(y); const row = [];
for (let a = 0; a + sr <= n; a += sr) { let e = 0, r = 0, v = 0, rf = 0; for (let i = a; i < a + sr; i++) { e += (mic[i] - g1 * yy[i]) ** 2; r += (y[i] - g2 * yy[i]) ** 2; v += yy[i] ** 2; rf += ref[i] ** 2; } row.push(`${a / sr}s: echo ${(10 * Math.log10(e / sr)).toFixed(0)} resid ${(10 * Math.log10(r / sr)).toFixed(0)} voice ${(10 * Math.log10(v / sr + 1e-12)).toFixed(0)} ref ${(10 * Math.log10(rf / sr + 1e-12)).toFixed(0)}`); }
console.log(row.join('\n'));
