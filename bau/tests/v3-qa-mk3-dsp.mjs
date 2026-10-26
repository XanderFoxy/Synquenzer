// QA (acceptance lens) MK3 DSP in Node with the app's worklet text. Independent of the builder's tests.
import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms, peak, mKlick, mEinbruch, spectrum, pdb, zcFreq, peaks} from './v3-mk1-ana.mjs';
const NEW = process.env.MK_FILE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html';
const OLD = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html';
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null, SR = 48000;
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = (id, f) => { if (ONLY && !ONLY.test(id)) return; try { f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e)); } };
const M = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const C = x => JSON.parse(JSON.stringify(x));
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, C(top || {})); merge(p.t[0], C(t1 || {})); merge(p.t[1], C(t2 || {})); return p; };
const R = (p, ev, o) => render(p, ev, Object.assign({file: NEW, sec: 1}, o || {}));
const lvl = (x, t0, t1) => db(rms(x.l, Math.round(t0 * SR), Math.round(t1 * SR)) + rms(x.r, Math.round(t0 * SR), Math.round(t1 * SR)));
const sumd = (d, a, b) => { let m = 0; for (let i = 0; i < d.l.length; i++) m = Math.max(m, Math.abs(d.l[i] - a.l[i] - b.l[i]), Math.abs(d.r[i] - a.r[i] - b.r[i])); return m; };
const mute = (p, k) => { const q = C(p); q.t[k].a.lvl = 0; if (q.t[k].p) q.t[k].p.forEach(x => { if (x.d === 5) x.i = 0; }); return q; };
const maxd = (a, b) => { let m = 0; for (let i = 0; i < a.l.length; i++) m = Math.max(m, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i])); return m; };
// a seeded random
let rs = 99; const rnd = () => { rs = (Math.imul(rs, 1103515245) + 12345) >>> 0; return rs / 4294967296; }; const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const W43 = {1: [0, 11.73, 3.91, 15.64, -13.69, -1.96, -9.78, 1.96, 13.69, -15.64, -3.91, -11.73],
  2: [0, 11.73, 3.91, 15.64, -13.69, -1.96, -9.78, 1.96, 13.69, -15.64, 17.60, -11.73], 3: [0, 0, 0, 0, -50, 0, 0, 0, 0, 0, 0, -50],
  4: [0, 13.69, 3.91, -5.87, 7.82, -1.96, 11.73, 1.96, 15.64, 5.87, -3.91, 9.78], 5: [0, -9.78, -7.82, -5.87, -9.78, -1.96, -11.73, -3.91, -7.82, -11.73, -3.91, -7.82],
  6: [0, -9.78, -6.84, -5.87, -13.69, -1.96, -9.78, -3.42, -7.82, -10.26, -3.91, -11.73], 7: [0, 0, 40, 0, 0, -20, 0, 20, 0, 60, 0, 0], 8: [0, 0, -80, 0, -130, 40, 0, -30, 0, -115, 0, -150]};
const NAMES = ['', 'Reine Dur', 'Reine Moll', 'Arabisch', 'Pythagoreisch', 'Werckmeister', 'Kirnberger', 'Slendro', 'Pelog'];
const randT = () => ({asg: ri(0, 2), prio: ri(0, 2), trig: ri(0, 1), udet: ri(0, 99), trans: ri(-24, 24), tune: ri(-50, 50), vib: ri(-63, 63), bend: ri(-12, 12), porta: ri(0, 127) * (rnd() < .5 ? 0 : 1),
  o1: {w: ri(0, 6), c1: ri(0, 127), c2: ri(0, 127)}, o2: {w: ri(0, 2), mod: ri(0, 3), semi: ri(-24, 24), tune: ri(-63, 63)}, mix: {o1: ri(0, 127), o2: ri(0, 127), n: ri(0, 127)},
  f: {type: ri(0, 3), cut: ri(20, 127), res: ri(0, 120), eg: ri(-63, 63), vel: ri(-63, 63), kbd: ri(-63, 63)}, a: {lvl: ri(40, 127), pan: ri(-63, 63), gate: ri(0, 1), dist: ri(0, 1), vel: ri(-63, 63), kbd: ri(-63, 63)},
  e1: {a: ri(0, 80), d: ri(0, 127), s: ri(0, 127), r: ri(0, 90), rst: ri(0, 1)}, e2: {a: ri(0, 60), d: ri(0, 127), s: ri(0, 127), r: ri(0, 90), rst: ri(0, 1)},
  l1: {w: ri(0, 3), ks: ri(0, 2), sync: 0, f: ri(0, 127), note: ri(0, 14)}, l2: {w: ri(0, 3), ks: ri(0, 2), sync: 0, f: ri(0, 127), note: ri(0, 14)},
  p: [0, 1, 2, 3].map(() => ({s: ri(0, 7), d: ri(0, 7), i: ri(-63, 63)}))});
