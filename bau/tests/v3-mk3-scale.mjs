// MK3-06 scales (W-43) and MK3-12 (keytrack follows the tuned pitch), Node with the app's worklet text.
// Usage: MK_FILE=<index.html> node v3-mk3-scale.mjs   (ONLY=<regex>)
import {render, mkDefaults} from './v3-mk1-node.mjs';
import {zcFreq, peaks, mKlick} from './v3-mk1-ana.mjs';
const NEW = process.env.MK_FILE || new URL('../mk-br-MK3/index.html', import.meta.url).pathname;
const OLD = process.env.MK_OLD || new URL('../synq-snapshots/MK2.html', import.meta.url).pathname;
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null, SR = 48000;
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e)); } };
const M = (x, d) => Math.round(x * 10 ** (d == null ? 2 : d)) / 10 ** (d == null ? 2 : d);
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
// W-43 as written in Nachtrag 3 B.2 (independent of the app's table): ct per step 0..11 from the key
const W43 = {
  0: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  1: [0, 11.73, 3.91, 15.64, -13.69, -1.96, -9.78, 1.96, 13.69, -15.64, -3.91, -11.73],
  2: [0, 11.73, 3.91, 15.64, -13.69, -1.96, -9.78, 1.96, 13.69, -15.64, 17.60, -11.73],
  3: [0, 0, 0, 0, -50, 0, 0, 0, 0, 0, 0, -50],
  4: [0, 13.69, 3.91, -5.87, 7.82, -1.96, 11.73, 1.96, 15.64, 5.87, -3.91, 9.78],
  5: [0, -9.78, -7.82, -5.87, -9.78, -1.96, -11.73, -3.91, -7.82, -11.73, -3.91, -7.82],
  6: [0, -9.78, -6.84, -5.87, -13.69, -1.96, -9.78, -3.42, -7.82, -10.26, -3.91, -11.73],
  7: [0, 0, 40, 0, 0, -20, 0, 20, 0, 60, 0, 0],
  8: [0, 0, -80, 0, -130, 40, 0, -30, 0, -115, 0, -150]};
const USC = [0, 37, -88, 100, -100, 12, -5, 63, -41, 0, 99, -27];
const NAMES = ['Gleichstufig', 'Rein Dur', 'Rein Moll', 'Arabisch', 'Pythagoreisch', 'Werckmeister III', 'Kirnberger III', 'Slendro', 'Pelog', 'Eigene'];
const SINE = {o1: {w: 3, c1: 0, c2: 0}, mix: {o1: 127, o2: 0, n: 0}, f: {cut: 127}};
const expCt = (sc, key, n) => { const s = (((n % 12) - key) % 12 + 12) % 12; return sc === 9 ? USC[s] : W43[sc][s]; };
const meas = (p, n, o) => { const r = render(p, [[0, 'on', n, .8]], Object.assign({file: NEW, sec: 1.1}, o || {})); const x = o && o.ch === 'r' ? r.r : r.l;
  const f0 = 440 * Math.pow(2, (n - 69) / 12), zc = zcFreq(x, Math.round(.15 * SR), Math.round(1.05 * SR), SR);
  const pk = peaks(x, Math.round(.15 * SR), SR, 32768, 1)[0];
  return {zc: 1200 * Math.log2(zc / f0), sp: 1200 * Math.log2(pk.f / f0)}; };

