// VS5a-fix: analyse the dump of v3-vs5afix-adump.mjs against the generator's true event starts
import fs from 'fs';
import {onsets20, QOUT} from './v3-qa-vs5a-h2.mjs';
const D = JSON.parse(fs.readFileSync(QOUT + '/fix-a-dump.json')), sr = D.sr, raw = Float32Array.from(D.raw), y = Float32Array.from(D.y), y5 = Float32Array.from(D.y5);
const OFF = [12, -18, 30, -8, 45, -40, 60, 0, 22, -26, 15, -5, 35, -12, 8, -30], PAT = 'btktbbktbtktbkkt';
const ev = []; for (let rep = 0; rep < 5; rep++) OFF.forEach((o, k) => ev.push({t: 0.25 + rep * 4 + k * 0.25 + o / 1000, s: PAT[k]}));
const on = onsets20(raw, sr);
// offset WAV → take: median of (onset − nearest event) over events
const cand = []; for (const t of on) for (const e of ev) cand.push(t - e.t);
let best = 0, bc = -1; for (const c of cand) { const n = on.filter(t => ev.some(e => Math.abs(t - e.t - c) < 0.0015)).length; if (n > bc) { bc = n; best = c; } }
const dd = []; for (const t of on) { const e = ev.reduce((a, q) => Math.abs(q.t + best - t) < Math.abs(a.t + best - t) ? q : a); dd.push(t - e.t); } dd.sort((a, b) => a - b); const off = dd[dd.length >> 1];
console.log('offset WAV→take', off.toFixed(5));
const W = D.W, t0 = W.t0, step = 0.125, gq = t => t0 + Math.round((t - t0) / step) * step, src = W.map.src, dst = W.map.dst;
const shift = (map, t) => { let b = 1; for (let k = 1; k < map.src.length - 1; k++) if (Math.abs(map.src[k] - t) < Math.abs(map.src[b] - t)) b = k; return map.dst[b] - map.src[b]; };
for (const e of ev) {
  const tt = e.t + off; if (tt < D.cin - 0.01 || tt > raw.length / sr - 0.12) continue;
  let m = null; for (const k of D.det) if (!m || Math.abs(k.t - tt) < Math.abs(m.t - tt)) m = k;
  const o10 = on.reduce((a, q) => Math.abs(q - tt) < Math.abs(a - tt) ? q : a);
  const sh = shift(W.map, m.t), r = tt + sh, inside = Math.abs(m.t - gq(m.t)) <= 0.4 * step;
  const sh5 = shift(D.W5.map, m.t), r5 = tt + sh5, want5 = tt + (gq(m.t) - m.t) / 2;
  console.log(e.s, 'true', tt.toFixed(4), 'mark−true', ((m.t - tt) * 1000).toFixed(2), 'o10−true', ((o10 - tt) * 1000).toFixed(2), inside ? 'IN ' : 'out', 'true@100%−grid', ((r - gq(r)) * 1000).toFixed(2), '| 50%: true−want', ((r5 - want5) * 1000).toFixed(2));
}
const o5 = onsets20(y5, sr); console.log('50% render onsets', o5.length, 'raw', on.length);
{ const o5s = o5.map(t => +t.toFixed(4)); console.log('50% onsets', o5s.join(' '));
  const on100 = onsets20(y, sr); console.log('100% onsets', on100.map(t => +t.toFixed(4)).join(' '));
  for (const q of D.pairs) { const inC = Math.abs(q.mk - gq(q.mk)) <= 0.4 * step + 1e-9; if (!inC) continue; const want = q.on + (gq(q.mk) - q.mk) / 2; let b = 1e9; for (const t of o5) b = Math.min(b, Math.abs(t - want)); if (b > 0.002) console.log('missing near', want.toFixed(4), 'nearest', (b * 1000).toFixed(1), 'ms; pair', q.on.toFixed(4), q.mk.toFixed(4)); } }
{ let ok = 0, n = 0; const bad = [];
  for (const e of ev) { const tt = e.t + off; if (tt < D.cin - 0.01 || tt > raw.length / sr - 0.12) continue;
    let m = null; for (const k of D.det) if (!m || Math.abs(k.t - tt) < Math.abs(m.t - tt)) m = k;
    let kb = 1; for (let k = 1; k < W.map.src.length - 1; k++) if (Math.abs(W.map.src[k] - m.t) < Math.abs(W.map.src[kb] - m.t)) kb = k; const O = Math.round(tt * sr), Dd = O + Math.round(W.map.dst[kb] * sr) - Math.round(W.map.src[kb] * sr); let same = true, first = -1;
    for (let j = 0; j < Math.round(0.02 * sr); j++) if (y[Dd + j] !== raw[O + j]) { same = false; first = j; break; }
    n++; if (same) ok++; else bad.push(e.s + '@' + tt.toFixed(4) + ' first diff +' + (first / sr * 1000).toFixed(2) + 'ms'); }
  console.log('attacks bit-identical from the TRUE start (20 ms):', ok + '/' + n, bad.join('; ')); }
