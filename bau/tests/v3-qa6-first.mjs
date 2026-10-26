// QA MK6: the first note after load / after a target change while idle: SEQ offsets fade in over 5 ms (meant for held notes)
import {render, mkPatch} from './v3-mk2-node.mjs';
import {db} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE, SR = 48000;
const Z = () => new Array(16).fill(0);
const Q = (k, m, v) => ({k, m: m == null ? 1 : m, v: v ? v.concat(Z()).slice(0, 16) : Z()});
const SP = (t, sq) => { const p = mkPatch(t || {}); p.t[0].seq = Object.assign({on: 1, last: 16, type: 0, run: 1, ks: 1, res: 3}, sq); return p; };
// instantaneous pitch from zero crossings of a sine (cents vs 220 Hz) in a window
function zc(y, i0, i1) { const c = []; for (let i = i0 + 1; i < i1; i++) if (y[i - 1] < 0 && y[i] >= 0) c.push(i - 1 + (-y[i - 1]) / (y[i] - y[i - 1])); return c; }
const sine = {o1: {w: 3, c1: 0, c2: 0}, a: {gate: 1, lvl: 100}};
for (const ks of [1, 2]) {
  // pitch +12 on every step; note A3 (220 Hz) at 0 (first note after load) and again at 0.5 s
  const y = render(SP(sine, {ks, q: [Q(1, 1, new Array(16).fill(12)), Q(0), Q(0)]}), [[0, 'on', 57, .8], [.3, 'off', 57], [.5, 'on', 57, .8]], {file: FILE, sec: .7}).l;
  const per = (t0) => { const c = zc(y, Math.round(t0 * SR), Math.round(t0 * SR) + 960); return c.slice(1).map((x, k) => (1200 * Math.log2(SR / (x - c[k]) / 220)).toFixed(0)); };
  console.log('KEY SYNC ' + ks + ' · Note 1 (nach dem Laden), Perioden der ersten 20 ms in ct gegen 220 Hz: ' + per(0).join(' '));
  console.log('KEY SYNC ' + ks + ' · Note 2 (0,5 s): ' + per(.5).join(' '));
}
// EG attack (A-HK ATTACK +63 on every step)
const eg = {e2: {a: 0, d: 64, s: 127, r: 0}, a: {lvl: 100}};
for (const ks of [1, 2]) {
  const g = render(SP(eg, {ks, q: [Q(21, 1, new Array(16).fill(63)), Q(0), Q(0)]}), [[0, 'on', 69, .8], [.3, 'off', 69], [.5, 'on', 69, .8]], {file: FILE, sec: .7, tap: 'gain'}).l;
  const ref = render(mkPatch({e2: {a: 63, d: 64, s: 127, r: 0}, a: {lvl: 100}}), [[0, 'on', 69, .8]], {file: FILE, sec: .2, tap: 'gain'}).l;
  console.log('KEY SYNC ' + ks + ' · ATTACK +63 per SEQ: Pegel 10/30 ms nach Note 1 ' + db(g[480]).toFixed(1) + '/' + db(g[1440]).toFixed(1) + ' dB, Note 2 ' + db(g[24000 + 480]).toFixed(1) + '/' + db(g[24000 + 1440]).toFixed(1) + ' dB, gespeichertes ATTACK 63 ' + db(ref[480]).toFixed(1) + '/' + db(ref[1440]).toFixed(1) + ' dB');
}
// a target change while idle (mkSet ZIEL Cutoff -> Tonhöhe at 0.4 s, between two notes)
{
  const p = SP(sine, {ks: 1, q: [Q(11, 1, new Array(16).fill(12)), Q(0), Q(0)]});
  const y = render(p, [[0, 'on', 57, .8], [.3, 'off', 57], [.5, 'on', 57, .8]], {file: FILE, sec: .7, at: [[.4, {mkSet: {'t.0.seq.q.0.k': 1}}]]}).l;
  const c = zc(y, 24000, 24960); console.log('ZIEL im Leerlauf auf TONHÖHE (+12) geändert, Note danach, Perioden in ct: ' + c.slice(1).map((x, k) => (1200 * Math.log2(SR / (x - c[k]) / 220)).toFixed(0)).join(' '));
}
