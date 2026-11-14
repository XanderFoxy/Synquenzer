import fs from 'node:fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const grab = name => { const a = html.indexOf('function ' + name + '('); const b = html.indexOf('\n}\n', a); return html.slice(a, b + 3); };
const K = new Function(['spk7CoreMake', 'spk7Fft', 'spk7Frz', 'spk7F0'].map(grab).join('\n') + ';return {spk7CoreMake, spk7Fft, spk7Frz, spk7F0};')();
const SR = 48000;
const sine = (f, sec) => { const x = new Float32Array(Math.round(sec * SR)); for (let i = 0; i < x.length; i++) x[i] = 0.9 * Math.sin(2 * Math.PI * f * i / SR); return x; };
const F = K.spk7Frz(sine(220, 2)); const S = {t: 'src', x: sine(220, 2), sr: SR, f0: 220, frz: F.frz, FL: F.FL};
const P = {art: process.env.ART || 'frz', form: +(process.env.FORM || 0.3), poly: 4, a: 0.003, r: 0.05, spo: 0.2, bew: 0.5, gs: 0.08, dc: 4, spt: 0, s: 0.8, d: 0.3, fc: 1, q: 0.1, br: 0.5, vol: 0.7, pos: 0.3};
const C = K.spk7CoreMake(SR); C.msg(S); C.msg({t: 'p', p: P});
[57, 60, 64, 67, 72, 76].forEach((m, k) => C.msg({t: 'on', id: k + 1, m, v: 0.9, at: 0.05 + k * 0.15}));
C.msg({t: 'off', id: 5, at: 1.2}); C.msg({t: 'fast', id: 6, at: 1.3, tau: 0.004}); C.msg({t: 'kill', id: 4});
const n = Math.round(2.4 * SR), L = new Float32Array(n), R = new Float32Array(n);
for (let o = 0; o < n; o += 128) { if (o === Math.round(0.9 * SR / 128) * 128) C.msg({t: 'p', p: {gs: 0.03, dc: 6, pos: 0.7}}); C.render(L.subarray(o, o + 128), R.subarray(o, o + 128), 128, o); }
const w = 2 * Math.PI * 659.26 / SR, H = Math.round(0.003 * SR);
for (const [nm, y] of [['L', L], ['R', R]]) for (let i = 1; i < n; i++) { const j = Math.abs(y[i] - y[i - 1]); if (j < 1e-4) continue; let loc = 0; for (let q = Math.max(0, i - H); q < Math.min(n, i + H); q++) loc = Math.max(loc, Math.abs(y[q])); const qq = j / (w * Math.max(loc, 1e-3)); if (qq > 1.5) console.log(nm, i, (i / SR).toFixed(4), j, loc, qq); }
