// offline click scan: per raw tap, 1-ms HP-energy jumps (> 12 dB over the ±20 ms median, level > LV dB) away from own on/offs
import fs from 'fs';
const TAG = process.argv[2] || 'long', LV = +(process.argv[3] || -55);
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk5/';
const M = JSON.parse(fs.readFileSync(D + TAG + '-meta.json'));
const sr = M.sr, t0 = M.f0 / sr; const acts = M.acts;
const byT = t => { const a = acts.filter(a => t >= a.t - .05).pop(); return a ? a.n.slice(0, 50) + ' +' + (t - a.t).toFixed(2) : '-'; };
for (const [j, tr] of [[1, 0], [2, 2], [3, 3]]) {
  const b = fs.readFileSync(D + TAG + '-tap' + j + '.f32'); const x = new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4);
  const notes = M.notes.filter(n => n[1] === tr);
  const ons = notes.map(n => n[0]).sort((a, c) => a - c), offs = notes.filter(n => n[4] != null).map(n => n[0] + n[4]).sort((a, c) => a - c);
  const lastLE = (arr, t) => { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= t) { r = m; lo = m + 1; } else hi = m - 1; } return r; };
  const near = t => { const i = lastLE(ons, t + .002); if (i >= 0 && t - ons[i] <= .03) return true; const k = lastLE(offs, t + .006); if (k >= 0 && t - offs[k] <= .045) return true; if (k + 1 < offs.length && offs[k + 1] - t <= .006) return true; return false; };
  // HP 2nd order x2 at 4 kHz
  const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
  const h = hp(hp(x, 4000, .5412), 4000, 1.3066);
  const W = Math.round(sr * .001), e = []; for (let i = 0; i + W <= x.length; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(s / W + 1e-20); }
  const fl = [];
  for (let k = 20; k < e.length - 20; k++) { const t = t0 + k * W / sr; const lv = 10 * Math.log10(e[k]); if (lv < LV) continue; const nb = e.slice(k - 20, k + 21).filter((_, q) => q !== 20).sort((a, c) => a - c), med = nb[20]; const db = 10 * Math.log10(e[k] / med); if (db > 12 && !near(t)) fl.push({t: +t.toFixed(3), db: +db.toFixed(1), lv: +lv.toFixed(1)}); }
  // merge flags within 5 ms
  const ev = []; for (const f of fl) { const l = ev[ev.length - 1]; if (l && f.t - l.t1 < .006) { l.t1 = f.t; l.db = Math.max(l.db, f.db); l.lv = Math.max(l.lv, f.lv); } else ev.push({t: f.t, t1: f.t, db: f.db, lv: f.lv}); }
  const g = {}; for (const f of ev) { const k = byT(f.t).replace(/ \+[\d.]+$/, ''); (g[k] = g[k] || []).push([f.t, f.db, f.lv, byT(f.t).match(/\+([-\d.]+)$/)?.[1]]); }
  console.log('t' + tr, 'events', ev.length, 'notes', notes.length);
  for (const k in g) console.log('   ', k.padEnd(52), g[k].length, JSON.stringify(g[k].slice(0, 5)));
}
