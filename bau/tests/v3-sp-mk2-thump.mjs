// FP-DSP MK2: note-on transient of the Stimmwelle (W-28) - low-frequency lump from the fixed 300 Hz lowpasses starting at 0
// times the level compensation 1 / |H(f0)|; compared with the saw and with the tone's own level. Output and oscillator tap.
import {render, mkPatch} from './v3-mk2-node.mjs';
const OPEN = {f: {type: 0, cut: 127, res: 0}, e2: {a: 0, d: 64, s: 127, r: 8}};
function lp(x, fc) { const a = 1 - Math.exp(-2 * Math.PI * fc / 48000); let z1 = 0, z2 = 0, z3 = 0, z4 = 0; const y = new Float64Array(x.length); for (let i = 0; i < x.length; i++) { z1 += a * (x[i] - z1); z2 += a * (z1 - z2); z3 += a * (z2 - z3); z4 += a * (z3 - z4); y[i] = z4; } return y; }
const db = x => (20 * Math.log10(Math.max(1e-12, x))).toFixed(1);
for (const atk of [0, 30]) for (const [nm, o1] of [['Saege', {w: 0}], ['Stimme F64', {w: 4, c1: 64}], ['Stimme F0', {w: 4, c1: 0}]]) {
  const row = [];
  for (const note of [48, 60, 72, 84, 96, 108]) {
    const f0 = 440 * 2 ** ((note - 69) / 12);
    const r = render(mkPatch(Object.assign({o1}, OPEN, {e2: {a: atk, d: 64, s: 127, r: 8}})), [[.1, 'on', note, .8]], {sec: .6});
    const y = lp(r.l, Math.min(150, f0 / 3)); let pk = 0; for (let i = 4800; i < 9600; i++) pk = Math.max(pk, Math.abs(y[i]));
    let e = 0; for (let i = 19200; i < 28800; i++) e += r.l[i] ** 2;
    let tp = 0; for (let i = 19200; i < 28800; i++) tp = Math.max(tp, Math.abs(r.l[i]));
    row.push(note + ': LF ' + db(pk) + ' / tone pk ' + db(tp));
  }
  console.log(('A=' + atk + ' ' + nm).padEnd(16), row.join(' | '));
}
