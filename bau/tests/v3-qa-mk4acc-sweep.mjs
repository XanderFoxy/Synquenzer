// gestures (fractional values every quantum, EN3-03) over 1 s on a held bright saw chord and on noise: M-KLICK over the gesture
// window against the same render without the gesture (control at the end value / start value)
import {render, mkPatch} from './v3-mk1-node.mjs';
import {mKlick} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE;
const FX0 = {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}};
const P = (t, fx) => { const p = Object.assign(mkPatch(t), JSON.parse(JSON.stringify(FX0))); for (const k in fx || {}) Object.assign(p[k], fx[k]); return p; };
const SAW = {o1: {w: 0}, mix: {o1: 127}, f: {cut: 110}}, NOI = {o1: {w: 0}, mix: {o1: 0, n: 127}};
const ev = [[0, 'on', 60, .7], [0, 'on', 64, .6], [0, 'on', 67, .6], [3.9, 'off', 60], [3.9, 'off', 64], [3.9, 'off', 67]];
const sweep = (path, a, b, t0) => { const at = []; for (let t = t0; t <= t0 + 1; t += 128 / 48000) at.push([t, {mkSet: {[path]: a + (b - a) * (t - t0)}}]); at.push([t0 + 1.001, {mkSet: {[path]: b}}]); return at; };
const K = (r, t0, t1) => Math.max(...[r.l, r.r].map(y => mKlick(y.subarray(Math.round(t0 * 48000), Math.round(t1 * 48000)), 48000, []).worst));
for (const [nm, fx, path, a, b] of [
  ['ZEIT 20→120 (sync aus, TIEFE 100)', {dly: {time: 20, dep: 100}}, 'dly.time', 20, 120],
  ['ZEIT 120→5 (sync aus, TIEFE 127)', {dly: {time: 120, dep: 127}}, 'dly.time', 120, 5],
  ['NOTE 1/32→1/1 (sync an, TIEFE 100)', {dly: {sync: 1, note: 0, dep: 100}}, 'dly.note', 0, 14],
  ['HOCH-FREQ 1→18 kHz (+12 dB)', {eq: {hf: 1000, hg: 12}}, 'eq.hf', 1000, 18000],
  ['TIEF-FREQ 1000→40 Hz (−12 dB)', {eq: {lf: 1000, lg: -12}}, 'eq.lf', 1000, 40],
  ['MOD-FX TEMPO 0→127 (Cho/Flg TIEFE 127)', {mfx: {type: 0, spd: 0, dep: 127}}, 'mfx.spd', 0, 127],
  ['MOD-FX TEMPO 0→127 (Phaser TIEFE 127)', {mfx: {type: 2, spd: 0, dep: 127}}, 'mfx.spd', 0, 127],
  ['MOD-FX TIEFE 0→127 (Ensemble)', {mfx: {type: 1, spd: 64, dep: 0}}, 'mfx.dep', 0, 127],
  ['DELAY TIEFE 127→0 (Kreuz 1/8)', {dly: {type: 1, sync: 1, note: 5, dep: 127}}, 'dly.dep', 127, 0],
]) {
  for (const [sn, tim] of [['Säge', SAW], ['Rauschen', NOI]]) {
    const r = render(P(tim, fx), ev, {sec: 3.5, file: FILE, at: sweep(path, a, b, 1)});
    const c0 = render(P(tim, fx), ev, {sec: 3.5, file: FILE});
    const end = JSON.parse(JSON.stringify(fx)); const [bk, kk] = path.split('.'); end[bk] = Object.assign({}, end[bk] || {}, {[kk]: b});
    const c1 = render(P(tim, end), ev, {sec: 3.5, file: FILE});
    const k = K(r, .95, 2.4), k0 = Math.max(K(c0, .95, 2.4), K(c1, .95, 2.4));
    console.log((k <= 6 || k <= k0 + .5 ? 'PASS' : 'FAIL') + ' Zug ' + nm + ' [' + sn + ']: M-KLICK ' + k.toFixed(1) + ' dB (ohne Zug ' + k0.toFixed(1) + ' dB)');
  }
}
