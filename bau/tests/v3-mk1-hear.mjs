// MK1-19 Hörbar (Spec §0.3 H-1, H-3): every knob of SPIEL and of every EDIT-WAHL-1 section (level 1 and 2) from min to max
// changes M-PEGEL >= 3 dB or a relevant M-BAND >= 6 dB or M-SP >= 1/3 oct or M-AUS x2; continuous knobs: no step back
// > 0.5 dB in that measure at 0, 1/4, 1/2, 3/4, 1. Rendered by the app worklet in Node (v3-mk1-node.mjs), C3, velocity 0.8.
import {render, mkPatch} from './v3-mk1-node.mjs';
import {rms, spectrum, pdb, zcFreq} from './v3-mk1-ana.mjs';
const SR = 48000; let fails = 0; const out = [];
const ok = (id, c, info) => { if (!c) fails++; const l = (c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : ''); out.push(l); console.log(l); };
const BANDS = [[20, 45], [45, 90], [90, 180], [180, 400], [400, 1200], [1200, 4000], [4000, 12000]];
function measure(x) {
  const lvl = pdb(Math.pow(rms(x, 0, Math.round(.3 * SR)), 2));
  const n = 8192, P = spectrum(x, 0, n, 'hann'), bin = SR / n, band = BANDS.map(([a, b]) => { let e = 0; for (let k = Math.ceil(a / bin); k <= Math.floor(b / bin); k++) e += P[k]; return pdb(e); });
  let a = 0, w = 0; for (let k = 1; k < n / 2; k++) { const m = Math.sqrt(P[k]); a += m * k * bin; w += m; }
  // M-AUS: time to -20 dB under the peak (5 ms windows)
  const W = 240; let pk = 0, ip = 0; const e = []; for (let i = 0; i + W <= x.length; i += W) { const v = rms(x, i, i + W); e.push(v); if (v > pk) { pk = v; ip = e.length - 1; } }
  let aus = e.length; for (let k = ip; k < e.length; k++) if (e[k] < pk / 10) { aus = k; break; }
  return {lvl, band, sp: a / Math.max(w, 1e-20), aus: (aus - ip) * W / SR};
}
function h1(a, b) {
  const dl = Math.abs(a.lvl - b.lvl), mx = Math.max(...a.band, ...b.band);
  let db = 0; a.band.forEach((v, k) => { if (Math.max(v, b.band[k]) >= mx - 30) db = Math.max(db, Math.abs(v - b.band[k])); });
  const ds = Math.abs(Math.log2(Math.max(a.sp, 1) / Math.max(b.sp, 1))), ra = Math.max(a.aus, b.aus) / Math.max(1e-3, Math.min(a.aus, b.aus));
  return {ok: dl >= 3 || db >= 6 || ds >= 1 / 3 || ra >= 2, dl, db, ds, ra, which: dl >= 3 ? 'pegel' : db >= 6 ? 'band' : ds >= 1 / 3 ? 'sp' : ra >= 2 ? 'aus' : '-'};
}
const get = (p, path) => path.split('.').reduce((o, k) => o[k], p.t[0]);
const setp = (p, path, v) => { const ks = path.split('.'); let o = p.t[0]; for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = v; };
// [label, path, lo, hi, context (partial timbre), events?, render opts?]
const H = (l, path, lo, hi, ctx, ev, o) => ({l, path, lo, hi, ctx: ctx || {}, ev, o: o || {}});
const C3 = [[0, 'on', 48, .8], [1, 'off', 48]];
const LEG = [[0, 'on', 48, .8], [.25, 'on', 55, .8], [.6, 'off', 48], [.7, 'off', 55]];
const FIVE = [36, 60, 64, 67, 72].map((n, k) => [k * .05, 'on', n, .8]).concat([[1, 'off', 36], [1, 'off', 60], [1, 'off', 64], [1, 'off', 67], [1, 'off', 72]]);
const SAW_LO = {f: {cut: 70}};
const LIST = [
  // SPIEL
  H('SPIEL CUTOFF', 'f.cut', 0, 127), H('SPIEL RESO.', 'f.res', 0, 127, {f: {cut: 64}}), H('SPIEL ATTACK (beide HK)', 'e2.a', 0, 127), H('SPIEL RELEASE (beide HK)', 'e2.r', 0, 127, null, [[0, 'on', 48, .8], [.3, 'off', 48]], {sec: 3}),
  // STIMME (SYNTH/VOC., EINZELN: gesperrt bis MK7 / MK3; STIMMEN, SPLIT, ST.-ZAHL: dunkel)
  H('STIMME ZUWEISUNG', 'asg', 0, 2, {udet: 40}, FIVE), H('STIMME AUSLÖSUNG', 'trig', 0, 1, {asg: 0, e2: {a: 60, s: 60}}, LEG), H('STIMME UNI-VERST.', 'udet', 0, 99, {asg: 2}, C3, {sec: 2}),
  H('STIMME (EB2) PRIORITÄT', 'prio', 1, 2, {}, FIVE),
  // TONH.
  H('TONH. TRANSP.', 'trans', -24, 24), H('TONH. FEIN', 'tune', -50, 50, {mix: {o1: 127, o2: 127}, o2: {w: 0}}, C3, {sec: 2}), H('TONH. PORTAM.', 'porta', 0, 127, {asg: 0}, [[0, 'on', 36, .8], [.2, 'on', 72, .8], [1, 'off', 72], [1, 'off', 36]]),
  H('TONH. VIBRATO', 'vib', 0, 63, {l2: {f: 90}}, C3, {mw0: 1}), H('TONH. (EB2) MOD-RAD', 'mw', 0, 1, {vib: 63, l2: {f: 90}}),
  // OSZ 1 (STEUER 2 needs LFO1; the meaning per wave: saw FORM / WFM)
  H('OSZ 1 WELLE', 'o1.w', 0, 2), H('OSZ 1 STEUER 1', 'o1.c1', 0, 127), H('OSZ 1 STEUER 2', 'o1.c2', 0, 127, {o1: {w: 1, c1: 64}, l1: {w: 2, f: 70}}),
  // OSZ 2
  H('OSZ 2 WELLE', 'o2.w', 0, 2, {mix: {o1: 0, o2: 127}}), H('OSZ 2 MOD', 'o2.mod', 0, 3, {mix: {o1: 0, o2: 127}, o2: {semi: 7}}), H('OSZ 2 HALBTON', 'o2.semi', -24, 24, {mix: {o1: 0, o2: 127}}), H('OSZ 2 FEIN', 'o2.tune', -63, 63, {mix: {o1: 0, o2: 127}}),
  // MIXER
  H('MIXER OSZ 1', 'mix.o1', 0, 127), H('MIXER OSZ 2', 'mix.o2', 0, 127, {mix: {o1: 0}}), H('MIXER RAUSCHEN', 'mix.n', 0, 127, {mix: {o1: 40}}),
  // FILTER
  H('FILTER TYP', 'f.type', 0, 3, {f: {cut: 64}}), H('FILTER CUTOFF', 'f.cut', 0, 127), H('FILTER RESO.', 'f.res', 0, 127, {f: {cut: 64}}),
  H('FILTER HK-INT', 'f.eg', -63, 63, {f: {cut: 50}, e1: {a: 0, d: 80, s: 0}}), H('FILTER KEYTRACK', 'f.kbd', -63, 63, {f: {cut: 64}}, [[0, 'on', 84, .8], [1, 'off', 84]]),
  H('FILTER (EB2) ANSCHLAG', 'f.vel', -63, 63, {f: {cut: 50}}),
  // F-HK (with HK-INT so the filter envelope is heard)
  H('F-HK ATTACK', 'e1.a', 0, 127, {f: {cut: 30, eg: 63}, e1: {s: 0, d: 90}}, C3, {sec: 2}), H('F-HK DECAY', 'e1.d', 0, 127, {f: {cut: 30, eg: 63}, e1: {s: 0}}, C3, {sec: 2}),
  H('F-HK SUSTAIN', 'e1.s', 0, 127, {f: {cut: 30, eg: 63}, e1: {d: 20}}), H('F-HK RELEASE', 'e1.r', 0, 127, {f: {cut: 30, eg: 63}, e1: {s: 127}, e2: {r: 127}}, [[0, 'on', 48, .8], [.3, 'off', 48]], {sec: 3}),
  // AMP
  H('AMP PEGEL', 'a.lvl', 0, 127), H('AMP PAN', 'a.pan', -63, 63, {}, C3, {pan: true}), H('AMP VERZERR.', 'a.dist', 0, 1, {o1: {w: 2}, f: {cut: 50}}), H('AMP KEYTRACK', 'a.kbd', -63, 63, {}, [[0, 'on', 84, .8], [1, 'off', 84]]),
  H('AMP (EB2) HK │ GATE', 'a.gate', 0, 1, {e2: {a: 90}}), H('AMP (EB2) ANSCHLAG', 'a.vel', -63, 63, {}, [[0, 'on', 48, .3], [1, 'off', 48]]),
  // A-HK
  H('A-HK ATTACK', 'e2.a', 0, 127), H('A-HK DECAY', 'e2.d', 0, 127, {e2: {s: 0}}, C3, {sec: 3}), H('A-HK SUSTAIN', 'e2.s', 0, 127, {e2: {d: 20}}), H('A-HK RELEASE', 'e2.r', 0, 127, null, [[0, 'on', 48, .8], [.3, 'off', 48]], {sec: 3}),
  // LFO 1 (heard through STEUER 2 on the pulse width), LFO 2 (through the vibrato with the mod wheel up)
  H('LFO 1 WELLE', 'l1.w', 0, 3, {o1: {w: 1, c1: 64, c2: 127}, l1: {f: 80}}), H('LFO 1 FREQ', 'l1.f', 0, 127, {o1: {w: 1, c1: 64, c2: 127}}), H('LFO 1 TEMPO SYNC', 'l1.sync', 0, 1, {o1: {w: 1, c1: 64, c2: 127}, l1: {f: 0, note: 12}}),
  H('LFO 1 KEY SYNC', 'l1.ks', 0, 2, {o1: {w: 1, c1: 64, c2: 127}, l1: {f: 60}}, [[1, 'on', 48, .8], [2.4, 'off', 48]], {sec: 2.5}),
  H('LFO 2 WELLE', 'l2.w', 0, 3, {vib: 63, l2: {f: 80}}, C3, {mw0: 1}), H('LFO 2 FREQ', 'l2.f', 0, 127, {vib: 63}, C3, {mw0: 1}), H('LFO 2 TEMPO SYNC', 'l2.sync', 0, 1, {vib: 63, l2: {f: 0, note: 12}}, C3, {mw0: 1}),
  H('LFO 2 KEY SYNC', 'l2.ks', 0, 2, {vib: 63, l2: {f: 60}}, [[1, 'on', 48, .8], [2.4, 'off', 48]], {mw0: 1, sec: 2.5}),
  H('F-HK NEUSTART', 'e1.rst', 0, 1, {f: {cut: 30, eg: 63}, e1: {a: 90, s: 127, r: 127}, e2: {r: 127}}, [[0, 'on', 48, .8], [.4, 'off', 48], [.5, 'on', 48, .8], [1, 'off', 48]]),
  H('A-HK NEUSTART', 'e2.rst', 0, 1, {e2: {a: 90, r: 127}}, [[0, 'on', 48, .8], [.4, 'off', 48], [.5, 'on', 48, .8], [1, 'off', 48]]),
];
const EXC = ['SYNTH/VOC. (gesperrt bis MK7)', 'EINZELN/SCHICHT (gesperrt bis MK3)', 'STIMMEN, SPLIT, ST.-ZAHL (dunkel bis MK3/MK13)', 'BEND (nur mit bewegtem BEND-Rad: MK1-16)', 'TEMPO (nur mit Sync/Arp/Seq; hier über LFO TEMPO SYNC geprüft)', 'NEUSTART (nur bei Neuanschlag: so gemessen)', 'MIXER/FILTER/F-HK EB2-Plätze (dunkel bis MK11/MK12)'];
// time-resolved measures for knobs whose effect moves in time (H-1 per 30 ms window: a relevant band >= 6 dB or the level
// >= 3 dB in some window) and for pitch knobs (H-1 has no pitch measure: >= 50 ct in some 20 ms window, a quarter tone)
function bandsAt(x, i0, n) { const P = spectrum(x, i0, n, 'hann'), bin = SR / n; return BANDS.map(([a, b]) => { let e = 0; for (let k = Math.ceil(a / bin); k <= Math.floor(b / bin); k++) e += P[k]; return pdb(e + 1e-20); }); }
function timeDiff(x, y) { let best = 0, lv = 0; for (let i = Math.round(.03 * SR); i + 2048 <= Math.min(x.length, y.length); i += 1440) { const A = bandsAt(x, i, 2048), B = bandsAt(y, i, 2048), mx = Math.max(...A, ...B);
  A.forEach((v, k) => { if (Math.max(v, B[k]) >= mx - 30) best = Math.max(best, Math.abs(v - B[k])); }); lv = Math.max(lv, Math.abs(pdb(rms(x, i, i + 1440) ** 2) - pdb(rms(y, i, i + 1440) ** 2))); }
  return {band: best, lvl: lv}; }
