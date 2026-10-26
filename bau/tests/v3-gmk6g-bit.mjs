// G-MK6 fix: plain seq runs (no edits during notes) are bit-equal to MK6-fix (before the fix); differences only where a glide is due
import {render, mkPatch} from './v3-mk2-node.mjs';
const A = process.env.MK_FILE, B = process.env.MK_BASE;
const Z = () => new Array(16).fill(0), Q = (k, m, v) => ({k, m, v: v ? v.concat(Z()).slice(0, 16) : Z()});
const ramp = [...Array(16).keys()].map(s => s * 8 - 60), alt = Array.from({length: 16}, (_, i) => (i & 1 ? -40 : 50));
const SP = (sq) => { const p = mkPatch({f: {cut: 64, res: 20}}); p.t[0].seq = Object.assign({on: 1, last: 16, type: 0, run: 1, ks: 1, res: 3}, sq); return p; };
const cases = [];
for (const ks of [0, 1, 2]) for (const m of [0, 1]) for (const type of [0, 1, 2, 3]) cases.push([`ks${ks} m${m} ty${type}`, SP({ks, type, res: 2, q: [Q(11, m, ramp), Q(15, m, alt), Q(16, m, ramp.map(x => -x))]})]);
cases.push(['einmal glatt', SP({run: 0, q: [Q(11, 0, ramp), Q(0, 0), Q(0, 0)]})]);
cases.push(['steplen glatt', SP({q: [Q(2, 0, alt.map(x => Math.sign(x) * 2)), Q(11, 0, ramp), Q(0, 0)]})]);
// notes: legato chord (no key-sync reset with sounding voices), then a gap and a new chord after the release ended
const ev = [[0, 'on', 60, .8], [.2, 'on', 64, .8], [1.6, 'off', 60], [1.6, 'off', 64], [2.6, 'on', 67, .8], [3.4, 'off', 67]];
let bad = 0;
for (const [n, p] of cases) { const a = render(p, ev, {sec: 4, file: A}).l, b = render(p, ev, {sec: 4, file: B}).l; let d = 0; for (let i = 0; i < a.length; i++) d = Math.max(d, Math.abs(a[i] - b[i])); if (d > 1e-6) bad++; console.log(n.padEnd(16), 'max |d|', d.toExponential(2)); }
console.log(bad ? 'FAIL ' + bad + ' differ' : 'PASS all bit-equal');
