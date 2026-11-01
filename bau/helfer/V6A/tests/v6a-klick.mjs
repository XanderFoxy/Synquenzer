// V6A ohne Knackser, Teil A (Sinus-Probe): eine Sinus-Fläche (440 Hz), Zustand an Szene 2 ändert Klang-Pegel (−12 dB), Spur-Lautstärke
// und Panorama (Cutoff prüft Teil B mit M-KLICK: der Leiter-Filter färbt einen Sinus bei tiefem Cutoff, das ist Klang, kein Knacks). Song S1 S2 S1 S2 S1 S2 (je 2 Takte), Kanten aus · kurz · 1 T · 2 T · frei 3. Szene 2 beginnt ihre Note erst
// 2 Schläge nach dem Taktstrich (davor klingt nur der Release des alten Tons): jede Fahrt liegt in einem Abschnitt ohne Notenanfang.
// Für einen Sinus gilt |x[n] − 2x[n−1] + x[n−2]| ≤ ω²·|x|max; ein Knacks (Sprung) liegt um Größenordnungen darüber.
// Gemessen wird k = max|d2| / (ω²·Spitze) je Fenster gegen die Ruhe-Abschnitte. Dazu: Spitzen und Sprünge (|x[n] − x[n−1]|).
import { open, setup, ok, done } from './v6a-lib.mjs';
const { b, p, errs } = await open();
const t = await setup(p, { scenes: 2, len: 2, notes: [{t: 0, d: 7.9, n: 69, v: .8}] });
const run = async (withState) => p.evaluate(async ([t, withState]) => {
  const Q = window.SYNQUENZER;
  for (const [k, v] of [['o1w', 3], ['o2lvl', 0], ['o3lvl', 0], ['subLvl', 0], ['noise', 0], ['analog', 0], ['spread', 0], ['o1uni', 1], ['cutoff', 18000], ['res', 0], ['aA', .005], ['aD', .1], ['aS', 1], ['aR', 1.5], ['fenv', 0], ['level', .5], ['kt', 0]]) Q.setParam(t, k, v);
  for (const [k, v] of [['fx.rev', 0], ['fx.dly', 0], ['fx.drive', 0], ['fx.vol', .8], ['fx.pan', 0]]) Q.setParam(t, k, v);
  Q.setClip(t, 1, {len: 2, notes: [{t: 2, d: 5.9, n: 69, v: .8}], key: {root: 0, scale: 'ionian'}});
  Q.v6aSetState(t, 1, withState ? {p: {level: .125}, fx: {vol: .4, pan: .6}} : null);
  Q.songFromChain([0, 1, 0, 1, 0, 1].map(s => ({scene: s, bars: 2})));
  const id = a => S.song.marks.find(m => m.a === a).id;
  Q.v6aMarkGlide(id(2), {x: 'jump'}); Q.v6aMarkGlide(id(4), {x: 'flow'}); Q.v6aMarkGlide(id(6), {x: 'bar1'}); Q.v6aMarkGlide(id(8), {x: 'bar2'}); Q.v6aMarkGlide(id(10), {x: 'free', n: 3});
  const rr = await Q.vvRender({range: {a: 0, b: 12}});
  const L = VV.last.ch[0], R_ = VV.last.ch[1], sr = VV.last.sr, spb_ = spb();
  // VV.last.ch starts at the heard song start (beat 0)
  const at = bb => Math.round(bb * spb_ * sr);
  const win = (b0, b1, ch) => { const x = ch, a = Math.max(2, at(b0)), e = Math.min(x.length, at(b1)); let pk = 0, d2 = 0, d1 = 0; for (let n = a; n < e; n++) { const v = Math.abs(x[n]); if (v > pk) pk = v; const q = Math.abs(x[n] - 2 * x[n - 1] + x[n - 2]); if (q > d2) d2 = q; const s1 = Math.abs(x[n] - x[n - 1]); if (s1 > d1) d1 = s1; } return {pk, d2, d1}; };
  const M = (a, c) => ({L: Math.max(a.L, c.L), R: Math.max(a.R, c.R), pk: Math.max(a.pk, c.pk), d1: Math.max(a.d1, c.d1)});
  // the frequency from the zero crossings of a quiet stretch
  let zc = 0; for (let n = at(1) + 1; n < at(5); n++) if (L[n - 1] < 0 && L[n] >= 0) zc++;
  const f = zc / ((at(5) - at(1)) / sr), w2 = Math.pow(2 * Math.PI * f / sr, 2);
  const K = (b0, b1) => { const a = win(b0, b1, L), c = win(b0, b1, R_); return {L: a.d2 / (w2 * Math.max(a.pk, 1e-9)), R: c.d2 / (w2 * Math.max(c.pk, 1e-9)), pk: Math.max(a.pk, c.pk), d1: Math.max(a.d1, c.d1)}; };
  return {f, peak: rr.peak, rest: K(.5, 6.5), rest2: K(2.5, 7.9),
    // windows without a note start (S1 starts its note on the bar line, S2 two beats later; 10 ms before and 60 ms after a start are left out: attack and decay of the new note)
    jump: K(7.95, 9.9), flow: K(14.95, 15.99), bar1: M(K(23.95, 25.98), K(26.12, 27.95)), bar2: K(32.06, 39.85), free: M(K(39.95, 41.98), K(42.12, 43.1))};
}, [t, withState]);
const r = await run(true), z = await run(false);     // z: the same song without a state (control: what the notes themselves do)
console.log(JSON.stringify({r, z}).slice(0, 400));
const base = Math.max(r.rest.L, r.rest.R, 1);
ok('KL-0 Ton 440 Hz erkannt', Math.abs(r.f - 440) < 3, r.f.toFixed(1) + ' Hz');
for (const k of ['jump', 'flow', 'bar1', 'bar2', 'free']) {
  const x = r[k], m = Math.max(x.L, x.R), y = z[k], mz = Math.max(y.L, y.R);
  ok('KL ' + {jump: 'aus (10 ms)', flow: 'kurz', bar1: '1 T', bar2: '2 T', free: 'frei 3'}[k] + ': kein Knacks (k ≤ 1,25 × Ruhe oder ≤ 1,15 × ohne Zustand)', m <= Math.max(1.25 * base, 1.15 * mz), 'k ' + m.toFixed(3) + ' · ohne Zustand ' + mz.toFixed(3) + ' · Ruhe ' + base.toFixed(3));
}
ok('KL-S keine Übersteuerung', r.peak < 1, 'Spitze ' + r.peak.toFixed(3));
// Teil B: M-KLICK (spec v3 Anhang C): Hochpass 5 kHz, Energie in 2-ms-Fenstern; kein Fenster mehr als +6 dB über dem Median der Fenster
// ±20 ms, außer 3 ms nach einem geplanten Anschlag und unter −90 dBFS. Säge-Fläche, Zustand: Cutoff 2,4 kHz → 400 Hz, Resonanz 10 → 50 %, Klang-Pegel −6 dB.
const mk = await p.evaluate(async (t) => {
  const Q = window.SYNQUENZER;
  for (const [k, v] of [['o1w', 0], ['cutoff', 2400], ['res', .1], ['level', .5], ['aR', .4]]) Q.setParam(t, k, v);
  Q.v6aSetState(t, 1, {p: {cutoff: 400, res: .5, level: .25}});
  await Q.vvRender({range: {a: 0, b: 12}});
  const L = VV.last.ch[0], R_ = VV.last.ch[1], sr = VV.last.sr, spb_ = spb(), at = bb => Math.round(bb * spb_ * sr);
  // RBJ high-pass 5 kHz, Q 0.707
  const w0 = 2 * Math.PI * 5000 / sr, al = Math.sin(w0) / (2 * Math.SQRT1_2), c = Math.cos(w0), a0 = 1 + al;
  const B0 = (1 + c) / 2 / a0, B1 = -(1 + c) / a0, B2 = B0, A1 = -2 * c / a0, A2 = (1 - al) / a0;
  const hp = x => { const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let n = 0; n < x.length; n++) { const v = B0 * x[n] + B1 * x1 + B2 * x2 - A1 * y1 - A2 * y2; x2 = x1; x1 = x[n]; y2 = y1; y1 = v; y[n] = v; } return y; };
  const hL = hp(L), hR = hp(R_), W = Math.round(.002 * sr), nW = Math.floor(L.length / W), E = new Float64Array(nW);
  for (let k = 0; k < nW; k++) { let e = 0; for (let n = k * W; n < (k + 1) * W; n++) e += hL[n] * hL[n] + hR[n] * hR[n]; E[k] = e; }
  const ons = [0, 8, 16, 24, 32, 40].concat([10, 26, 42]).map(at);     // note starts (S1 on the bar line, S2 two beats later)
  const res = {};
  for (const [nm, b0, b1] of [['jump', 7.9, 8.5], ['flow', 14.9, 16.2], ['bar1', 23.9, 28.2], ['bar2', 31.9, 40.1], ['free', 39.9, 43.2], ['ruhe', 1, 6]]) {
    let worst = -99, wb = null;
    for (let k = Math.floor(at(b0) / W); k < Math.min(nW - 10, Math.floor(at(b1) / W)); k++) {
      const s0 = k * W; if (ons.some(o => s0 >= o - W && s0 < o + Math.round(.003 * sr))) continue;
      if (E[k] / W < 1e-9) continue;                                   // below −90 dBFS (the end of a release tail into silence) is no click
      const nb = []; for (let j = k - 10; j <= k + 10; j++) if (j !== k && j >= 0) nb.push(E[j]); nb.sort((a, b) => a - b);
      const med = nb[nb.length >> 1], d = 10 * Math.log10((E[k] + 1e-30) / (med + 1e-30));
      if (d > worst) { worst = d; wb = s0 / sr / spb_; }
    }
    res[nm] = {db: +worst.toFixed(2), at: wb && +wb.toFixed(3)};
  }
  return res;
}, t);
console.log(JSON.stringify(mk));
for (const k of ['jump', 'flow', 'bar1', 'bar2', 'free']) ok('M-KLICK ' + {jump: 'aus', flow: 'kurz', bar1: '1 T', bar2: '2 T', free: 'frei 3'}[k] + ' (Cutoff, Resonanz, Pegel): ≤ +6 dB', mk[k].db <= 6, mk[k].db + ' dB bei Schlag ' + mk[k].at + ' · Ruhe ' + mk.ruhe.db + ' dB');
ok('KL-E keine Fehler', !errs.length, errs.join(' | ').slice(0, 300));
await b.close(); process.exit(done() ? 1 : 0);
