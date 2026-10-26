import {render, mkPatch} from './v3-mk1-node.mjs';
import {mEinbruch, envDb} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE, Z = () => new Array(16).fill(0), Q = (k, m, v) => ({k, m, v: v ? v.concat(Z()).slice(0, 16) : Z()});
const SIG = {mix: {o1: 127, o2: 0, n: 40}, a: {lvl: 90}, f: {cut: 90}}, CH = [[0, 'on', 72, .7], [0, 'on', 76, .6], [0, 'on', 79, .6]];
const A = Array.from({length: 16}, (_, i) => (i & 1 ? -50 : 50));
const mk = (sq) => { const p = mkPatch(SIG); p.t[0].seq = Object.assign({on: 1, last: 16, type: 0, run: 1, ks: 1, res: 6}, sq); return p; };
for (const [nm, sq, at] of [['none', {on: 0, q: [Q(0,1), Q(0,1), Q(0,1)]}, []], ['vorrang', {q: [Q(15, 1, A), Q(0,1), Q(0, 1, A.map(x => -x))]}, [[.4, {mkSet: {'t.0.seq.q.2.k': 15}}], [.8, {mkSet: {'t.0.seq.q.2.k': 0}}]]], ['vorrang-noswitch', {q: [Q(15, 1, A), Q(0,1), Q(0, 1, A.map(x => -x))]}, []], ['cutoff off', {q: [Q(11, 0, A), Q(0,1), Q(0,1)]}, [[.4, {mkSet: {'t.0.seq.on': 0}}], [.8, {mkSet: {'t.0.seq.on': 1}}]]]]) {
  const y = render(mk(sq), CH, {sec: 1.2, file: FILE, at}).l; const e = envDb(y, 48000);
  console.log(nm, [.4, .8].map(t => mEinbruch(y, 48000, t).worst.toFixed(1)).join(' '), e.slice(70, 110).map(x => x.toFixed(0)).join(' '));
}
