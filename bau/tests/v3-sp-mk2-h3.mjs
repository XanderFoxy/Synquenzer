// H-3 (Spec §0.3, B.6 Nr. 3, MK2-10) for Sinus x X-MOD (STEUER 1): M-SP (Hann 2048, magnitude-weighted, mean over 8 frames) at
// 0, 1/4, 1/2, 3/4, 1 - with the INIT modulator (OSC 2 saw, semi 0) and other OSC 2 settings; C3, vel 0.8, filter open
import {render, mkPatch} from './v3-mk2-node.mjs';
import {fft} from './v3-sp-mk2-ana.mjs';
const SR = 48000, N = 2048;
function msp(x) { const acc = new Float64Array(N / 2); for (let f = 0; f < 8; f++) { const s = 9600 + f * N, re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = x[s + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / (N - 1))); fft(re, im); for (let k = 0; k < N / 2; k++) acc[k] += Math.hypot(re[k], im[k]); }
  let a = 0, b = 0; for (let k = 1; k < N / 2; k++) { a += acc[k] * k * SR / N; b += acc[k]; } return a / b; }
for (const [nm, o2] of [['INIT OSZ 2 Saege +0', {w: 0, semi: 0}], ['OSZ 2 Saege +12', {w: 0, semi: 12}], ['OSZ 2 Rechteck +7', {w: 1, semi: 7}], ['OSZ 2 Dreieck +12', {w: 2, semi: 12}]]) {
  const v = [0, 32, 64, 95, 127].map(c1 => msp(render(mkPatch({o1: {w: 3, c1}, o2, f: {type: 0, cut: 127, res: 0}}), [[0, 'on', 48, .8]], {sec: 1}).l));
  const st = []; for (let i = 1; i < v.length; i++) st.push(Math.log2(v[i] / v[i - 1]));
  console.log(nm.padEnd(20), 'M-SP Hz', v.map(x => x.toFixed(0)).join(' / '), ' steps (oct)', st.map(x => x.toFixed(2)).join(' '));
}
