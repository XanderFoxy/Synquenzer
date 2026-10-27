import * as N from '../vs-dsp/marks.mjs';
import {beatbox, onsets20} from './v3-qa-vs5a-h2.mjs';
const sr = 48000, OFF = [12, -18, 30, -8, 45, -40, 60, 0, 22, -26, 15, -5, 35, -12, 8, -30], PAT = 'btktbbktbtktbkkt';
const ev = []; for (let rep = 0; rep < 5; rep++) OFF.forEach((o, k) => ev.push({t: 0.25 + rep * 4 + k * 0.25 + o / 1000, s: PAT[k]}));
const x = beatbox(ev, 20.5, sr), on = onsets20(x, sr), mk = N.detectMarks(x, sr);
on.forEach(t => { let b = null; for (const m of mk) if (!b || Math.abs(m.t - t) < Math.abs(b.t - t)) b = m; const d = (t - b.t) * 1000; const e = ev.reduce((a, q) => Math.abs(q.t - t) < Math.abs(a.t - t) ? q : a); if (Math.abs(d) > 2) console.log(e.s, 'true', e.t.toFixed(4), 'onset10%', t.toFixed(4), 'mark', b.t.toFixed(4), b.src, 'd', d.toFixed(2)); });
