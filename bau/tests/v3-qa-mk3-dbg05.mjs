import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms, mKlick} from './v3-mk1-ana.mjs';
const NEW = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html', SR = 48000;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const C = x => JSON.parse(JSON.stringify(x));
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, C(top || {})); merge(p.t[0], C(t1 || {})); merge(p.t[1], C(t2 || {})); return p; };
const saw = {o1: {w: 0}, f: {cut: 100, res: 40}}, pad = {o1: {w: 1, c1: 30}, f: {cut: 90}, e2: {a: 40, r: 60}, a: {lvl: 110}};
const one = [[0, 'on', 60, .8]];
const R = (p, o) => render(p, one, Object.assign({file: NEW, sec: 1.2}, o || {}));
const mute = (p, k) => { const q = C(p); q.t[k].a.lvl = 0; return q; };
const p = prog({mode: 1}, pad, saw);
const x = R(p, {at: [[.5, {mkSet: {mode: 0}}]]});
const a = R(mute(p, 1)), b = R(mute(p, 0));   // T1 alone, T2 alone (dual)
const s0 = Math.round(.5 * SR), N = Math.round(.04 * SR);
const ideal = {l: a.l.map((v, i) => v + b.l[i] * (i < s0 ? 1 : i < s0 + N ? Math.cos(Math.PI / 2 * (i - s0) / N) : 0))};
const lin = {l: a.l.map((v, i) => v + b.l[i] * (i < s0 ? 1 : i < s0 + N ? 1 - (i - s0) / N : 0))};
const k1 = mKlick(x.l, SR, [0]), k2 = mKlick(ideal.l, SR, [0]), k3 = mKlick(lin.l, SR, [0]);
console.log('app switch', k1.worst.toFixed(1), '@', k1.at.toFixed(3), '| ideal 40 ms cos fade of T2', k2.worst.toFixed(1), '@', k2.at.toFixed(3), '| linear 40 ms', k3.worst.toFixed(1), '@', k3.at.toFixed(3));
// difference app vs ideal around the switch
let m = 0, at = 0; for (let i = s0 - 2000; i < s0 + 4000; i++) { const e = Math.abs(x.l[i] - ideal.l[i]); if (e > m) { m = e; at = i; } }
console.log('max |app − ideal| in the switch region', m.toExponential(2), '@', (at / SR).toFixed(4));
// the gain the app applied to T2: estimate by least squares per 1 ms
const g = []; for (let t = s0 - 96; t < s0 + 2400; t += 48) { let num = 0, den = 0; for (let i = t; i < t + 48; i++) { const r = x.l[i] - a.l[i]; num += r * b.l[i]; den += b.l[i] * b.l[i]; } g.push((num / den).toFixed(2)); }
console.log('T2 gain per ms from −2 ms:', g.join(' '));
// does T1 change at the switch?  residual after removing T2 fit
for (const [lab, ms, f] of [['cos (equal power)', 40, u => Math.cos(Math.PI / 2 * u)], ['Hann 0.5+0.5cos', 40, u => .5 + .5 * Math.cos(Math.PI * u)], ['cos', 60, u => Math.cos(Math.PI / 2 * u)], ['Hann', 60, u => .5 + .5 * Math.cos(Math.PI * u)], ['cos²', 40, u => Math.cos(Math.PI / 2 * u) ** 2]]) {
  const n = Math.round(ms / 1000 * SR), y = a.l.map((v, i) => v + b.l[i] * (i < s0 ? 1 : i < s0 + n ? f((i - s0) / n) : 0)), k = mKlick(y, SR, [0]);
  console.log('ideal fade of T2', lab.padEnd(18), ms + ' ms', 'M-KLICK', k.worst.toFixed(1), '@', k.at.toFixed(3));
}
