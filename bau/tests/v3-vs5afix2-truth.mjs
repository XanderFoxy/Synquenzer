// VS5a-fix2: marks vs. the generator's true event starts and the QA onset (10 % of peak) on a recorded beatbox take
import fs from 'fs';
import {onsets20, QOUT} from './v3-qa-vs5a-h2.mjs';
const MOD = process.argv[3] || '../vs-dsp/marks.mjs';
const M = await import(MOD);
const D = JSON.parse(fs.readFileSync(process.argv[2] || QOUT + '/fix-a-dump.json')), sr = D.sr, raw = Float32Array.from(D.raw);
const OFF = [12, -18, 30, -8, 45, -40, 60, 0, 22, -26, 15, -5, 35, -12, 8, -30], PAT = 'btktbbktbtktbkkt';
const ev = []; for (let rep = 0; rep < 5; rep++) OFF.forEach((o, k) => ev.push({t: 0.25 + rep * 4 + k * 0.25 + o / 1000, s: PAT[k]}));
const on = onsets20(raw, sr);
const cand = []; for (const t of on) for (const e of ev) cand.push(t - e.t);
let best = 0, bc = -1; for (const c of cand) { const n = on.filter(t => ev.some(e => Math.abs(t - e.t - c) < 0.0015)).length; if (n > bc) { bc = n; best = c; } }
const mk = M.detectMarks(raw, sr); let worst = 0, worstQ = 0;
for (const e of ev) { const tt = e.t + best; if (tt < 0.02 || tt > raw.length / sr - 0.05) continue;
  const m = mk.reduce((b, x) => Math.abs(x.t - tt) < Math.abs(b.t - tt) ? x : b, mk[0]), o = on.reduce((b, x) => Math.abs(x - tt) < Math.abs(b - tt) ? x : b, on[0]);
  const dm = (m.t - tt) * 1000, dq = (o - m.t) * 1000; if (Math.abs(dq) < 30) worstQ = Math.max(worstQ, Math.abs(dq)); worst = Math.max(worst, Math.abs(dm));
  console.log(e.s, 'true', tt.toFixed(4), 'mark−true', dm.toFixed(2), 'QAonset−mark', Math.abs(dq) < 30 ? dq.toFixed(2) : '(none)'); }
console.log('worst |mark−true|', worst.toFixed(2), 'ms; worst |QA onset − mark|', worstQ.toFixed(2), 'ms; marks', mk.length);
