import {render, mkPatch} from './v3-mk2-node.mjs';
import {mKlick, db} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE, SR = 48000;
const Z = () => new Array(16).fill(0);
const Q = (k, m, v) => ({k, m: m == null ? 1 : m, v: v ? v.concat(Z()).slice(0, 16) : Z()});
const alt = (a, b) => Array.from({length: 16}, (_, i) => (i & 1 ? b : a));
for (const [tg, name, t] of [[23, 'A-HK SUSTAIN', {e2: {a: 0, d: 10, s: 64, r: 10}}], [19, 'F-HK SUSTAIN', {e1: {a: 0, d: 10, s: 64, r: 10}, f: {cut: 40, eg: 63, res: 30}}], [15, 'AMP-PEGEL (Kontrolle)', {}]]) {
  for (const w of [{mix: {o1: 127, o2: 0, n: 0}}, {mix: {o1: 0, o2: 0, n: 127}}]) {
    const p = mkPatch(Object.assign({}, t, w)); p.t[0].seq = {on: 1, last: 16, type: 0, run: 1, ks: 1, res: 3, q: [Q(tg, 1, alt(63, -63)), Q(0), Q(0)]};
    const y = render(p, [[0, 'on', 72, .8]], {file: FILE, sec: 2.1}).l;
    const g = render(p, [[0, 'on', 72, .8]], {file: FILE, sec: 2.1, tap: 'gain'}).l;
    const k = mKlick(y, SR, [0]);
    console.log(name + (w.mix.n ? ' Rauschen' : ' Säge') + ': M-KLICK ' + k.worst.toFixed(1) + ' dB bei ' + k.at.toFixed(3) + ' s · Pegel Schritt 2/3 ' + db(g[9000]).toFixed(1) + '/' + db(g[15000]).toFixed(1) + ' dB');
  }
}
