// Unabhängige Einsätze aus der Tonhöhe (YIN, 10 ms): Stimm-Beginn nach ≥ 40 ms Pause oder Tonhöhen-Sprung > 70 ct (≥ 60 ms stabil) → CSV
import fs from 'node:fs';
import { yin } from '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/chr3/src/synth.mjs';
const [wav, out] = process.argv.slice(2);
const B = fs.readFileSync(wav); let p = 12, sr = 0, x = null; while (p < B.length) { const id = B.toString('ascii', p, p + 4), n = B.readUInt32LE(p + 4); if (id === 'fmt ') sr = B.readUInt32LE(p + 12); if (id === 'data') { x = new Float32Array(n / 2); for (let k = 0; k < x.length; k++) x[k] = B.readInt16LE(p + 8 + 2 * k) / 32768; } p += 8 + n + (n & 1); }
const Y = yin(x, sr, 70, 900), f = Y.f, dt = Y.hop / sr, ons = [];
const mid = k => { const a = []; for (let i = k; i < Math.min(f.length, k + 6); i++) if (f[i] > 0) a.push(1200 * Math.log2(f[i] / 440)); a.sort((u, v) => u - v); return a.length >= 4 ? a[a.length >> 1] : null; };
let gap = 99, cur = null;
for (let k = 0; k < f.length; k++) {
  if (!(f[k] > 0)) { gap++; if (gap >= 4) cur = null; continue; }
  const c = mid(k);
  if (cur == null) { if (gap >= 4 && c != null) { ons.push(k * dt + .02); cur = c; } }
  else if (c != null && Math.abs(c - cur) > 70) { const c2 = mid(k + 3); if (c2 != null && Math.abs(c2 - c) < 50) { ons.push(k * dt + .02); cur = c; } }
  gap = 0;
}
fs.writeFileSync(out, ons.map(t => t.toFixed(3) + ',0,0').join('\n') + '\n');
console.log(ons.length, 'Einsätze', ons.slice(0, 30).map(t => t.toFixed(2)).join(' '));
