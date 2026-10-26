// QA MK2-01 / MK2-02 / MK2-05 in Chromium via mkRender (independent of the builder's scripts)
import {launch, openApp, R, mtof, OPEN, mergeO, SR} from './v3-qa-mk2-lib.mjs';
import {db, pdb, amp, folded, centroid, spectrum, peaks, rms} from './v3-mk1-ana.mjs';
const FILE = process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname;
const b = await launch(); const {page, errs} = await openApp(b, FILE);
const M = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const out = (...a) => console.log(...a);
// ---------- MK2-01 ----------
{
  const f1 = mtof(57), i0 = 9600, n = 32768;
  let r = await R(page, mergeO({o1: {w: 3, c1: 0}, mix: {o1: 127, o2: 0}}, OPEN), [[0, 'on', 57, .8]], {sec: 1.2});
  const a1 = amp(r.l, i0, n, f1, SR); let e = 0; for (let k = 2; k <= 12; k++) e += amp(r.l, i0, n, k * f1, SR) ** 2;
  out('MK2-01 X-MOD 0 THD (full path, filter open)', M(db(Math.sqrt(e) / a1)), 'dB');
  const p64 = mergeO({o1: {w: 3, c1: 64}, o2: {w: 2, semi: 12}, mix: {o1: 127, o2: 0}}, OPEN), p0 = mergeO(p64, {o1: {w: 3, c1: 0}});
  const r64 = await R(page, p64, [[0, 'on', 57, .8]], {sec: 1.2}), r0 = await R(page, p0, [[0, 'on', 57, .8]], {sec: 1.2});
  const car = amp(r64.l, i0, n, f1, SR);
  out('MK2-01 X-MOD 64 tri+12: sideband 3f1 rel carrier', M(db(amp(r64.l, i0, n, 3 * f1, SR) / car)), 'dB; 5f1', M(db(amp(r64.l, i0, n, 5 * f1, SR) / car)));
  const c64 = centroid(r64.l, 9600, 2048, SR), c0 = centroid(r0.l, 9600, 2048, SR);
  out('MK2-01 M-SP', M(c0, 0), '->', M(c64, 0), 'oct', M(Math.log2(c64 / c0)));
  // X-LFO 127 with C1 0: LFO1 triangle, f such that one period ~ 0.8 s
  const rl = await R(page, mergeO(p64, {o1: {w: 3, c1: 0, c2: 127}, l1: {w: 2, f: 50}}), [[0, 'on', 57, .8]], {sec: 2.4});
  const L = []; for (let s = 4800; s + 4096 < rl.l.length; s += 1200) L.push(db(amp(rl.l, s, 4096, 3 * f1, SR) / amp(rl.l, s, 4096, f1, SR)));
  out('MK2-01 X-LFO 127: sideband swing', M(Math.max(...L) - Math.min(...L)), 'dB');
  // H-3 X-MOD with INIT OSC 2 (saw, semi 0) and with tri +12: M-SP at 0, 1/4, 1/2, 3/4, 1
  for (const o2 of [{w: 0, semi: 0}, {w: 1, semi: 0}, {w: 2, semi: 12}, {w: 0, semi: 7}]) {
    const cs = [];
    for (const c1 of [0, 32, 64, 95, 127]) { const x = await R(page, mergeO({o1: {w: 3, c1}, o2, mix: {o1: 127, o2: 0}}, OPEN), [[0, 'on', 48, .8]], {sec: .5}); cs.push(centroid(x.l, 0, 2048 * 4, SR)); }
    out('H-3 X-MOD M-SP (C3) OSC2', JSON.stringify(o2), cs.map(x => M(x, 0)).join(' '), 'oct steps', cs.slice(1).map((x, i) => M(Math.log2(x / cs[i]))).join(' '));
  }
}
// ---------- MK2-02 ----------
{
  const bands = []; for (let i = 0; i <= 10; i++) bands.push(400 * 2 ** (i / 3));
  async function env(note, c1) {
    const f0 = mtof(note), r = await R(page, mergeO({o1: {w: 4, c1}}, OPEN), [[0, 'on', note, .8]], {sec: 1.6});
    const H = []; for (let k = 1; k * f0 < 12000; k++) H.push([k * f0, amp(r.l, 24000, 32768, k * f0, SR) ** 2 / 2]);
    const tot = H.reduce((s, x) => s + x[1], 0);
    // envelope = power per Hz (P_k / f0), interpolated in dB over log f
    const e = bands.map(fb => { let i = H.findIndex(([f]) => f >= fb); if (i <= 0) i = 1; const [fl, pl] = H[i - 1], [fh, ph] = H[i]; const dl = pdb(pl / f0), dh = pdb(ph / f0); return dl + (dh - dl) * Math.log(fb / fl) / Math.log(fh / fl); });
    const eb = pdb(e.reduce((s, x) => s + 10 ** (x / 10), 0) / e.length);
    return {lit: e.map(x => x - pdb(tot)), own: e.map(x => x - eb), rms: db(rms(r.l, 24000, 72000))};
  }
  for (const c1 of [0, 64, 127]) {
    const a = await env(36, c1), c = await env(60, c1);
    out('MK2-02 FORM', c1, 'max |C2-C4| normalised to total power', M(Math.max(...a.lit.map((x, i) => Math.abs(x - c.lit[i])))), 'dB; to band level', M(Math.max(...a.own.map((x, i) => Math.abs(x - c.own[i])))), 'dB; rms C2/C4', M(a.rms), M(c.rms));
  }
  for (const note of [36, 48, 60, 72, 84, 96]) {
    const cs = [];
    for (const c1 of [0, 32, 64, 95, 127]) { const x = await R(page, mergeO({o1: {w: 4, c1}}, OPEN), [[0, 'on', note, .8]], {sec: .5}); cs.push(centroid(x.l, 0, 2048 * 4, SR)); }
    out('MK2-02 FORM 0..127 M-SP at note', note, cs.map(x => M(x, 0)).join(' '), 'total', M(Math.log2(cs[0] / cs[4])), 'oct');
  }
  const fe = []; for (const c1 of [0, 64, 127]) { const x = await R(page, mergeO({o1: {w: 4, c1}}, OPEN), [[0, 'on', 96, .8]], {sec: 1.2}); fe.push(folded(x.l, 9600, mtof(96), SR)); }
  out('MK2-02 C7 folded', fe.map(x => M(x, 1)).join(' / '));
  // WFM (STEUER 2) with LFO1: does the spectrum move at C3 and C6?
  for (const note of [48, 84]) { const x = await R(page, mergeO({o1: {w: 4, c1: 0, c2: 127}, l1: {w: 2, f: 60}}, OPEN), [[0, 'on', note, .8]], {sec: 2});
    const cs = []; for (let s = 0; s + 4096 < x.l.length; s += 2400) cs.push(centroid(x.l, s, 4096, SR)); out('MK2-02 WFM 127 M-SP range at note', note, M(Math.log2(Math.max(...cs) / Math.min(...cs))), 'oct'); }
}
// ---------- MK2-05 ----------
{
  for (const [note, c1] of [[48, 24], [72, 24], [48, 36], [72, 36], [60, 24], [36, 24], [84, 24]]) {
    const r = await R(page, mergeO({o1: {w: 6, c1, c2: 127}}, OPEN), [[0, 'on', note, .8]], {sec: 2});
    const pk = peaks(r.l, 24000, SR, 32768, 1)[0], want = mtof(note) * 2 ** ((c1 - 24) / 12);
    out('MK2-05 RESO 127 note', note, 'C1', c1, 'peak', M(pk.f, 1), 'want', M(want, 1), 'ct', M(1200 * Math.log2(pk.f / want), 1));
  }
  // RESO 0: slope above cutoff, average over 4 renders (different seeds)
  for (const note of [48, 60]) {
    const P = new Float64Array(16384); let cnt = 0;
    for (const seed of [1, 2, 3, 4]) { const r = await R(page, mergeO({o1: {w: 6, c1: 24, c2: 0}}, OPEN), [[0, 'on', note, .8]], {sec: 3, seed});
      for (let s = 9600; s + 32768 <= r.l.length; s += 16384) { const p = spectrum(r.l, s, 32768, 'hann'); for (let k = 0; k < 16384; k++) P[k] += p[k]; cnt++; } }
    const fc = mtof(note), bin = SR / 32768, band = (f) => { let e = 0, c = 0; for (let k = Math.round(f / 1.06 / bin); k <= Math.round(f * 1.06 / bin); k++) { e += P[k]; c++; } return pdb(e / c); };
    const lv = [.25, .5, 1, 2, 4, 8, 16].map(m => band(fc * m));
    out('MK2-05 RESO 0 note', note, 'levels at fc*[.25 .5 1 2 4 8 16]', lv.map(x => M(x, 1)).join(' '), 'slope 4->8', M(lv[4] - lv[5], 1), '8->16', M(lv[5] - lv[6], 1), 'peak?', M(lv[2] - lv[1], 1));
  }
}
out('errors', errs.length, errs.slice(0, 3).join(' | '));
await b.close();
