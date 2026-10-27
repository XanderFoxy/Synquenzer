import fs from 'fs';
import {DIR} from './v3-qa-vs4-h.mjs';
const core = await import(process.env.CORE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-dsp/clean.mjs');
const rd = f => { const b = fs.readFileSync(f); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const M = process.argv[2] || 'sat6', mic = rd(DIR + `/cap-${M}-0-mic.f32`), ref = rd(DIR + `/cap-${M}-0-ref.f32`), y = rd(DIR + '/cap-voice.f32'), sr = 44100, n = mic.length, P = y.length;
let best = -1, off = 0; for (let o = 0; o < P; o += 8) { let s = 0; for (let i = 0; i < n; i += 16) s += mic[i] * y[((i - o) % P + P) % P]; if (s > best) { best = s; off = o; } }
for (let o = off - 8; o <= off + 8; o++) { let s = 0; for (let i = 0; i < n; i += 2) s += mic[i] * y[((i - o) % P + P) % P]; if (s > best) { best = s; off = o; } }
const yy = new Float32Array(n); for (let i = 0; i < n; i++) yy[i] = y[((i - off) % P + P) % P];
const proj = z => { let a = 0, b = 0; for (let i = 0; i < n; i++) { a += z[i] * yy[i]; b += yy[i] * yy[i]; } const g = a / b; return Float64Array.from(z, (v, i) => v - g * yy[i]); };
const o = JSON.parse(process.argv[3] || '{"way":"notes"}'), info = {};
const out = core.clean(mic, ref, sr, Object.assign({info}, o));
const E = proj(mic), R = proj(out);
// band powers via STFT 2048
const N = 2048, bands = [[0, 125], [125, 250], [250, 500], [500, 1000], [1000, 2000], [2000, 4000], [4000, 8000], [8000, 22050]];
const spec = (x, from) => { const pw = new Float64Array(bands.length), V = new Float64Array(bands.length); for (let a = from; a + N < n; a += N) { const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = x[a + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); // naive DFT per band is slow: use FFT
 fft(re, im); for (let k = 1; k < N / 2; k++) { const f = k * sr / N, p = re[k] ** 2 + im[k] ** 2; for (let b = 0; b < bands.length; b++) if (f >= bands[b][0] && f < bands[b][1]) pw[b] += p; } } return pw; };
function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } } for (let len = 2; len <= n; len <<= 1) { const ang = -2 * Math.PI / len; for (let i = 0; i < n; i += len) for (let j = 0; j < len / 2; j++) { const c = Math.cos(ang * j), s = Math.sin(ang * j), ur = re[i + j], ui = im[i + j], vr = re[i + j + len / 2] * c - im[i + j + len / 2] * s, vi = re[i + j + len / 2] * s + im[i + j + len / 2] * c; re[i + j] = ur + vr; im[i + j] = ui + vi; re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi; } } }
const from = Math.round(+(process.env.FROM || 0) * sr);
const se = spec(E, from), sR = spec(R, from), sv = spec(yy, from), sref = spec(ref, from);
const d = v => (10 * Math.log10(v + 1e-20)).toFixed(1);
console.log('band       voice   echo   resid  ERLE   ref');
bands.forEach((b, i) => console.log(String(b).padEnd(10), d(sv[i]).padStart(6), d(se[i]).padStart(6), d(sR[i]).padStart(6), (10 * Math.log10(se[i] / sR[i])).toFixed(1).padStart(6), d(sref[i]).padStart(6)));
console.log(JSON.stringify(info));
