// offline: legato phrase / steady sines / phrase with rests (SNR 40) through the core hear path: SDR + voice gain
import {renderVoice} from './v3-vs2-corpus.mjs';
import {resample} from './v3-qa-vs4-h.mjs';
const core = await import(process.env.CORE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-dsp/clean.mjs');
const SR = 44100, MEL = [[0, 57], [2, 60], [4, 64], [6, 62], [8, 60], [10, 64], [12, 59], [14, 57]];
const mk = leg => { const v16 = renderVoice(leg ? MEL.map(([b, m], k) => ({on: 0.05 + b * 0.5, dur: 1, midi: m, legato: k > 0, rest: 0})) : MEL.map(([b, m], k) => ({on: 0.05 + b * 0.5, dur: 0.5, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'male', seed: 11, sigma: 10, vib: [20, 40], bpm: 120}).x;
  const v = resample(v16, 16000, SR), n = SR * 8, y = new Float32Array(n); let pk = 0; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(v[i] || 0)); for (let i = 0; i < n; i++) y[i] = (v[i] || 0) * 0.3 / pk; return y; };
const sine = (f, sec) => Float32Array.from({length: Math.round(SR * sec)}, (_, i) => 0.3 * Math.sin(2 * Math.PI * f * i / SR));
let seed = 9; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; };
const addN = (y, snr) => { let vs = 0, vc = 0; for (const s of y) if (Math.abs(s) > 0.015) { vs += s * s; vc++; } const a = Math.sqrt(vs / vc) * Math.pow(10, -snr / 20) * 3.46; return Float32Array.from(y, v => v + a * rnd()); };
const hp = (a, fc) => { const RC = 1 / (2 * Math.PI * fc), al = RC / (RC + 1 / SR); let o = Float64Array.from(a); for (let p = 0; p < 2; p++) { const src = Float64Array.from(o); let yp = 0, xp = src[p ? src.length - 1 : 0]; for (let i = 0; i < src.length; i++) { const j = p ? src.length - 1 - i : i; yp = al * (yp + src[j] - xp); xp = src[j]; o[j] = yp; } } return o; };
const m = (y, z) => { const a = hp(y, 150), b = hp(z, 150); let p = 0, q = 0; for (let i = 4410; i < a.length - 4410; i++) { p += a[i] * b[i]; q += a[i] * a[i]; } const g = p / q; let s = 0, e = 0; for (let i = 4410; i < a.length - 4410; i++) { s += (g * a[i]) ** 2; e += (b[i] - g * a[i]) ** 2; } let lv = 0, lr = 0; for (let i = 4410; i < a.length - 4410; i++) { lv += z[i] ** 2; lr += y[i] ** 2; } return `SDR ${(10 * Math.log10(s / e)).toFixed(1)} dB, gain ${(20 * Math.log10(g)).toFixed(2)} dB, level ${(10 * Math.log10(lv / lr)).toFixed(2)} dB`; };
for (const [lab, y, snr] of [['legato SNR40', mk(true), 40], ['rests SNR40', mk(false), 40], ['sine440 clean', sine(440, 4.2), null], ['sine220 SNR40', sine(220, 8), 40], ['legato SNR20', mk(true), 20]]) {
  const x = snr ? addN(y, snr) : y; const r = [];
  for (const a of [0.6, 1]) r.push(`${a * 100}%: ` + m(y, core.clean(x, null, SR, {amount: a})));
  console.log(lab.padEnd(14), r.join(' | '));
}
