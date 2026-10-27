// VS5a-fix: mark position vs real onset (10 % of peak) for clicks and beatbox sounds, new vs old core
import * as N from '../vs-dsp/marks.mjs';
import {beatbox, onsets20} from './v3-qa-vs5a-h2.mjs';
import {clicks} from './v3-vs5a-h.mjs';
const O = await import('../vs5a-fix-bak/marks-orig.mjs');
const sr = 48000, OFF = [12, -18, 30, -8, 45, -40, 60, 0, 22, -26, 15, -5, 35, -12, 8, -30], PAT = 'btktbbktbtktbkkt';
const ev = []; for (let rep = 0; rep < 5; rep++) OFF.forEach((o, k) => ev.push({t: 0.25 + rep * 4 + k * 0.25 + o / 1000, s: PAT[k]}));
const sigs = {beatbox: beatbox(ev, 20.5, sr), clicks: clicks(OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), 4.6)};
for (const [nm, x] of Object.entries(sigs)) {
  const on = onsets20(x, sr);
  for (const [lab, M] of [['old', O], ['new', N]]) {
    const mk = M.detectMarks(x, sr); const d = on.map(t => { let b = null; for (const m of mk) if (!b || Math.abs(m.t - t) < Math.abs(b.t - t)) b = m; return (t - b.t) * 1000; });
    const s = d.slice().sort((a, b) => a - b);
    console.log(nm, lab, 'marks', mk.length, 'onsets', on.length, 'onset−mark ms: min', s[0].toFixed(2), 'median', s[s.length >> 1].toFixed(2), 'max', s[s.length - 1].toFixed(2), '|>2ms|', d.filter(v => Math.abs(v) > 2).length);
  }
}
