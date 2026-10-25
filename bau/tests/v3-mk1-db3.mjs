// MK1-11 info for CHANGES: the -3 dB points of the four filter types at cutoff 32 / 64 / 96 (res 0), noise through the filter
import { render, mkPatch } from './v3-mk1-node.mjs';
import { spectrum } from './v3-mk1-ana.mjs';
const SR = 48000, n = 65536;
const specOf = x => { const S = new Float64Array(n / 2); let c = 0; for (let s = 9600; s + n <= x.length; s += n / 2) { const X = spectrum(x, s, n, 'hann'); for (let k = 0; k < n / 2; k++) S[k] += X[k]; c++; } return S; };
const pin = specOf(render(mkPatch({mix: {o1: 0, o2: 0, n: 127}, a: {gate: 1}}), [[0, 'on', 60, .8]], {sec: 6, tap: 'mix', seed: 3}).l);
const g = specOf(render(mkPatch({mix: {o1: 0, o2: 0, n: 127}, a: {gate: 1}, f: {type: 0, cut: 127, res: 0}}), [[0, 'on', 60, .8]], {sec: 6, seed: 3}).l);
const band = (S, f) => { const b = SR / n, k0 = Math.floor(f / 1.03 / b), k1 = Math.ceil(f * 1.03 / b); let a = 0; for (let k = k0; k <= k1; k++) a += S[k]; return a; };
const g0 = 10 * Math.log10(band(g, 200) / band(pin, 200));
const out = [];
for (const cut of [32, 64, 96]) { const fc = 20 * Math.pow(1000, cut / 127); const row = [cut + ' (W-01 ' + fc.toFixed(0) + ' Hz)'];
  for (const [t, nm] of [[0, '24LPF'], [1, '12LPF'], [2, '12BPF'], [3, '12HPF']]) {
    const S = specOf(render(mkPatch({mix: {o1: 0, o2: 0, n: 127}, a: {gate: 1}, f: {type: t, cut, res: 0}}), [[0, 'on', 60, .8]], {sec: 6, seed: 3}).l);
    const H = f => 10 * Math.log10(band(S, f) / band(pin, f)) - g0, fs = []; for (let f = 25; f < 20000; f *= 1.005) fs.push([f, H(f)]);
    if (t === 2) { const pk = Math.max(...fs.map(x => x[1])), ab = fs.filter(x => x[1] >= pk - 3); row.push(nm + ' ' + ab[0][0].toFixed(0) + '–' + ab[ab.length - 1][0].toFixed(0) + ' Hz (Spitze ' + pk.toFixed(1) + ' dB)'); }
    else if (t === 3) { const ab = fs.filter(x => x[1] >= -3); row.push(nm + ' ' + (ab.length ? ab[0][0].toFixed(0) : '–') + ' Hz'); }
    else { const be = fs.filter(x => x[1] < -3); row.push(nm + ' ' + (be.length ? be[0][0].toFixed(0) : '–') + ' Hz'); }
  }
  out.push(row.join(' · ')); }
console.log(out.join('\n'));
