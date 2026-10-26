import {render, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = (fx, t) => Object.assign(mkPatch(t || {}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx || {});
const ev = [[0, 'on', 60, .9], [.3, 'off', 60], [2.5, 'on', 64, .8], [3.0, 'off', 64]];
const offMsg = {mkSet: {'mfx.dep': 0, 'dly.dep': 0, 'eq.lg': 0, 'eq.hg': 0}};
for (const fx of [{mfx: {type: 2, spd: 64, dep: 127}}, {mfx: {type: 2, spd: 64, dep: 0}}]) {
const a = render(FXP(fx), ev, {sec: 3.5, file: FILE, at: [[.6, offMsg]]}), b = render(FXP({}), ev, {sec: 3.5, file: FILE});
const i0 = Math.round(2.5 * SR);
let first = -1; for (let i = i0 - 2000; i < i0 + 5000; i++) if (a.l[i] !== b.l[i]) { first = i; break; }
console.log(JSON.stringify(fx), 'first diff at sample', first, (first - i0));
const s = []; for (let i = first; i < first + 12; i++) s.push(a.l[i].toFixed(5) + '/' + b.l[i].toFixed(5)); console.log(s.join(' '));
// lag search: is a = b shifted?
let best = 1e9, bl = 0; for (let L = -64; L <= 64; L++) { let e = 0; for (let i = i0; i < i0 + 4800; i++) { const d = a.l[i] - b.l[i + L]; e += d * d; } if (e < best) { best = e; bl = L; } }
console.log('best lag', bl, 'resid', best.toExponential(2));
}
