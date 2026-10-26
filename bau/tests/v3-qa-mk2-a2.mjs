// QA MK2-03 / MK2-04 / C7 folding (full path) / MK2-05 precise peak, in Chromium via mkRender and the app's MKTAB
import {launch, openApp, R, mtof, OPEN, mergeO, SR} from './v3-qa-mk2-lib.mjs';
import {db, pdb, amp, folded, centroid, spectrum, peaks, rms, fft} from './v3-mk1-ana.mjs';
const FILE = process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname;
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null; const T = async (id, f) => { if (!ONLY || ONLY.test(id)) await f(); };
const b = await launch(); const {page, errs} = await openApp(b, FILE);
const M = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const out = (...a) => console.log(...a);
await page.evaluate(() => { window.__M = mkLoad().MKTAB; });
// ---------- MK2-03 tables: peak, DC, distinct, roll-off by my own formula from the decoded data ----------
await T('tab', async () => {
  const r = await page.evaluate(() => {
    const M = __M, D = M.data(), GS = {1: -12, 8: -9, 15: -9, 24: -9, 27: -6, 35: -8, 36: -12, 40: -12, 47: -9, 49: -9, 52: -9, 57: -9, 61: -12};
    const sOf = n => { let s = -12; for (const k of Object.keys(GS).map(Number).sort((a, b) => a - b)) if (n >= k) s = GS[k]; return s; };
    const res = [];
    for (let n = 1; n <= 64; n++) {
      const oct = n === 35 || n >= 61, T0 = M.mkTables(oct ? {n, f: 220.27} : {n})[0], N = T0.length - 1;
      let pk = 0, dc = 0; for (let i = 0; i < N; i++) { pk = Math.max(pk, Math.abs(T0[i])); dc += T0[i]; } dc /= N;
      // DFT of level 0 (N = 2048): partial amplitudes k = 1..1023
      const A = new Float64Array(1024); for (let k = 1; k < 1024; k++) { let a = 0, c = 0; for (let i = 0; i < N; i++) { const p = 2 * Math.PI * k * i / N; a += T0[i] * Math.cos(p); c += T0[i] * Math.sin(p); } A[k] = 2 * Math.hypot(a, c) / N; }
      const w = D[n]; let ab = 0, cnt = 0; for (let k = Math.round(16 * w.r) + 1; k <= Math.round(32 * w.r); k++) { ab += w.a[k] ** 2; cnt++; } ab = Math.sqrt(ab / cnt);
      // strongest traced partial in the table (scale table vs data)
      let km = 1; for (let k = 1; k <= w.K; k++) if (w.a[k] > w.a[km]) km = k;
      res.push({n, r: w.r, K: w.K, pk, dc, A: Array.from(A.slice(0, 520)), ab, s: sOf(n), km, a: Array.from(w.a)});
    }
    return res;
  });
  const bad = r.filter(x => Math.abs(x.pk - 1) > 1e-3 || Math.abs(x.dc) > 1e-4).map(x => x.n + ':' + M(x.pk, 4) + '/' + x.dc.toExponential(1));
  out('MK2-03 peak/DC bad:', bad.join(' ') || 'none');
  // distinct over partials 1..16 (dB re strongest of 1..16, floor -60)
  const L = r.map(x => x.A.slice(1, 17).map(a => Math.max(-60, db(a))));
  let mn = 99, pr; for (let i = 0; i < 64; i++) for (let j = i + 1; j < 64; j++) { const mi = Math.max(...L[i]), mj = Math.max(...L[j]); let e = 0; for (let k = 0; k < 16; k++) e += ((L[i][k] - mi) - (L[j][k] - mj)) ** 2; const d = Math.sqrt(e / 16); if (d < mn) { mn = d; pr = [i + 1, j + 1]; } }
  out('MK2-03 min RMS distance 1..16:', M(mn), 'dB', pr);
  // roll-off: octave bands above K (single waves), my formula, gain from the strongest traced partial
  let worst = 0, wn = 0; const silent = [];
  for (const x of r) {
    if (x.n === 35 || x.n >= 61) continue;
    const g = x.A[x.km] / x.a[x.km]; const roll = x.ab >= 10 ** (-50 / 20);
    for (let lo = x.K; lo < 512; lo *= 2) {
      let e = 0, f = 0; for (let k = lo + 1; k <= Math.min(512, 2 * lo); k++) { e += x.A[k] ** 2; f += (roll ? x.ab * Math.pow(k / (22.6 * x.r), x.s / 6.02) * g : 0) ** 2; }
      if (!roll) { if (pdb(e) > -100) silent.push(x.n + ':' + M(pdb(e), 0)); break; }
      const d = Math.abs(pdb(e / f)); if (d > worst) { worst = d; wn = x.n; }
    }
  }
  out('MK2-03 roll-off worst', M(worst, 3), 'dB at', wn, 'silent-with-energy', silent.join(' ') || 'none');
  // 35: only octave partials
  const x35 = r[34]; let eo = 0, en = 0; for (let k = 1; k < 520; k++) { if ((k & (k - 1)) === 0) eo += x35.A[k] ** 2; else en += x35.A[k] ** 2; } out('MK2-03 35 non-octave energy', M(pdb(en / eo), 1), 'dB');
  // the K per wave and r
  out('K/r list', r.map(x => x.n + ':' + x.K + (x.r !== 1 ? '/r' + M(x.r, 3) : '')).join(' '));
});
// ---------- C7 folded energy: full path INIT AM (only wave set) and at the oscillator ----------
await T('c7', async () => {
  const fullBad = [], oscBad = []; let fw = -99, fwn = 0;
  for (let n = 1; n <= 64; n++) {
    const rr = await page.evaluate(n => __M.r(n), n);
    const x = await R(page, {o1: {w: 5, c2: 2 * n - 2}}, [[0, 'on', 96, .8]], {sec: 1});   // INIT AM otherwise (LPF 24 cut 127)
    const f = folded(x.l, 9600, mtof(96) / rr, SR); if (f > fw) { fw = f; fwn = n; } if (f > -50) fullBad.push(n + ':' + M(f, 1));
    const y = await R(page, {o1: {w: 5, c2: 2 * n - 2}}, [[0, 'on', 96, .8]], {sec: 1, tap: 'mix'});
    const g = folded(y.l, 9600, mtof(96) / rr, SR); if (g > -50) oscBad.push(n + ':' + M(g, 1));
  }
  out('C7 folded > -50 dB, INIT AM full path:', fullBad.join(' ') || 'none', '| worst', M(fw, 1), fwn, '| at oscillator:', oscBad.join(' ') || 'none');
  // also saw at C7 full path for reference
  const s = await R(page, {o1: {w: 0}}, [[0, 'on', 96, .8]], {sec: 1}); out('saw C7 full path', M(folded(s.l, 9600, mtof(96), SR), 1));
  // other notes for 27 (C6, B6) full path
  for (const nt of [84, 90, 95, 100]) { const x = await R(page, {o1: {w: 5, c2: 52}}, [[0, 'on', nt, .8]], {sec: 1}); out('wave 27 full path note', nt, M(folded(x.l, 9600, mtof(nt), SR), 1)); }
});
// ---------- MK2-04 Endlos ----------
await T('end', async () => {
  const lv = async note => { const r = await R(page, mergeO({o1: {w: 5, c2: 68}}, OPEN), [[0, 'on', note, .8]], {sec: 1.3}); return f => db(amp(r.l, 14400, 32768, f, SR)); };
  let worst = 0, cnt = 0;
  for (const [a, c] of [[48, 60], [54, 66], [36, 48], [60, 72]]) {
    const A = await lv(a), B = await lv(c), f0 = mtof(c) / 2;
    let w = 0; for (let f = f0; f < 10000; f *= 2) { if (f < 60) continue; const x = A(f), y = B(f); if (Math.max(x, y) < -60) continue; w = Math.max(w, Math.abs(x - y)); cnt++; }
    out('MK2-04 pair', a, c, 'max', M(w), 'dB'); worst = Math.max(worst, w);
  }
  const ev = []; for (let k = 0; k <= 24; k++) { ev.push([k * .4, 'on', 48 + k, .8]); ev.push([k * .4 + .35, 'off', 48 + k]); }
  const r = await R(page, mergeO({o1: {w: 5, c2: 68}}, OPEN), ev, {sec: 10.2});
  const L = []; for (let k = 0; k <= 24; k++) L.push(db(rms(r.l, Math.round((k * .4 + .02) * SR), Math.round((k * .4 + .32) * SR))));
  let j = 0; for (let k = 1; k < L.length; k++) j = Math.max(j, Math.abs(L[k] - L[k - 1]));
  out('MK2-04 chromatic 2 oct max level jump', M(j), 'dB', L.map(x => M(x, 1)).join(' '));
});
// ---------- MK2-05 precise peak (avg power spectrum over 6 seeds, 4 s) ----------
await T('noise', async () => {
  for (const [note, c1] of [[48, 24], [72, 24], [48, 36], [72, 36]]) {
    const n = 65536, P = new Float64Array(n / 2);
    for (const seed of [1, 2, 3, 4, 5, 6]) { const r = await R(page, mergeO({o1: {w: 6, c1, c2: 127}}, OPEN), [[0, 'on', note, .8]], {sec: 3.2, seed}); const p = spectrum(r.l, 19200, n, 'hann'); for (let k = 0; k < n / 2; k++) P[k] += p[k]; }
    let km = 2; for (let k = 2; k < n / 2 - 1; k++) if (P[k] > P[km]) km = k;
    const a = Math.log(P[km - 1]), bb = Math.log(P[km]), c = Math.log(P[km + 1]), d = .5 * (a - c) / (a - 2 * bb + c), f = (km + d) * SR / n, want = mtof(note) * 2 ** ((c1 - 24) / 12);
    out('MK2-05 precise peak note', note, 'C1', c1, M(f, 2), 'Hz want', M(want, 2), 'ct', M(1200 * Math.log2(f / want), 1));
  }
});
out('errors', errs.length, errs.slice(0, 3).join(' | '));
await b.close();
