// VS5a-fix: node replica of QA A (beatbox, 1/16 at 100 % and 50 %) with the core, onsets measured like the QA script
import * as N from '../vs-dsp/marks.mjs';
import {beatbox, onsets20} from './v3-qa-vs5a-h2.mjs';
const sr = +(process.argv[2] || 44100), OFF = [12, -18, 30, -8, 45, -40, 60, 0, 22, -26, 15, -5, 35, -12, 8, -30], PAT = 'btktbbktbtktbkkt';
const ev = []; OFF.forEach((o, k) => ev.push({t: 0.25 + k * 0.25 + o / 1000, s: PAT[k]}));
const x = beatbox(ev, 4.5, sr), on = onsets20(x, sr), mk = N.detectMarks(x, sr), ts = mk.map(m => m.t);
const t0 = 0.25, step = 0.125, gq = t => t0 + Math.round((t - t0) / step) * step;
for (const st of [1, 0.5]) {
  const q = N.quantizeMarks(ts, {bpm: 120, t0, grid: '1/16', strength: st}), y = N.renderSlices(x, sr, ts, q.times), o2 = onsets20(y, sr);
  const rows = on.map(t => { let b = 0; mk.forEach((m, k) => { if (Math.abs(m.t - t) < Math.abs(mk[b].t - t)) b = k; }); const want = t + (q.times[b] - ts[b]); let nb = 1e9; for (const u of o2) if (Math.abs(u - want) < Math.abs(nb - want)) nb = u; return [ev.find(e => Math.abs(e.t - t) < 0.01)?.s, +t.toFixed(4), +((t - ts[b]) * 1000).toFixed(2), +((nb - want) * 1000).toFixed(2), +((nb - gq(nb)) * 1000).toFixed(2)]; });
  console.log('strength', st, 'onsets in', on.length, 'out', o2.length); console.log(rows.map(r => r.join(' ')).join('\n'));
}
