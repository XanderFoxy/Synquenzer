import fs from 'fs';
import {DIR} from './v3-qa-vs4-h.mjs';
const rd = f => { const b = fs.readFileSync(f); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const mic = rd(DIR + '/cap-sat6-0-mic.f32'), ref = rd(DIR + '/cap-sat6-0-ref.f32'), sr = 44100, n = mic.length;
const hp = x => { const w = 2 * Math.PI * 250 / sr, cw = Math.cos(w), al = Math.sin(w) / (2 * 0.707), a0 = 1 + al, b0 = (1 + cw) / 2 / a0, b1 = -(1 + cw) / a0, b2 = b0, a1 = -2 * cw / a0, a2 = (1 - al) / a0; const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
const h = hp(ref); let pk = 0; for (const v of h) pk = Math.max(pk, Math.abs(v)); console.log('HP(ref) peak', pk.toFixed(3));
let best = null;
for (let d = 500; d < 560; d++) for (const nl of [0, 1]) {
  let a = 0, b = 0;
  const z = i => { const v = i - d >= 0 ? h[i - d] : 0; return nl ? Math.tanh(v) : v; };
  for (let i = 0; i < n; i++) { const v = z(i); a += v * mic[i]; b += v * v; }
  const g = a / b; let e = 0, m = 0; for (let i = 0; i < n; i++) { const r = mic[i] - g * z(i); e += r * r; m += mic[i] * mic[i]; }
  const red = 10 * Math.log10(m / e); best = best || {}; if (!best[nl] || red > best[nl].red) best[nl] = {d, g, red};
}
console.log(JSON.stringify(best));