const EVS = [[0, 'on', 48, .8], [.05, 'on', 55, .7], [.1, 'on', 60, .9], [.15, 'on', 64, .6], [.2, 'on', 67, .8], [.45, 'off', 48], [.5, 'on', 72, 1], [.6, 'off', 55], [.7, 'off', 60], [.8, 'on', 43, .5], [.9, 'off', 64], [1.0, 'off', 67], [1.1, 'off', 72], [1.2, 'off', 43]];

T('MK3-01', () => {
  // Dual / Split = T1 alone (T2 PEGEL 0) + T2 alone (T1 PEGEL 0): random patches with noise, S/H, stealing (more keys than voices)
  let worst = 0, n = 0, bad = []; rs = 1234;
  for (let k = 0; k < 24; k++) {
    const t1 = randT(), t2 = randT(); t1.mix.n = Math.max(t1.mix.n, 60); t2.l1.w = 3; t2.a.lvl = Math.max(80, t2.a.lvl); t1.a.lvl = Math.max(80, t1.a.lvl);
    const top = {mode: k % 3 === 2 ? 2 : 1, tv: k % 3, split: ri(50, 66), scale: ri(0, 8), skey: ri(0, 11)};
    const d = R(prog(top, t1, t2), EVS, {sec: 1.6, seed: 7 + k});
    const a = R(mute(prog(top, t1, t2), 1), EVS, {sec: 1.6, seed: 7 + k}), b = R(mute(prog(top, t1, t2), 0), EVS, {sec: 1.6, seed: 7 + k});
    const m = sumd(d, a, b); n++; if (m > 1e-4) bad.push(k + ' ' + JSON.stringify(top) + ' asg ' + t1.asg + '/' + t2.asg + ' Δ ' + m.toExponential(2)); worst = Math.max(worst, m);
  }
  ok('MK3-01 Dual/Split = Summe der einzeln gerenderten Timbres (24 Zufalls-Programme mit Rauschen, S/H, Stimmenraub, Stimmung; ≤ 1e-4)', worst <= 1e-4, 'max |Δ| ' + worst.toExponential(2) + (bad.length ? ' | ' + bad.slice(0, 4).join(' | ') : ''));
});

