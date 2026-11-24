// Erzeugt eine Test-Gesangs-WAV: Tonleiter G2…D4, unten "Brust" (viele Obertöne), oben "Kopf" (wenig Obertöne, hauchig, wackelig)
import fs from 'fs';
export function testWav(sr = 22050) {
  const toene = [43, 45, 47, 48, 50, 52, 53, 55, 57, 58, 60, 62, 60, 58, 57, 55, 53, 52, 50, 48];
  const d = 0.9, pause = 0.25, N = Math.ceil((toene.length * (d + pause) + 0.5) * sr), x = new Float32Array(N);
  let t = 0.3, seed = 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (const m of toene) {
    const f0 = 440 * 2 ** ((m - 69) / 12), kopf = Math.max(0, Math.min(1, (m - 53) / 7));
    const tilt = 6 + 10 * kopf, rausch = 0.004 + 0.05 * kopf, jit = 0.002 + 0.012 * kopf;
    const a = Math.floor(t * sr), L = Math.floor(d * sr); let ph = 0, fj = f0;
    for (let i = 0; i < L; i++) {
      if (i % Math.round(sr / f0) === 0) fj = f0 * (1 + jit * rnd());
      const vib = 1 + 0.012 * Math.sin(2 * Math.PI * 5.5 * i / sr);
      ph += 2 * Math.PI * fj * vib / sr;
      let s = 0; for (let k = 1; k * f0 < 5000; k++) s += Math.sin(k * ph) * 10 ** (-(tilt * Math.log2(k)) / 20);
      const env = Math.min(1, i / 400, (L - i) / 400);
      x[a + i] = 0.25 * env * (s * (1 + 0.3 * (m - 48) / 14) + rausch * 6 * rnd());
    }
    t += d + pause;
  }
  const b = Buffer.alloc(44 + N * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + N * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(N * 2, 40);
  let mx = 0; for (const v of x) mx = Math.max(mx, Math.abs(v));
  for (let i = 0; i < N; i++) b.writeInt16LE(Math.round(x[i] / mx * 0.8 * 32767), 44 + i * 2);
  return b;
}
if (process.argv[2]) fs.writeFileSync(process.argv[2], testWav());