T('MK3-06', () => {
  let worstZ = 0, worstS = 0, bad = [], rows = [];
  for (let sc = 0; sc <= 9; sc++) {
    let wsc = 0;
    for (const key of [0, 9]) for (let n = 60; n <= 71; n++) {
      const p = prog({scale: sc, skey: key, usc: sc === 9 ? USC : null}, SINE), m = meas(p, n), e = expCt(sc, key, n);
      const dz = Math.abs(m.zc - e), ds = Math.abs(m.sp - e); worstZ = Math.max(worstZ, dz); worstS = Math.max(worstS, ds); wsc = Math.max(wsc, ds, dz);
      if (dz > .5 || ds > .5) bad.push(NAMES[sc] + ' key ' + key + ' note ' + n + ': ' + M(m.sp) + '/' + M(m.zc) + ' ct statt ' + e);
    }
    rows.push(NAMES[sc] + ' ' + M(wsc, 3));
  }
  ok('MK3-06 alle 10 Stimmungen, Grundton C und A, C4…B4: jede Tonklasse = W-43 ± 0,5 ct (Spektrum und Nulldurchgänge)', !bad.length,
    'größte Abweichung Spektrum ' + M(worstS, 3) + ' ct, Nulldurchgänge ' + M(worstZ, 3) + ' ct · ' + rows.join(', ') + (bad.length ? ' · ' + bad.slice(0, 4).join(' | ') : ''));
  // own scale: the 12 values (key C) act; also with key E (step 0 = E)
  let wo = 0; for (let n = 60; n <= 71; n++) { const m = meas(prog({scale: 9, skey: 4, usc: USC}, SINE), n); wo = Math.max(wo, Math.abs(m.sp - expCt(9, 4, n)), Math.abs(m.zc - expCt(9, 4, n))); }
  ok('MK3-06 Eigene Stimmung mit Grundton E: 12 Werte ± 0,5 ct', wo <= .5, 'größte ' + M(wo, 3) + ' ct');
  // equal temperament bit-equal to MK2 (several keys; the key alone changes nothing)
  let m0 = 0; const ev = [[0, 'on', 48, .8], [.1, 'on', 55, .8], [.2, 'on', 61, .7], [.6, 'off', 48], [.8, 'off', 55], [.9, 'off', 61]];
  for (const key of [0, 4, 9, 11]) { const p = prog({scale: 0, skey: key}, {o1: {w: 0}, f: {cut: 80, kbd: 48}}); const a = render(p, ev, {sec: 1.2, file: OLD}), b = render(p, ev, {sec: 1.2, file: NEW});
    for (let i = 0; i < a.l.length; i++) m0 = Math.max(m0, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i])); }
  ok('MK3-06 Gleichstufig (Grundton C, E, A, B) bitgleich zu MK2', m0 === 0, 'max |Δ| ' + m0);
  // the scale tunes both timbres (Dual, T2 solo)
  const pd = prog({mode: 1, scale: 8, skey: 0}, SINE, SINE), mt = meas(pd, 64, {at: [[0, {mkSolo: 2}]]});
  ok('MK3-06 Stimmung gilt je Timbre: T2 (Dual, Solo T2) Pelog E4 = −130 ± 0,5 ct', Math.abs(mt.sp + 130) <= .5 && Math.abs(mt.zc + 130) <= .5, M(mt.sp) + ' / ' + M(mt.zc) + ' ct');
  // a scale change at a held note: the pitch follows without a click
  const r = render(prog({scale: 0}, {o1: {w: 2}, f: {cut: 100}}), [[0, 'on', 64, .8], [0, 'on', 69, .8]], {file: NEW, sec: 1.2, at: [[.6, {mkSet: {scale: 8}}]]});
  const fa = zcFreq(render(prog({scale: 8}, SINE), [[0, 'on', 64, .8]], {file: NEW, sec: 1.2, at: [[.0, {mkSet: {scale: 0}}], [.6, {mkSet: {scale: 8}}]]}).l, Math.round(.75 * SR), Math.round(1.15 * SR), SR);
  const k = mKlick(r.l, SR, [0]);
  ok('MK3-06 Stimmung wechseln bei gehaltener Note: neue Tonhöhe, M-KLICK ≤ +6 dB', Math.abs(1200 * Math.log2(fa / (440 * Math.pow(2, -5 / 12))) + 130) <= .5 && k.ok, M(1200 * Math.log2(fa / (440 * Math.pow(2, -5 / 12)))) + ' ct, Klick ' + M(k.worst, 1) + ' dB');
});

T('MK3-12', () => {
  // KEYTRACK +48 with Werckmeister III: the cutoff follows the tuned pitch (deviation = W-43 value ± 2 ct), via mkScope cutHz
  const cutAt = (sc, n) => { const r = render(prog({scale: sc, skey: 0}, {f: {cut: 64, kbd: 48}}), [[0, 'on', n, .8]], {file: NEW, sec: .4, at: [[0, {mkScope: true}]]});
    let best = null; for (const m of r.msgs) if (m.mkScope && m.mkScope.voices.length && m.mkScope.t <= .3) best = m.mkScope.voices[0].cutHz; return best; };
  let w = 0, rows = [];
  for (let n = 60; n <= 71; n++) { const d = 1200 * Math.log2(cutAt(5, n) / cutAt(0, n)), e = W43[5][n % 12]; w = Math.max(w, Math.abs(d - e)); rows.push(M(d, 2)); }
  ok('MK3-12 KEYTRACK +48 mit Werckmeister III: Cutoff-Abweichung = W-43 ± 2 ct (C4…B4)', w <= 2, 'größte ' + M(w, 3) + ' ct · ' + rows.join(' '));
});

console.log(fails ? fails + ' FEHLER' : 'alles bestanden');
process.exit(fails ? 1 : 0);