T('MK3-06', () => {
  // all 9 tables + Eigene, key C and A, C4..B4: frequency of a pure sine (Sinus×, X-MOD 0) against 440·2^((n−69)/12)·2^(ct/1200)
  const sine = {o1: {w: 3, c1: 0, c2: 0}, f: {cut: 127}};
  const meas = (p, n) => { const r = R(p, [[0, 'on', n, .8]], {sec: 1.1}); const f = zcFreq(r.l, Math.round(.15 * SR), Math.round(1.05 * SR), SR); return 1200 * Math.log2(f / (440 * 2 ** ((n - 69) / 12))); };
  let worst = 0, wl = ''; const rows = [];
  for (let sc = 1; sc <= 8; sc++) for (const key of [0, 9]) {
    for (let n = 60; n < 72; n++) { const want = W43[sc][((n - key) % 12 + 12) % 12], got = meas(prog({scale: sc, skey: key}, sine), n), e = Math.abs(got - want); if (e > worst) { worst = e; wl = NAMES[sc] + ' key ' + key + ' n ' + n + ' got ' + M(got) + ' want ' + want; } }
  }
  ok('MK3-06 9 Stimmungen × Grundton C/A × C4…H4 bei W-43 ± 0,5 ct (Sinus, Nulldurchgänge)', worst <= .5, 'größte Abweichung ' + M(worst, 3) + ' ct (' + wl + ')');
  // equal temperament base line (scale 0) at 0 ct
  let e0 = 0; for (let n = 60; n < 72; n++) e0 = Math.max(e0, Math.abs(meas(prog({scale: 0, skey: 4}, sine), n)));
  ok('MK3-06 Messkette: Gleichstufig ± 0,05 ct', e0 <= .05, M(e0, 3) + ' ct');
  // Eigene: random values with key E and key B
  rs = 777; let wu = 0, wul = '';
  for (const key of [4, 11]) { const usc = Array.from({length: 12}, () => ri(-100, 100)); usc[0] = -100; usc[5] = 100;
    for (let n = 60; n < 72; n++) { const want = usc[((n - key) % 12 + 12) % 12], got = meas(prog({scale: 9, skey: key, usc}, sine), n), e = Math.abs(got - want); if (e > wu) { wu = e; wul = 'key ' + key + ' n ' + n + ' got ' + M(got) + ' want ' + want; } } }
  ok('MK3-06 Eigene (Grundton E und H, Zufallswerte inkl. −100/+100): ± 0,5 ct', wu <= .5, M(wu, 3) + ' ct (' + wul + ')');
  // T2 tuned too (Dual, T1 PEGEL 0): Pelog key D
  let w2 = 0; for (let n = 60; n < 72; n++) { const want = W43[8][((n - 2) % 12 + 12) % 12], got = meas(prog({mode: 1, scale: 8, skey: 2}, merge(C(sine), {a: {lvl: 0}}), sine), n); w2 = Math.max(w2, Math.abs(got - want)); }
  ok('MK3-06 T2 folgt der Stimmung ebenso (Pelog, Grundton D)', w2 <= .5, M(w2, 3) + ' ct');
  // other octaves (C2, C6 range) also follow: Werckmeister key C at 36..47 and 84..95
  let wo = 0; for (const n of [37, 40, 44, 85, 88, 94]) { const want = W43[5][n % 12], got = meas(prog({scale: 5}, sine), n); wo = Math.max(wo, Math.abs(got - want)); }
  ok('MK3-06 andere Oktaven (Werckmeister, C2 und C6 Lage)', wo <= .5, M(wo, 3) + ' ct');
  // equal temperament bit-equal to MK2 with every key
  let be = 0; for (let key = 0; key < 12; key++) { const p = prog({scale: 0, skey: key}, {o1: {w: 0}, mix: {n: 30}}); be = Math.max(be, maxd(R(p, EVS.slice(0, 8), {sec: .8, file: OLD}), R(p, EVS.slice(0, 8), {sec: .8}))); }
  ok('MK3-06 Gleichstufig mit allen 12 Grundtönen bitgleich zu MK2', be === 0, 'max |Δ| ' + be);
});

T('MK3-07', () => {
  // 40 random Single programs (T2 random as well, tv/split/skey random, scale 0) bit-equal to MK2
  rs = 4242; let worst = 0, bad = [];
  for (let k = 0; k < 40; k++) {
    const p = prog({mode: 0, tv: ri(0, 2), split: ri(0, 127), scale: 0, skey: ri(0, 11)}, randT(), randT());
    const a = render(p, EVS, {sec: 1.5, file: OLD, seed: k + 1}), b = render(p, EVS, {sec: 1.5, file: NEW, seed: k + 1}), m = maxd(a, b);
    if (m > 0) bad.push(k + ':' + m.toExponential(2)); worst = Math.max(worst, m);
  }
  ok('MK3-07 40 Zufalls-Single-Programme (alle Wellen, Rauschen, S/H, PATCH, Unison, Portamento) bitgleich zu MK2', worst === 0, 'max |Δ| ' + worst + (bad.length ? ' ' + bad.slice(0, 5).join(' ') : ''));
});

