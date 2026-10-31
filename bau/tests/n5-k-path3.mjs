import {render as mkr, mkPatch} from './v3-mk1-node.mjs';
const notes = [[0, 'on', 48, .9], [.3, 'on', 55, .7], [1.2, 'off', 48], [1.4, 'off', 55]];
const k = process.argv[2] || 't.0.f.cut', fin = {[k]: +(process.argv[3] || 70)};
const pm = mkPatch({});
const A = mkr(pm, notes, {file: process.env.K_FILE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-K/index.html', sec: 3.9, at: [[.5, {mkSet: {[k]: fin[k] * .5 + .37}}], [1.0, {mkSet: {[k]: fin[k] * 1.3 + .2}}], [1.7, {mkSet: fin}]]});
const B = mkr(pm, notes, {file: process.env.K_FILE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-K/index.html', sec: 3.9, at: [[1.7, {mkSet: fin}]]});
const ta = A.P.mk.tm[0], tb = B.P.mk.tm[0];
const show = (x, y, path) => {
  if (x === y) return; if (typeof x === 'number' && typeof y === 'number') { if (x !== y && !(x !== x && y !== y)) console.log(path, x, y); return; }
  if (ArrayBuffer.isView(x)) { for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) { console.log(path + '[' + i + ']', x[i], y[i]); break; } return; }
  if (x && typeof x === 'object' && y && typeof y === 'object' && !Array.isArray(x)) { for (const q of Object.keys(x)) if (q !== 'h' && q !== 'par' && q !== 'T') show(x[q], y[q], path + '.' + q); return; }
  if (Array.isArray(x)) { for (let i = 0; i < x.length; i++) show(x[i], y[i], path + '[' + i + ']'); }
};
for (let i = 0; i < ta.V.length; i++) show(ta.V[i], tb.V[i], 'V' + i);
for (const q of Object.keys(ta)) if (!['V', 'h', 'par', 'T'].includes(q)) show(ta[q], tb[q], 'tm.' + q);
