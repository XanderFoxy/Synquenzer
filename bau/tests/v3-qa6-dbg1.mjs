import {render, mkPatch} from './v3-mk2-node.mjs';
const FILE = process.env.MK_FILE;
const Z = () => new Array(16).fill(0);
const Q = (k, m, v) => ({k, m: m == null ? 1 : m, v: v ? v.concat(Z()).slice(0, 16) : Z()});
for (const run of [0, 1]) {
const p = mkPatch({}); p.t[0].seq = {on: 1, last: 16, type: 0, run, ks: 0, res: 3, q: [Q(11, 1, Array.from({length: 16}, (_, i) => i + 1)), Q(0), Q(0)]};
const r = render(p, [[.5, 'on', 60, .8], [3.5, 'off', 60]], {file: FILE, sec: 3.6, songStart: 0, at: [[0, {mkScope: true}]]});
const L = r.msgs.filter(m => m.mkScope).map(m => m.mkScope).map(m => m.t.toFixed(4) + ':' + m.seq[0].step + (m.seq[0].done ? 'd' : '') + ' exp' + (Math.floor(m.t * 2 / .25) % 16 + 1));
console.log('run', run, L.slice(0, 40).join('  '));
}
