import {render, mkDefaults} from './v3-mk1-node.mjs';
const NEW = new URL('../mk-br-MK3/index.html', import.meta.url).pathname, SR = 48000, pdb = x => 10 * Math.log10(x + 1e-30);
function mEin16(x, t) { const W = 240, c = Math.round(t * SR), win = i => { let e = 0; for (let k = i; k < i + W; k++) e += x[k] * x[k]; return e / W; };
  const ws = []; for (let i = c - 2400; i + W <= c + 2400; i += 48) ws.push([(i - c) / SR, win(i)]);
  const pre = ws.filter(([u]) => u + .005 <= -.01 + 1e-9), ref = pre.reduce((a, b) => a + b[1], 0) / pre.length; let w = 0; for (const [, e] of ws) w = Math.min(w, pdb(e / ref)); return w; }
for (const cut of [70, 50]) { const r0 = []; for (let s = 1; s <= 24; s++) { const p = mkDefaults(); p.mode = 0; p.t[0].f.cut = cut; p.t[1].f.cut = cut;
  const r = render(p, [[0, 'on', 64, .8]], {file: NEW, sec: 1, seed: s, at: [[.5, {mkSet: {mode: 2, split: 60}}]]}); r0.push(mEin16(r.l, .5)); }
  r0.sort((a, b) => a - b); console.log('Säge, Cutoff ' + cut + ' beide, MODUS Einzeln→Split 60: worst ' + r0[0].toFixed(1) + ' dB, median ' + r0[12].toFixed(1) + ' dB, ' + r0.filter(x => x < -3).length + '/24 < -3 dB'); }