T('MK3-02', () => {
  const vat = (p, ev, t) => { const r = R(p, ev, {sec: t}); const out = []; r.P.mk.tm.forEach((tm, k) => { for (const v of tm.V) if (v.on && !v.ghost && !(v.fade > 0)) out.push([k + 1, v.note]); }); return out; };
  const tim = (vs, k) => vs.filter(x => x[0] === k).map(x => x[1]).sort((a, b) => a - b).join();
  const four = [[0, 'on', 60, .8], [.05, 'on', 64, .8], [.1, 'on', 67, .8], [.15, 'on', 72, .8]];
  let v = vat(prog({mode: 1, tv: 2}, {}, {prio: 1}), four, .3);
  ok('MK3-02 3+1, T2 Priorität Tiefste: T1 die letzten 3, T2 die tiefste (60)', tim(v, 1) === '64,67,72' && tim(v, 2) === '60', JSON.stringify(v));
  v = vat(prog({mode: 1, tv: 1}, {asg: 2}, {asg: 2}), [[0, 'on', 60, .8]], .2);
  ok('MK3-02 2+2, beide Unison: je 2 gestapelte Stimmen', v.filter(x => x[0] === 1).length === 2 && v.filter(x => x[0] === 2).length === 2, JSON.stringify(v));
  v = vat(prog({mode: 1, tv: 1}, {asg: 1}, {asg: 0}), four, .3);
  ok('MK3-02 2+2, T1 Poly + T2 Mono (Mono-Regel): T1 3 Noten, T2 eine', tim(v, 1) === '64,67,72' && tim(v, 2) === '72', JSON.stringify(v));
  v = vat(prog({mode: 1, tv: 0}, {asg: 2}, {asg: 1}), four, .3);
  ok('MK3-02 1+3, T1 Unison: T1 mono 1 Stimme (letzte Note), T2 drei', tim(v, 1) === '72' && tim(v, 2) === '64,67,72', JSON.stringify(v));
  v = vat(prog({mode: 2, tv: 1, split: 66}), [[0, 'on', 48, .8], [.05, 'on', 52, .8], [.1, 'on', 55, .8], [.15, 'on', 72, .8]], .3);
  ok('MK3-02 Split 2+2: unter dem Split 3 Tasten → T1 nur 2 (Letzte), T2 eine', tim(v, 1) === '52,55' && tim(v, 2) === '72', JSON.stringify(v));
  // nie mehr als 4 (incl. ghosts? report)
  let mx = 0, mxg = 0; const ev = []; for (let k = 0; k < 16; k++) ev.push([k * .03, 'on', 36 + k * 4, .8]);
  for (const top of [{mode: 1, tv: 0}, {mode: 1, tv: 1}, {mode: 1, tv: 2}, {mode: 2, split: 60}, {mode: 2, split: 90, tv: 0}]) for (const [a1, a2] of [[1, 1], [2, 2], [0, 2], [2, 1], [1, 0]])
    for (const t of [.05, .2, .35, .47]) { const r = R(prog(top, {asg: a1}, {asg: a2}), ev, {sec: t}); let n = 0, g = 0; for (const tm of r.P.mk.tm) for (const vv of tm.V) if (vv.on && !vv.ghost && !(vv.fade > 0)) n++; else if (vv.on) g++; mx = Math.max(mx, n); mxg = Math.max(mxg, n + g); }
  ok('MK3-08 nie mehr als 4 klingende Stimmen (16 schnelle Tasten, Dual/Split, Zuweisungs-Paare)', mx <= 4, 'höchstens ' + mx + ' (mit Geistern/Blenden ' + mxg + ')');
});

T('MK3-03', () => {
  const p = prog({mode: 2, split: 60}, {o1: {w: 0}}, {o1: {w: 1}});
  for (const [n, own] of [[36, 1], [59, 1], [60, 2], [61, 2], [96, 2]]) {
    const lv0 = mute(p, own - 1);   // only the other timbre audible
    const r = R(lv0, [[0, 'on', n, .8]], {sec: .5}), a = R(p, [[0, 'on', n, .8]], {sec: .5});
    ok('MK3-03 Split C4: Note ' + n + ' nur T' + own + ' (Gegenseite ≤ −60 dB)', lvl(r, .05, .45) - lvl(a, .05, .45) <= -60, 'Gegenseite ' + M(lvl(r, .05, .45), 1) + ' dB, gesamt ' + M(lvl(a, .05, .45), 1) + ' dB');
  }
});

