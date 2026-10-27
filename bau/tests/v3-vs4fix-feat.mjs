import fs from 'fs';
import {DIR} from './v3-qa-vs4-h.mjs';
const core = await import('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-dsp/clean.mjs');
const rd = f => { const b = fs.readFileSync(f); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const mic = rd(DIR + '/cap-sat6-0-mic.f32'), ref = rd(DIR + '/cap-sat6-0-ref.f32'), sr = 44100, n = mic.length;
const y = core.clean(mic, ref, sr, {way: 'notes'}), ec = Float32Array.from(mic, (v, i) => v - y[i]);
const notes = JSON.parse(process.argv[2]);
const W0 = Math.round(0.04 * sr); let OFF = 0, bo = -1;
for (let o = 0; o < 6 * sr; o += 441) { let s = 0; for (const nt of notes) { if (nt.n < 57) continue; const a = o + Math.round((nt.t0 + 0.1) * sr); if (a + W0 * 4 > n) { s = -1; break; } for (let j = 0; j < W0 * 4; j++) s += mic[a + j] ** 2; } if (s > bo) { bo = s; OFF = o; } }
if (process.env.OFF) OFF = +process.env.OFF; console.log("OFF", OFF / sr);
const W = Math.round(0.04 * sr);
const ge = (a, s, f) => { const c = 2 * Math.cos(2 * Math.PI * f / sr); let s1 = 0, s2 = 0; for (let j = 0; j < W; j++) { const v = a[s + j] * (0.5 - 0.5 * Math.cos(2 * Math.PI * j / (W - 1))) + c * s1 - s2; s2 = s1; s1 = v; } return (s1 * s1 + s2 * s2 - c * s1 * s2) / (W * W); };
const T = [];
for (const nt of notes) {
  const f0 = 440 * Math.pow(2, (nt.m - 69) / 12); let pm = 0, pe = 0, em = 0, ee = 0;
  for (let a = OFF + Math.round(nt.t0 * sr); a + W <= OFF + Math.round(nt.t1 * sr); a += W) { for (let h = 1; h <= 3; h++) { pm += ge(y, a, h * f0); pe += ge(ec, a, h * f0); } for (let j = 0; j < W; j++) { em += y[a + j] ** 2; ee += ec[a + j] ** 2; } }
  T.push(`${nt.n} ${nt.t0}-${nt.t1} pitch ${(10 * Math.log10(pm / pe)).toFixed(1)} dB  total ${(10 * Math.log10(em / ee)).toFixed(1)} dB`);
}
console.log(T.join('\n'));
// ratio percentile over 40 ms frames of the analysed region
const r = []; for (let a = OFF; a + W < n; a += W) { let e1 = 0, e2 = 0; for (let j = 0; j < W; j++) { e1 += y[a + j] ** 2; e2 += ec[a + j] ** 2; } r.push(10 * Math.log10(e1 / e2)); } r.sort((a, b) => a - b);
console.log('frame ratio pct 10/20/30/50', [0.1, 0.2, 0.3, 0.5].map(q => r[Math.floor(q * r.length)].toFixed(1)).join(' '));
