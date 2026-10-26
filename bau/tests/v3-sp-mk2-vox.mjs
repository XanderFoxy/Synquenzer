// FP-DSP MK2-02 literal: Stimmwelle spectral envelope at C2 vs C4, third-octave band energy 400-4000 Hz normalised to the TOTAL
// level of the note (all partials), max |difference| <= 3 dB; also the builder's reading (normalised over 400-4000 Hz only).
import {renderW, mkPatch} from './v3-mk2-node.mjs';
import {ampAt} from './v3-sp-mk2-ana.mjs';
const SR = 48000, OPEN = {f: {type: 0, cut: 127, res: 0}, a: {gate: 1}}, mtof = n => 440 * 2 ** ((n - 69) / 12);
const centres = []; for (let i = 0; i <= 10; i++) centres.push(400 * 2 ** (i / 3));
function bands(note, c1) {
  const f0 = mtof(note), r = renderW(mkPatch(Object.assign({o1: {w: 4, c1}}, OPEN)), [[0, 'on', note, .8]], {sec: 1.6}, []);
  const P = []; for (let k = 1; k * f0 < 20000; k++) P.push([k * f0, ampAt(r.l, 24000, 32768, k * f0, SR) ** 2 / 2]);
  const tot = P.reduce((s, x) => s + x[1], 0);
  const B = centres.map(fc => { const lo = fc / 2 ** (1 / 6), hi = fc * 2 ** (1 / 6); return P.filter(x => x[0] >= lo && x[0] < hi).reduce((s, x) => s + x[1], 0); });
  const tot4 = B.reduce((s, x) => s + x, 0);
  return {lit: B.map(b => 10 * Math.log10(b / tot)), in4: B.map(b => 10 * Math.log10(b / tot4))};
}
for (const c1 of [0, 64, 127]) {
  const a = bands(36, c1), b = bands(60, c1);
  const dl = a.lit.map((x, i) => x - b.lit[i]), d4 = a.in4.map((x, i) => x - b.in4[i]);
  console.log('FORM', c1, ' literal (norm. to total): max |C2-C4|', Math.max(...dl.map(Math.abs)).toFixed(2), 'dB [', dl.map(x => x.toFixed(1)).join(' '), ']  | norm. 400-4000 only:', Math.max(...d4.map(Math.abs)).toFixed(2), 'dB');
}
// FORM effect over the key range (H-1 measure M-SP)
import {powerSpec} from './v3-sp-mk2-ana.mjs';
const msp = (note, c1) => { const r = renderW(mkPatch(Object.assign({o1: {w: 4, c1}}, OPEN)), [[0, 'on', note, .8]], {sec: .6}, []); const P = powerSpec(r.l, 9600, 2048); let a = 0, b = 0; for (let k = 1; k < 1024; k++) { const m = Math.sqrt(P[k]); a += m * k * SR / 2048; b += m; } return a / b; };
console.log('FORM 0 -> 127, M-SP change in octaves by note:', [48, 60, 67, 72, 76, 79, 84, 96].map(n => n + ':' + Math.log2(msp(n, 0) / msp(n, 127)).toFixed(3)).join(' '));