T('MK3-12', () => {
  // KEYTRACK +48 with Werckmeister III: the self-oscillating filter whistle follows the tuned pitch (vs equal temperament)
  const whistle = {mix: {o1: 0, o2: 0, n: 0}, f: {type: 0, cut: 70, res: 127, kbd: 48}};
  const fq = (sc, n) => { const r = R(prog({scale: sc}, whistle), [[0, 'on', n, .8]], {sec: 1.2}); const pk = peaks(r.l, Math.round(.4 * SR), SR, 32768, 1)[0]; return pk ? pk.f : 0; };
  let worst = 0, info = []; for (let n = 60; n < 72; n++) { const a = fq(0, n), b = fq(5, n), d = 1200 * Math.log2(b / a), e = Math.abs(d - W43[5][n % 12]); worst = Math.max(worst, e); info.push(M(d, 1)); }
  ok('MK3-12 KEYTRACK +48 mit Werckmeister III: Cutoff-Abweichung = W-43 ± 2 ct (Pfeifton der Selbstoszillation)', worst <= 2, 'größte Abweichung ' + M(worst) + ' ct; gemessen ' + info.join(' '));
  // balance
  const ev = [[0, 'on', 60, .8]], base = prog({mode: 1}, {o1: {w: 2}}, {o1: {w: 1}});
  const full = R(base, ev, {sec: .6}), t1off = R(mute(base, 0), ev, {sec: .6});
  const t2only = R((() => { const q = C(base); q.t[0].a.lvl = 0; return q; })(), ev, {sec: .6});
  const diff = {l: full.l.map((x, i) => x - t2only.l[i]), r: full.r.map((x, i) => x - t2only.r[i])};
  void t1off;
  const pz = prog({mode: 1}, {a: {lvl: 0}}, {o1: {w: 1}}); const z = R(pz, ev, {sec: .6});
  // T1 share with T1 PEGEL 0 = render − (T2 only); T2 only = render of a program whose T1 is muted by solo-free means: T1 lvl 0 is the same program, so compare against T2 with T1 in Split far away
  const far = R(prog({mode: 2, split: 0}, {a: {lvl: 0}}, {o1: {w: 1}}), ev, {sec: .6});   // split 0: all notes T2 -> T2 alone
  const sh = {l: z.l.map((x, i) => x - far.l[i]), r: z.r.map((x, i) => x - far.r[i])};
  ok('MK3-12 PEGEL T1 = 0 → T1-Anteil ≤ −60 dB (gegen T2 allein über Split 0)', lvl(sh, .05, .55) - lvl(far, .05, .55) <= -60, 'T1-Anteil ' + M(lvl(sh, .05, .55), 1) + ' dB, T2 ' + M(lvl(far, .05, .55), 1) + ' dB; Kontrolle T1 voll ' + M(lvl(diff, .05, .55), 1) + ' dB');
  const pp = prog({mode: 1}, {a: {pan: -63}, o1: {w: 2}}, {a: {pan: 63}, o1: {w: 1}});
  const a = R(mute(pp, 1), ev, {sec: .6}), b = R(mute(pp, 0), ev, {sec: .6});
  const sA = db(rms(a.l, 4800, 26400)) - db(rms(a.r, 4800, 26400)), sB = db(rms(b.r, 4800, 26400)) - db(rms(b.l, 4800, 26400));
  ok('MK3-12 PAN T1 L63 / T2 R63 → Trennung ≥ 30 dB', sA >= 30 && sB >= 30, 'T1 ' + M(sA, 1) + ' dB, T2 ' + M(sB, 1) + ' dB');
});

