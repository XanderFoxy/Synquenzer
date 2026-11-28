// Gesungener Ton (a-Formanten, leichtes Vibrato) auf MIDI 54 (Ges3, Startton der Vokal-Leiter bei Kern Des3–B3), 48 kHz mono.
const fs = require('fs');
const sr = 48000, dauer = 40, m = Number(process.argv[3] || 54);
const N = sr * dauer, x = new Float32Array(N);
const F = [730, 1250, 2500], B = [90, 110, 160];
const f0 = 440 * Math.pow(2, (m - 69) / 12);
const amps = []; for (let k = 1; k * f0 < 5000; k++) { const f = k * f0; let g = 0; F.forEach((fc, j) => { g += 1 / (1 + ((f - fc) / B[j]) ** 2) * [1, .7, .3][j]; }); amps.push(0.15 / k + g); }
let ph = 0;
for (let i = 0; i < N; i++) {
  const t = i / sr, f = f0 * (1 + 0.003 * Math.sin(2 * Math.PI * 5.3 * t));
  ph += 2 * Math.PI * f / sr; let v = 0; for (let k = 0; k < amps.length; k++) v += amps[k] * Math.sin((k + 1) * ph);
  x[i] = v * Math.min(1, t / 0.05, (dauer - t) / 0.05);
}
let mx = 0; for (const v of x) mx = Math.max(mx, Math.abs(v));
const b = Buffer.alloc(44 + N * 2);
b.write('RIFF', 0); b.writeUInt32LE(36 + N * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) b.writeInt16LE(Math.round(x[i] / mx * 18000), 44 + i * 2);
fs.writeFileSync(process.argv[2], b); console.log('wav', dauer, 's, MIDI', m, f0.toFixed(1), 'Hz');