function pitchDiff(x, y) { let best = 0; for (let i = Math.round(.03 * SR); i + 3840 <= Math.min(x.length, y.length); i += 480) { const fa = zcFreq(x, i, i + 3840, SR), fb = zcFreq(y, i, i + 3840, SR); if (fa > 20 && fb > 20) best = Math.max(best, Math.abs(1200 * Math.log2(fa / fb))); } return best; }
const PITCH = /^(trans|tune|porta|vib|mw|o2\.tune|l2\.(w|f|sync|ks))$/, TIME = /^(asg|trig|prio|udet|l1\.(w|f|sync|ks)|e1\.rst|e2\.rst|o1\.c2)$/;
for (const h of LIST) {
  const pitch = PITCH.test(h.path), time = TIME.test(h.path);
  const ctx = pitch ? Object.assign({o1: {w: 2}, f: {cut: 127}}, h.path === 'o2.tune' ? {} : {mix: {o1: 127, o2: 0}}, h.ctx) : h.ctx;
  const mkp = v => { const p = mkPatch(ctx); if (h.path === 'mw') return p; setp(p, h.path, v); return p; };
  const r = v => { const x = render(mkp(v), h.ev || C3, Object.assign({sec: 1.5, mw0: h.path === 'mw' ? v : h.o.mw0}, h.o, pitch ? {tap: 'mix'} : {})); return h.o.pan ? x.r : x.l; };
  const xa = r(h.lo), xb = r(h.hi);
  if (pitch) { const d = pitchDiff(xa, xb); ok('MK1-19 ' + h.l, d >= 50, 'Tonhöhe ' + d.toFixed(0) + ' ct'); continue; }
  if (time) { const d = timeDiff(xa, xb), st = h1(measure(xa), measure(xb)); ok('MK1-19 ' + h.l, d.band >= 6 || d.lvl >= 3 || st.ok, 'Fenster: Band ' + d.band.toFixed(1) + ' dB, Pegel ' + d.lvl.toFixed(1) + ' dB'); continue; }
  const cont = !/\.(w|type|mod|gate|dist|sync|ks|rst|semi)$|^(asg|trig|prio)$/.test(h.path);   // HALBTON: a pitch list, no H-3
  const a = measure(xa), b = measure(xb), m = h1(a, b);
  let h3 = true, h3i = '';
  if (cont && m.ok) {
    // H-3 in the deciding measure (for M-BAND: the band that changed most); a bipolar control with its neutral 0 in the
    // middle (vel / key track: V-shaped by W-21/W-22) is checked per half
    let bi = 0, bd = -1; a.band.forEach((v, k) => { const d = Math.abs(v - b.band[k]); if (d > bd) { bd = d; bi = k; } });
    const key = m.which, val = q => (key === 'pegel' ? q.lvl : key === 'sp' ? Math.log2(Math.max(q.sp, 1)) * 6 : key === 'aus' ? 20 * Math.log10(Math.max(q.aus, 1e-3)) : q.band[bi]);
    const segs = h.lo < 0 && h.hi > 0 && /vel|kbd/.test(h.path) ? [[h.lo, 0], [0, h.hi]] : [[h.lo, h.hi]];
    for (const [lo, hi] of segs) { const pts = [0, .25, .5, .75, 1].map(f => val(measure(r(lo + (hi - lo) * f)))), dir = Math.sign(pts[4] - pts[0]);
      for (let k = 1; k < 5; k++) if ((pts[k] - pts[k - 1]) * dir < -.5) { h3 = false; h3i = ' H-3 Rückgang ' + (pts[k] - pts[k - 1]).toFixed(2) + ' (' + lo + '…' + hi + ')'; } }
  }
  ok('MK1-19 ' + h.l, m.ok && h3, m.which + ' (Pegel ' + m.dl.toFixed(1) + ' dB, Band ' + m.db.toFixed(1) + ' dB, SP ' + m.ds.toFixed(2) + ' Okt, AUS ×' + m.ra.toFixed(2) + ')' + h3i);
}
console.log('Ausnahmen (B.6 Nr. 3, im Skript benannt): ' + EXC.join('; '));
console.log(fails ? fails + ' FEHLER' : 'alles bestanden (' + out.length + ')');
process.exit(fails ? 1 : 0);
