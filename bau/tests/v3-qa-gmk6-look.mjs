// look at a raw tap around given times: 1-ms RMS (dB), max |d1|, max |d2| per ms
import fs from 'fs';
const [tag, tapIdx, ...ts] = process.argv.slice(2);
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk6/';
const meta = JSON.parse(fs.readFileSync(D + tag + '-meta.json')); const b = fs.readFileSync(D + tag + '-tap' + tapIdx + '.f32'); const x = new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4);
const sr = meta.sr, t0 = meta.f0 / sr;
for (const ts_ of ts) { const t = +ts_; const c = Math.round((t - t0) * sr), B = Math.round(sr / 1000);
  const rows = []; for (let k = -12; k <= 12; k++) { const a = c + k * B; let s = 0, m1 = 0, m2 = 0; for (let i = a; i < a + B; i++) { s += x[i] * x[i]; m1 = Math.max(m1, Math.abs(x[i] - x[i - 1])); m2 = Math.max(m2, Math.abs(x[i] - 2 * x[i - 1] + x[i - 2])); } rows.push(`${k >= 0 ? '+' : ''}${k}ms rms ${(10 * Math.log10(s / B + 1e-20)).toFixed(1)} d1 ${m1.toExponential(1)} d2 ${m2.toExponential(1)}`); }
  console.log('== t', t); console.log(rows.join('\n'));
  // notes near
  const nn = meta.notes.filter(n => Math.abs(n[0] - t) < .3 || (n[4] != null && Math.abs(n[0] + n[4] - t) < .3)).map(n => [+(n[0] - t).toFixed(3), n[1], n[4] != null ? +(n[0] + n[4] - t).toFixed(3) : null]);
  console.log('notes (on rel, track, off rel)', JSON.stringify(nn.filter(n => n[1] === 2 || n[1] === 3 || n[1] === 0)));
}
