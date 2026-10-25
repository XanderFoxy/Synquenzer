import {render, mkPatch} from './v3-mk1-node.mjs';
import {zcFreq} from './v3-mk1-ana.mjs';
const out = [];
for (const ft of [0, 1, 2, 3]) { const row = []; for (const cut of [0, 20, 40, 64, 90, 110, 120, 127]) {
  const r = render(mkPatch({mix: {o1: 0, o2: 0, n: 0}, f: {type: ft, cut, res: 127}, a: {gate: 1}}), [[0, 'on', 60, .8]], {sec: 6});
  let pk = 0, bad = 0; for (const x of r.l) { if (!Number.isFinite(x)) bad++; else pk = Math.max(pk, Math.abs(x)); }
  let e = 0; for (let i = 96000; i < r.l.length; i++) e += r.l[i] * r.l[i]; const rmsdb = 10 * Math.log10(e / (r.l.length - 96000) + 1e-30);
  row.push(`cut ${cut}: pk ${(20 * Math.log10(pk + 1e-30)).toFixed(1)} rms ${rmsdb.toFixed(1)} f ${zcFreq(r.l, 96000, r.l.length, 48000).toFixed(0)}${bad ? ' NaN' : ''}`); }
  out.push('type ' + ft + ' | ' + row.join(' | ')); }
console.log(out.join('\n'));
