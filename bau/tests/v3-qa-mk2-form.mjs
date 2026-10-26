// QA MK2-12 Form: level 0 of mkTables (35, 61-64: the 220.27 Hz set), partials <= 32 r (and <= K), vs the full trace (<= 64 r, peak 1), LS gain
import fs from 'fs';
import {mktab} from './v3-mk2-node.mjs';
const FILE = new URL('../mk-wt/index.html', import.meta.url).pathname, TR = new URL('../dwgs-trace/', import.meta.url).pathname;
const M = mktab(FILE), FULL = JSON.parse(fs.readFileSync(TR + 'dwgs-64.json', 'utf8')), PR = fs.readFileSync(TR + 'PRUEFUNG.md', 'utf8');
const lim = {}; for (const l of PR.split('\n')) { const m = l.match(/^\| (\d+) \| [^|]+\| [^|]+\| [^|]+\| ([\d.]+) \| ([^|]+)\|/); if (m) lim[+m[1]] = [+m[2], parseFloat(m[3].replace('LS-Rest', '')) ]; }
const N = 2048, synth = (A, P) => { const x = new Float64Array(N); for (const k in A) { const a = A[k], p = P[k]; for (let i = 0; i < N; i++) x[i] += a * Math.sin(2 * Math.PI * k * i / N + p); } return x; };
const out = []; let bad = [];
for (let n = 1; n <= 64; n++) {
  const oct = n === 35 || n >= 61, t = M.mkTables(oct ? {n, f: 220.27} : {n})[0], r = M.r(n), K = M.data()[n].K;
  // DFT of the table period: sin coefficients a sin(k th + p): x = sum (b_k sin + c_k cos) -> a = hypot, p = atan2(c, b)
  const A = {}, P = {}; for (let k = 1; k <= 64 * r + 1e-9; k++) { let s = 0, c = 0; for (let i = 0; i < N; i++) { const th = 2 * Math.PI * k * i / N; s += t[i] * Math.sin(th); c += t[i] * Math.cos(th); } A[k] = 2 * Math.hypot(s, c) / N; P[k] = Math.atan2(c, s); }
  const lim32 = Math.round(32 * r), sel = kk => { const a = {}, p = {}; for (let k = 1; k <= kk; k++) { a[k] = A[k]; p[k] = P[k]; } return [a, p]; };
  const ref = (() => { const a = {}, p = {}; for (const h of FULL[n - 1].harm) { a[h.k] = h.amp; p[h.k] = h.phase; } const x = synth(a, p); const pk = Math.max(...x.map(Math.abs)); return x.map(v => v / pk); })();
  const dist = x => { let xy = 0, xx = 0; for (let i = 0; i < N; i++) { xy += x[i] * ref[i]; xx += x[i] * x[i]; } const g = xy / xx; let e = 0; for (let i = 0; i < N; i++) e += (g * x[i] - ref[i]) ** 2; return 100 * Math.sqrt(e / N); };
  const d32 = dist(synth(...sel(lim32))), dK = dist(synth(...sel(K)));
  const [r32, rg] = lim[n] || [NaN, NaN]; const special = [20, 21, 28, 32, 56, 59, 64].includes(n);
  const okA = d32 <= r32 + .1, okB = !special || dK <= rg + .1;
  out.push(n + ':' + d32.toFixed(2) + '/' + r32 + (special ? ' K:' + dK.toFixed(2) + '/' + rg : ''));
  if (!okA || !okB) bad.push(n + ' (32r ' + d32.toFixed(2) + ' vs ' + r32 + '+0.1' + (special ? '; all K ' + dK.toFixed(2) + ' vs ' + rg + '+0.1' : '') + ')');
}
console.log(out.join('  '));
console.log('MK2-12 form fails:', bad.join(', ') || 'none');
