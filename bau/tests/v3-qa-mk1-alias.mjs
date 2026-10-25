// QA MK1-09 / MK1-04/05/13: folded energy (B.6 Nr. 12), own implementation (direct real FFT via the builder's fft, own windowing/bins)
import {render, mkPatch} from './v3-mk1-node.mjs';
import {fft} from './v3-mk1-ana.mjs';
const SR = 48000, N = 32768, mtof = n => 440 * Math.pow(2, (n - 69) / 12);
function folded(x, i0, f0) {
  const re = new Float64Array(N), im = new Float64Array(N); let m = 0; for (let i = 0; i < N; i++) m += x[i0 + i]; m /= N;
  for (let i = 0; i < N; i++) { const w = .42 - .5 * Math.cos(2 * Math.PI * i / (N - 1)) + .08 * Math.cos(4 * Math.PI * i / (N - 1)); re[i] = (x[i0 + i] - m) * w; }
  fft(re, im); const bin = SR / N; let h = 0, o = 0;
  for (let k = 1; k < N / 2; k++) { const f = k * bin; if (f < 20 || f > 10000 || f < f0 / 2) continue; const p = re[k] * re[k] + im[k] * im[k];
    const kk = Math.round(f / f0); if (kk >= 1 && Math.abs(k - kk * f0 / bin) <= 6) h += p; else o += p; }
  return 10 * Math.log10(o / h);
}
const res = [];
for (const [nm, over, note] of [['Saege C7', {o1: {w: 0}}, 96], ['Puls C7', {o1: {w: 1}}, 96], ['Dreieck C7', {o1: {w: 2}}, 96]]) {
  const x = render(mkPatch(Object.assign({f: {cut: 127}, a: {gate: 1}}, over)), [[0, 'on', note, .8]], {sec: 1.6}).l;
  res.push(nm + ' ' + [9600, 24000].map(i0 => folded(x, i0, mtof(note)).toFixed(1)).join(' / '));
}
for (const md of [2, 3]) { const row = []; for (const s of [1, 5, 9, 11, 17, 19]) { const x = render(mkPatch({o1: {w: 0}, o2: {w: 0, semi: s, mod: md}, mix: {o1: 0, o2: 127}, f: {cut: 127}, a: {gate: 1}}), [[0, 'on', 84, .8]], {sec: 1.6}).l; row.push('+' + s + ' ' + folded(x, 24000, mtof(84)).toFixed(1)); } res.push((md === 2 ? 'Sync' : 'Ring+Sync') + ' C6: ' + row.join(', ')); }
{ const x = render(mkPatch({o1: {w: 0}, mix: {o1: 127}, f: {cut: 127}, a: {dist: 1, gate: 1}}), [[0, 'on', 72, .8]], {sec: 1.6}).l; res.push('Verzerrung Saege C5 ' + folded(x, 24000, mtof(72)).toFixed(1)); }
console.log(res.join('\n'));
