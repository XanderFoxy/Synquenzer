import {render, mkPatch} from './v3-mk1-node.mjs';
const FILE = process.env.MK_FILE, PREV = process.env.MK_PREV;
const ev = [[0, 'on', 48, .8], [.05, 'on', 55, .7], [.1, 'on', 64, .9], [.6, 'off', 48], [.7, 'off', 55], [.8, 'off', 64]];
const tims = [{}, {o1: {w: 1, c1: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 90, n: 20}, f: {type: 1, cut: 70, res: 80, eg: 30}, l1: {f: 90}}, {o1: {w: 3, c1: 64}, f: {type: 2, cut: 60}, a: {dist: 1}, asg: 2}];
let worst = 0;
for (const t of tims) { const p = mkPatch(t); const a = render(p, ev, {sec: 1.2, file: FILE}), b = render(p, ev, {sec: 1.2, file: PREV}); for (let i = 0; i < a.l.length; i++) worst = Math.max(worst, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i])); }
console.log('seq absent vs base max', worst);
// seq on, all zeros, many targets
worst = 0;
for (const t of tims) for (const ks of [0, 1, 2]) {
  const p = mkPatch(t), q = [11, 1, 27].map((k, j) => ({k, m: j & 1, v: new Array(16).fill(0)}));
  p.t[0].seq = {on: 1, last: 16, type: 2, run: 1, ks, res: 3, q};
  const a = render(p, ev, {sec: 1.2, file: FILE}), b = render(mkPatch(t), ev, {sec: 1.2, file: PREV});
  for (let i = 0; i < a.l.length; i++) worst = Math.max(worst, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
}
console.log('seq on zeros vs base max', worst);
// seq on cutoff step
const p = mkPatch({f: {cut: 40}}); p.t[0].seq = {on: 1, last: 4, type: 0, run: 1, ks: 1, res: 3, q: [{k: 15, m: 1, v: [0, -63, 0, -30, 0,0,0,0,0,0,0,0,0,0,0,0]}, {k: 0, m: 1, v: new Array(16).fill(0)}, {k: 0, m: 1, v: new Array(16).fill(0)}]};
const r = render(p, [[0, 'on', 60, .8]], {sec: 1, file: FILE, at: [[0, {mkScope: true}]]});
const rms = (a, i0, i1) => { let e = 0; for (let i = i0; i < i1; i++) e += a[i] * a[i]; return 10 * Math.log10(e / (i1 - i0) + 1e-30); };
for (let k = 0; k < 8; k++) console.log('step', k, rms(r.l, k * 6000 + 1000, k * 6000 + 5000).toFixed(1));
console.log(JSON.stringify(r.msgs.filter(m => m.mkScope).slice(0, 3).map(m => m.mkScope.seq)));
