// QA MK6: recording at KEY SYNC Stimme follows the newest voice; that voice ends mid-recording while an older note is held
import {render, mkPatch} from './v3-mk2-node.mjs';
const FILE = process.env.MK_FILE;
const Z = () => new Array(16).fill(0);
const p = mkPatch({f: {cut: 64}, e2: {a: 0, d: 64, s: 127, r: 0}}); p.t[0].seq = {on: 1, last: 16, type: 0, run: 1, ks: 2, res: 3, q: [{k: 0, m: 1, v: Z()}, {k: 0, m: 1, v: Z()}, {k: 0, m: 1, v: Z()}]};
const at = [[.55, {mkRec: {k: 0, tg: 11, base: 64}}], [.555, {mkScope: true}]];
for (let i = 0; i < 80; i++) { const t = .56 + i * .03; at.push([t, {mkSet: {'t.0.f.cut': 70 + (i % 40)}}]); }
const r = render(p, [[0, 'on', 60, .8], [.5, 'on', 64, .8], [.8, 'off', 64]], {file: FILE, sec: 3.2, at});
const d = r.msgs.filter(m => m.mkRecDone).map(m => m.mkRecDone);
const sc = r.msgs.filter(m => m.mkScope).map(m => m.mkScope);
const recSteps = []; for (const m of sc) { const x = m.seq[0].rec; if (x && recSteps[recSteps.length - 1] !== x.step) recSteps.push(x.step); }
console.log('recording steps seen (scope):', recSteps.join(','));
console.log('mkRecDone:', d.length ? `from ${d[0].from} to ${d[0].to}, values ${d[0].v.join(',')}` : 'none');
if (d.length) { const un = []; for (let s = d[0].from - 1; s < d[0].to; s++) if (d[0].v[s] === 0) un.push(s + 1); console.log('steps inside from..to left unwritten (value 0):', un.join(',') || 'none'); }