T('MK3-13', () => {
  // solo set while both timbres sound (not before the note): after the 5 ms ramp the other ≤ −90 dB
  const p = prog({mode: 1}, {o1: {w: 0}, mix: {n: 40}}, {o1: {w: 1}, mix: {n: 40}}), ev = [[0, 'on', 57, .8], [0, 'on', 64, .8]];
  for (const s of [1, 2]) {
    const x = R(p, ev, {sec: 1, at: [[.3, {mkSolo: s}]], seed: 5}), only = R(mute(p, s === 1 ? 1 : 0), ev, {sec: 1, seed: 5});
    const rest = {l: x.l.map((v, i) => v - only.l[i]), r: x.r.map((v, i) => v - only.r[i])};
    const k = mKlick(x.l, SR, [0]);
    ok('MK3-13 Solo T' + s + ' beim Spielen gesetzt: das andere ≤ −90 dB (ab 20 ms danach), M-KLICK', lvl(rest, .33, .95) - lvl(only, .33, .95) <= -90 && k.ok, 'Rest ' + M(lvl(rest, .33, .95) - lvl(only, .33, .95), 1) + ' dB, Klick ' + M(k.worst, 1) + ' dB');
  }
  // solo in Split: only the soloed side sounds, the other side's notes are silent
  const sp = prog({mode: 2, split: 60}, {o1: {w: 0}}, {o1: {w: 1}});
  const x = R(sp, [[0, 'on', 48, .8], [0, 'on', 72, .8]], {sec: .6, at: [[0, {mkSolo: 2}]]}), o = R(mute(sp, 0), [[0, 'on', 48, .8], [0, 'on', 72, .8]], {sec: .6});
  ok('MK3-13 Solo T2 im Split: T1-Seite ≤ −90 dB', maxd(x, o) < 1e-7, 'max |Δ| ' + maxd(x, o).toExponential(2));
});

T('MK3-09', () => {
  // switching at sounding notes with common sounds: M-KLICK; a single note (no beating) for M-EINBRUCH
  const saw = {o1: {w: 0}, f: {cut: 100, res: 40}}, pad = {o1: {w: 1, c1: 30}, f: {cut: 90}, e2: {a: 40, r: 60}, a: {lvl: 110}};
  const one = [[0, 'on', 60, .8]], two = [[0, 'on', 60, .8], [0, 'on', 72, .8]], ch = [[0, 'on', 48, .8], [0, 'on', 55, .8], [0, 'on', 60, .8], [0, 'on', 64, .8]];
  const rows = []; let all = true;
  const sw = (lab, top, msg, ev, t1, t2, chkE) => { const x = R(prog(top, t1, t2), ev, {sec: 1.2, at: [[.5, {mkSet: msg}]]}); const k = mKlick(x.l, SR, [0]), e = mEinbruch(x.l, SR, .5);
    const good = k.ok && (!chkE || e.ok); if (!good) all = false; rows.push(lab + ' K' + M(k.worst, 1) + (chkE ? ' E' + M(e.worst, 2) : '') + (good ? '' : ' ✗')); };
  for (const [nm, t1, t2] of [['saw/saw', saw, saw], ['saw/pad', saw, pad], ['pad/saw', pad, saw]]) {
    sw(nm + ' 1→Schicht (1 Note)', {mode: 0}, {mode: 1}, one, t1, t2, true);
    sw(nm + ' Schicht→1 (1 Note)', {mode: 1}, {mode: 0}, one, t1, t2, true);
    sw(nm + ' Schicht→Split 61 (1 Note bleibt T1)', {mode: 1}, {mode: 2, split: 61}, one, t1, t2, true);
    sw(nm + ' Schicht→Split 60 (1 Note → T2)', {mode: 1}, {mode: 2, split: 60}, one, t1, t2, true);
    sw(nm + ' Split 61→60 (Note wechselt T1→T2)', {mode: 2, split: 61}, {split: 60}, one, t1, t2, true);
    sw(nm + ' Split 60→61 (Note wechselt T2→T1)', {mode: 2, split: 60}, {split: 61}, one, t1, t2, true);
    sw(nm + ' 2+2→1+3 Oktave', {mode: 1, tv: 1}, {tv: 0}, two, t1, t2, true);
    sw(nm + ' 1+3→3+1 Akkord', {mode: 1, tv: 0}, {tv: 2}, ch, t1, t2, false);
    sw(nm + ' 2+2→3+1 Akkord', {mode: 1, tv: 1}, {tv: 2}, ch, t1, t2, false);
    sw(nm + ' Einzeln→Split Akkord', {mode: 0}, {mode: 2, split: 57}, ch, t1, t2, false);
  }
  ok('MK3-09 Umschalten MODUS/STIMMEN/SPLIT bei klingenden Noten: M-KLICK ≤ 6 dB, M-EINBRUCH ≥ −3 dB (1 Note / Oktave)', all, rows.filter(r => /✗/.test(r)).join(' | ') || rows.slice(0, 6).join(' | '));
});

console.log(fails ? fails + ' FEHLER' : 'alles bestanden');
process.exit(fails ? 1 : 0);
