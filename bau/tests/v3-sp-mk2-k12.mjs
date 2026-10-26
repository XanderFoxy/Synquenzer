// FP-KLANG / FP-DSP MK2-12 "gespielt", independent: the app worklet (Node) plays every stored wave at 187.5 Hz (filter open, amp
// held), mean over 8 periods; partials 1-16 of the table (at f / r) against the private compact trace (scratchpad/dwgs-trace):
// waves 1-60 directly, 35 and 61-64 against the envelope in Hz (traced partials at k * 220.27 Hz, linear in dB over log f).
// Gain = least squares in dB over the partials >= -40 dB. Also C3 / C4 (octave support points) for 61-64.
import fs from 'fs';
import {renderW, mkPatch} from './v3-mk2-node.mjs';
const C = JSON.parse(fs.readFileSync(new URL('../dwgs-trace/dwgs-64-compact.json', import.meta.url), 'utf8')).waves;
const SR = 48000, OPEN = {f: {type: 0, cut: 127, res: 0}, a: {gate: 1}};
const db = x => 20 * Math.log10(Math.max(1e-15, x));
function partials(x, i0, f1, K) {  // Blackman-windowed DFT at the exact partial frequencies k * f1 over 14400 samples (0.3 s)
  const N = 14400, out = []; let ws = 0; const W = new Float64Array(N); for (let i = 0; i < N; i++) { W[i] = .42 - .5 * Math.cos(2 * Math.PI * i / (N - 1)) + .08 * Math.cos(4 * Math.PI * i / (N - 1)); ws += W[i]; }
  for (let k = 1; k <= K; k++) { let a = 0, b = 0; const w = 2 * Math.PI * k * f1 / SR; for (let i = 0; i < N; i++) { a += x[i0 + i] * W[i] * Math.cos(w * i); b += x[i0 + i] * W[i] * Math.sin(w * i); } out.push(2 * Math.hypot(a, b) / ws); } return out;
}
function envHz(w, fHz) {  // envelope in Hz from the traced partials at k * 220.27 Hz
  const Ld = w.a.map(a => db(a)); const K = w.a.length, h = fHz / 220.27;
  if (h <= 1) return Ld[0] - 12 * Math.log2(1 / h);
  if (h >= K) return null;
  const m = Math.floor(h), t = Math.log(h / m) / Math.log((m + 1) / m); return Ld[m - 1] + (Ld[m] - Ld[m - 1]) * t;
}
function check(n, F) {
  const w = C[n - 1], r = w.r, note = 69 + 12 * Math.log2(F / 440);
  const res = renderW(mkPatch(Object.assign({o1: {w: 5, c2: 2 * (n - 1)}}, OPEN)), [[0, 'on', note, .8]], {sec: .6, tap: 'mix'}, [n]);
  // table period = r note periods; at 187.5 Hz: 256 r samples (r = 1.49831 is not an integer multiple: use 3 note periods = 768 / r...)
  const P = partials(res.l, 9600, F / r, 16).map(db);
  let ref;
  if (n === 35 || n >= 61) { ref = []; for (let k = 1; k <= 16; k++) { if (n === 35) { ref.push(null); continue; } ref.push(envHz(w, k * F / r)); } }
  else { const am = Math.max(...w.a); ref = w.a.slice(0, 16).map(a => db(a / am)); }
  if (n === 35) return null;
  const idx = []; const mx = Math.max(...ref.filter(x => x != null)); ref.forEach((x, i) => { if (x != null && x - mx >= -40) idx.push(i); });
  const g = idx.reduce((s, i) => s + (P[i] - ref[i]), 0) / idx.length;
  let worst = 0, wk = 0; for (const i of idx) { const d = Math.abs(P[i] - ref[i] - g); if (d > worst) { worst = d; wk = i + 1; } }
  return {worst, wk, n: idx.length};
}
const rows = []; let worst60 = 0, w60 = 0;
for (let n = 1; n <= 64; n++) { if (n === 35) continue; const c = check(n, 187.5); if (n <= 60) { if (c.worst > worst60) { worst60 = c.worst; w60 = n; } } else rows.push(n + ': max ' + c.worst.toFixed(2) + ' dB (Teilton ' + c.wk + ', ' + c.n + ' Teiltöne >= -40 dB)'); }
console.log('MK2-12 gespielt 187,5 Hz, Wellen 1-60 (ohne 35): max Abweichung ' + worst60.toFixed(2) + ' dB (Welle ' + w60 + ')');
console.log('MK2-12 gespielt 187,5 Hz, 61-64 gegen die Hülle in Hz:\n  ' + rows.join('\n  '));
for (const F of [130.8128, 261.6256, 155.5635, 220.27, 250]) { const r2 = []; for (let n = 61; n <= 64; n++) { const c = check(n, F); r2.push(n + ': ' + c.worst.toFixed(2) + ' dB (k ' + c.wk + ')'); } console.log('  bei ' + F.toFixed(1) + ' Hz: ' + r2.join(', ')); }
