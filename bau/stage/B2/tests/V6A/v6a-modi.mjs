// V6A Gleit-Arten im Song (Offline-Render = Video/GarageBand-Weg): Song S1 S2 S1 S2 S1 S2 (je 2 Takte), Zustand an Szene 2 (Cutoff
// 2,4 kHz → 400 Hz), Kanten: Takt 3 wie Clip („kurz“), Takt 5 „2 T“, Takt 7 „aus“, Takt 9 „frei 3“, Takt 11 „1 T“.
// Gemessen je 128er-Block im Worklet (__morphProbe): Beginn, Ende, Dauer (Schläge), Monotonie, genaue Endwerte.
import { open, setup, ok, done } from './v6a-lib.mjs';
const { b, p, errs } = await open();
const t = await setup(p, { scenes: 2, len: 2 });
const r = await p.evaluate(async (t) => {
  const Q = window.SYNQUENZER;
  setP(t, 'cutoff', 2400);
  Q.v6aSetState(t, 1, {p: {cutoff: 400}});
  Q.songFromChain([0, 1, 0, 1, 0, 1].map(s => ({scene: s, bars: 2})));
  const M = S.song.marks; const id = a => M.find(m => m.a === a).id;
  Q.v6aMarkGlide(id(4), {x: 'bar2'}); Q.v6aMarkGlide(id(6), {x: 'jump'}); Q.v6aMarkGlide(id(8), {x: 'free', n: 3}); Q.v6aMarkGlide(id(10), {x: 'bar1'});
  Q.v6aProbeAll(t, ['cutoff']);
  await Q.vvRender({range: {a: 0, b: 12}});
  return {log: Q.v6aProbeLog(t), st: Q.v6aStart(), marks: S.song.marks.map(m => [m.a, m.gl ? m.gl.x : null])};
}, t);
const { sr, spb } = r.st, t0 = r.st.t;
const beat = f => (f / sr - t0) / spb;
const L = r.log.map(x => ({b: beat(x.f), v: x.v[0]}));
const blk = 128 / sr / spb;                                            // one block in beats
// segments (the end = within 0,05 % of the target: a glide that meets the next one at the bar line hands over there)
// first and last block of a movement between two plateaus
function seg(from, to, lo, hi, o) {
  const w = L.filter(x => x.b >= lo && x.b <= hi);
  const s = w.find(x => Math.abs(x.v - from) > 1e-6 * from), e = w.find(x => (o && o.tol ? Math.abs(x.v - to) <= o.tol * to : x.v === to) && (!s || x.b >= s.b));
  return {s: s ? s.b : null, e: e ? e.b : null, mono: (() => { if (!s || !e) return false; const m = w.filter(x => x.b >= s.b && x.b <= e.b).map(x => x.v); for (let k = 1; k < m.length; k++) if ((to > from ? m[k] < m[k - 1] : m[k] > m[k - 1]) && Math.abs(m[k] - m[k - 1]) > 1e-9) return false; return true; })(), n: w.filter(x => s && e && x.b > s.b && x.b < e.b).length};
}
const near = (x, y, tol) => x != null && Math.abs(x - y) <= tol;
// 2 T: the S-curve in log space – at its middle (beat 20) the geometric mean, just before beat 24 within 2 ppm of 2400
const at = bb => L.reduce((a, x) => (Math.abs(x.b - bb) < Math.abs(a.b - bb) ? x : a), L[0]);
{ const m = at(20), xs = (m.b - 16) / 8, s_ = xs * xs * (3 - 2 * xs), want = 400 * Math.pow(6, s_);
  ok('MOD 2 T: S-Kurve im Reglerraum (Mitte = geometrisches Mittel)', Math.abs(m.v / want - 1) < 1e-6, m.v.toFixed(2) + ' / ' + want.toFixed(2)); }
const E = [
  ['kurz (Clip) an Takt 3', seg(2400, 400, 5, 9), 7, 8],
  ['2 T an Takt 5', seg(400, 2400, 14, 25, {tol: 2e-6}), 16, 24],
  ['aus an Takt 7', seg(2400, 400, 23.9995, 26), 24, 24 + .01 / spb],
  ['frei 3 an Takt 9', seg(400, 2400, 31, 37), 32, 35],
  ['1 T an Takt 11', seg(2400, 400, 39, 45), 40, 44],
];
ok('MOD-0 Probe aus dem Render', L.length > 500, L.length + ' Blöcke');
for (const [n, s, a, e] of E) {
  ok("MOD " + n + ": Beginn Schlag " + a, near(s.s, a, blk * 2.01), 's=' + (s.s != null ? s.s.toFixed(4) : '–'));
  ok('MOD ' + n + ': Ende Schlag ' + +e.toFixed(3), near(s.e, e, blk * 1.01), 'e=' + (s.e != null ? s.e.toFixed(4) : '–'));
  ok('MOD ' + n + ': monoton' + (e - a > .1 ? ', ≥ 10 Zwischenwerte' : ''), s.mono && (e - a <= .1 || s.n >= 10), s.n + ' Zwischenwerte');
}
// plateaus: between the moves the value stands exactly
const pl = (lo, hi, v) => L.filter(x => x.b > lo && x.b < hi).every(x => x.v === v);
ok('MOD-P Ruhe zwischen den Fahrten (exakt 400 / 2400, keine Drift)', pl(8.1, 15.9, 400) && pl(24.1, 31.9, 400) && pl(35.1, 39.9, 2400), '');
ok('MOD-E keine Fehler', !errs.length, errs.join(' | ').slice(0, 300));
await b.close(); process.exit(done() ? 1 : 0);
