// Gesungene Tonleiter A2–A3 und zurück (Formant-artig: Obertöne mit a-Formanten, leichtes Vibrato), 48 kHz mono.
const fs = require('fs');
const sr = 48000, noten = [];
const leiter = [45, 47, 49, 50, 52, 54, 56, 57, 56, 54, 52, 50, 49, 47, 45];
let t = 0.2; for (const m of leiter) { noten.push({ t, d: 0.75, m }); t += 0.85; }
const N = Math.ceil((t + 0.3) * sr), x = new Float32Array(N);
const F = [730, 1250, 2500], B = [90, 110, 160];
for (const n of noten) {
  const f0 = 440 * Math.pow(2, (n.m - 69) / 12), a = Math.floor(n.t * sr), L = Math.floor(n.d * sr);
  const amps = []; for (let k = 1; k * f0 < 5000; k++) { const f = k * f0; let g = 0; F.forEach((fc, j) => { g += 1 / (1 + ((f - fc) / B[j]) ** 2) * [1, .7, .3][j]; }); amps.push(0.15 / k + g); }
  let ph = 0;
  for (let i = 0; i < L; i++) {
    const env = Math.min(1, i / 1200, (L - i) / 1200), f = f0 * (1 + 0.004 * Math.sin(2 * Math.PI * 5.5 * i / sr));
    ph += 2 * Math.PI * f / sr; let v = 0; for (let k = 0; k < amps.length; k++) v += amps[k] * Math.sin((k + 1) * ph);
    x[a + i] += v * env;
  }
}
let mx = 0; for (const v of x) mx = Math.max(mx, Math.abs(v));
const b = Buffer.alloc(44 + N * 2);
b.write('RIFF', 0); b.writeUInt32LE(36 + N * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) b.writeInt16LE(Math.round(x[i] / mx * 20000), 44 + i * 2);
fs.writeFileSync(process.argv[2], b); console.log('wav', (N / sr).toFixed(1), 's');
