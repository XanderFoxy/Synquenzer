// write a vowel-like test voice (saw 110 Hz + vibrato through formant resonators a e i o u, 0.5 s each), -20 dBFS RMS, 48 kHz mono 16-bit
import fs from 'fs';
const sr = 48000, sec = 10, n = sr * sec, x = new Float64Array(n);
const F = {a: [800, 1150, 2900], e: [400, 1600, 2700], i: [300, 2300, 3000], o: [450, 800, 2830], u: [325, 700, 2530]}, V = 'aeiou';
let ph = 0; const st = [[0, 0], [0, 0], [0, 0]];
for (let i = 0; i < n; i++) {
  const t = i / sr, f0 = 110 * (1 + .01 * Math.sin(2 * Math.PI * 5 * t)); ph += f0 / sr; if (ph >= 1) ph -= 1;
  const src = 2 * ph - 1 + (Math.random() - .5) * .05, v = F[V[Math.floor(t / .5) % 5]];
  let y = 0;
  for (let k = 0; k < 3; k++) { const fc = v[k], bw = 80 + 40 * k, r = Math.exp(-Math.PI * bw / sr), c = 2 * r * Math.cos(2 * Math.PI * fc / sr); const o = (1 - r) * src + c * st[k][0] - r * r * st[k][1]; st[k][1] = st[k][0]; st[k][0] = o; y += o / (k + 1); }
  x[i] = y;
}
let e = 0; for (const v of x) e += v * v; const g = Math.pow(10, -20 / 20) / Math.sqrt(e / n);
const b = Buffer.alloc(44 + n * 2);
b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
let pk = 0; for (let i = 0; i < n; i++) { const v = Math.max(-1, Math.min(1, x[i] * g)); pk = Math.max(pk, Math.abs(v)); b.writeInt16LE(Math.round(v * 32767), 44 + i * 2); }
fs.writeFileSync(process.argv[2], b); console.log('written', process.argv[2], 'peak', (20 * Math.log10(pk)).toFixed(1));
