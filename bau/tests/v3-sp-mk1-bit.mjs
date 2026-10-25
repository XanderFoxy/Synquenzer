import {render} from './v3-mk1-node.mjs'; import fs from 'fs';
const OLD = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK0-fix.html';
const flats = JSON.parse(fs.readFileSync('v3-sp-mk1-flats.json', 'utf8'));
const ev = [[0, 'on', 48, .8], [0.05, 'on', 55, .6], [0.1, 'on', 64, .9], [0.8, 'off', 48], [0.9, 'off', 55], [1.0, 'off', 64], [1.1, 'on', 72, .7], [1.6, 'off', 72]];
let worst = 0, n = 0, bad = [];
for (const f of flats) {
  const o = {sec: 2.2, eng: f.flat.eng, flat: f.flat, mods: f.mods, seed: 1};
  const a = render(null, ev, Object.assign({file: OLD}, o)), b = render(null, ev, o);
  let d = 0; for (let i = 0; i < a.l.length; i++) d = Math.max(d, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i]));
  n++; if (d > worst) worst = d; if (d > 1e-6) bad.push(f.id + ' ' + d.toExponential(2));
}
console.log('compared', n, 'VA/WT factory sounds old 4.8.1 vs new: max |d|', worst, 'over 1e-6:', bad.join(', ') || 'none');
