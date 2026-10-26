// MK3 (Nachtrag 3 MK3) in Node with the app's worklet text: MK3-01 Dual = sum, MK3-02 voice split, MK3-03 split (audio),
// MK3-07 bit-equal to MK2, MK3-08 CPU, MK3-09 switching (M-KLICK / M-EINBRUCH), MK3-12 balance, MK3-13 solo (audio).
// Usage: MK_FILE=<new index.html> MK_OLD=<MK2 index.html> node v3-mk3-timbre.mjs   (ONLY=<regex>)
import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms, peak, mKlick, mEinbruch} from './v3-mk1-ana.mjs';
import {cpu} from './v3-mk3-cpu.mjs';
const NEW = process.env.MK_FILE || new URL('../mk-br-MK3/index.html', import.meta.url).pathname;
const OLD = process.env.MK_OLD || new URL('../synq-snapshots/MK2.html', import.meta.url).pathname;
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null, SR = 48000;
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e)); } };
const M = (x, d) => Math.round(x * 10 ** (d == null ? 1 : d)) / 10 ** (d == null ? 1 : d);
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
// a program: top-level fields, t1 / t2 partial timbres
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
const R = (p, ev, o) => render(p, ev, Object.assign({file: NEW, sec: 1}, o || {}));
const maxd = (a, b) => { let m = 0; for (let i = 0; i < a.l.length; i++) m = Math.max(m, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i])); return m; };
const sumd = (d, a, b) => { let m = 0; for (let i = 0; i < d.l.length; i++) m = Math.max(m, Math.abs(d.l[i] - a.l[i] - b.l[i]), Math.abs(d.r[i] - a.r[i] - b.r[i])); return m; };
const lvl = (x, t0, t1) => db(rms(x.l, Math.round(t0 * SR), Math.round(t1 * SR)) + rms(x.r, Math.round(t0 * SR), Math.round(t1 * SR)));
// voices that sound at time t (from the processor after rendering up to t): [[timbre, note, pitch], ...]
function voicesAt(p, ev, t) {
  const r = R(p, ev, {sec: t}); const out = [];
  r.P.mk.tm.forEach((tm, k) => { for (const v of tm.V) if (v.on && !v.ghost) out.push([k + 1, v.note, v.pitch]); });
  return out;
}
const tim = (vs, k) => vs.filter(x => x[0] === k).map(x => x[1]).sort((a, b) => a - b);
const TT1 = {o1: {w: 0}, mix: {o1: 110, o2: 0, n: 40}, f: {type: 0, cut: 90, res: 50, eg: 30}, l1: {w: 3, f: 100, ks: 2}, l2: {w: 3, f: 70}, p: [{s: 2, d: 4, i: 30}, {s: 3, d: 6, i: 20}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}], a: {pan: -20}};
const TT2 = {o1: {w: 6, c1: 40, c2: 50}, mix: {o1: 100, o2: 60, n: 50}, o2: {w: 1, semi: 7}, f: {type: 1, cut: 70, res: 80}, l1: {w: 3, f: 90, ks: 1}, l2: {w: 3, f: 80}, p: [{s: 3, d: 2, i: 40}, {s: 2, d: 6, i: 30}, {s: 0, d: 4, i: 20}, {s: 4, d: 5, i: 0}], a: {pan: 30, lvl: 100}};
const CH = [[.02, 'on', 48, .8], [.05, 'on', 55, .7], [.4, 'off', 48], [.6, 'on', 60, .9], [.9, 'off', 55], [1.1, 'off', 60]];

T('MK3-01', () => {
  // Dual = the sum of the timbres rendered alone (solo renders run both timbres and mute one: the same seed per timbre)
  for (const [tv, ev, lab] of [[1, CH, '2+2'], [0, CH, '1+3'], [2, CH, '3+1']]) {
    const p = prog({mode: 1, tv}, TT1, TT2), d = R(p, ev, {sec: 1.5}), a = R(p, ev, {sec: 1.5, at: [[0, {mkSolo: 1}]]}), b = R(p, ev, {sec: 1.5, at: [[0, {mkSolo: 2}]]});
    const m = sumd(d, a, b);
    ok('MK3-01 Dual ' + lab + ' = Summe der Einzel-Renders (Rauschen, S/H, PATCH; ≤ 1e-4)', m <= 1e-4 && peak(d.l) > .01, 'max |Δ| ' + m.toExponential(2) + ', Spitze ' + M(db(peak(d.l))) + ' dBFS');
  }
  // the other way: each timbre with the other's mixer at 0 (no solo involved); same seed, the random of a timbre does not depend on the other
  const ev = [[.02, 'on', 48, .8], [.3, 'on', 64, .7], [.8, 'off', 48], [1, 'off', 64]];
  const p = prog({mode: 1, tv: 1}, TT1, TT2), d = R(p, ev, {sec: 1.3});
  const a = R(prog({mode: 1, tv: 1}, TT1, merge(JSON.parse(JSON.stringify(TT2)), {a: {lvl: 0}})), ev, {sec: 1.3});
  const b = R(prog({mode: 1, tv: 1}, merge(JSON.parse(JSON.stringify(TT1)), {a: {lvl: 0}}), TT2), ev, {sec: 1.3});
  const m = sumd(d, a, b);
  ok('MK3-01 Dual = T1 allein (T2 PEGEL 0) + T2 allein (T1 PEGEL 0), gleicher Seed', m <= 1e-4, 'max |Δ| ' + m.toExponential(2));
  // Dual with seed 7 vs seed 7 again: deterministic
  const s1 = R(p, ev, {sec: 1.3, seed: 7}), s2 = R(p, ev, {sec: 1.3, seed: 7}), s3 = R(p, ev, {sec: 1.3, seed: 8});
  ok('MK3-01 gleicher Seed = gleicher Render, anderer Seed ≠', maxd(s1, s2) === 0 && maxd(s1, s3) > 1e-3, maxd(s1, s2) + ' / ' + M(maxd(s1, s3), 4));
});

T('MK3-02', () => {
  const tri = [[0, 'on', 60, .8], [.05, 'on', 64, .8], [.1, 'on', 67, .8]], four = tri.concat([[.15, 'on', 72, .8]]);
  let v = voicesAt(prog({mode: 1, tv: 0}), tri, .3);
  ok('MK3-02 1+3 Dreiklang: T1 nur die letzte Note (mono), T2 alle drei', tim(v, 1).join() === '67' && tim(v, 2).join() === '60,64,67', JSON.stringify([tim(v, 1), tim(v, 2)]));
  v = voicesAt(prog({mode: 1, tv: 1}), four, .3);
  ok('MK3-02 2+2 Vierklang (Priorität Letzte): je die letzten 2', tim(v, 1).join() === '67,72' && tim(v, 2).join() === '67,72', JSON.stringify([tim(v, 1), tim(v, 2)]));
  v = voicesAt(prog({mode: 1, tv: 1}, {prio: 1}, {prio: 2}), four, .3);
  ok('MK3-02 2+2 Vierklang: T1 Tiefste → 60, 64; T2 Höchste → 67, 72', tim(v, 1).join() === '60,64' && tim(v, 2).join() === '67,72', JSON.stringify([tim(v, 1), tim(v, 2)]));
  v = voicesAt(prog({mode: 1, tv: 2}), tri, .3);
  ok('MK3-02 3+1 spiegelbildlich: T1 alle drei, T2 nur die letzte', tim(v, 1).join() === '60,64,67' && tim(v, 2).join() === '67', JSON.stringify([tim(v, 1), tim(v, 2)]));
  v = voicesAt(prog({mode: 1, tv: 1}, {asg: 2, udet: 30}), [[0, 'on', 60, .8]], .2);
  const u1 = v.filter(x => x[0] === 1);
  ok('MK3-02 Unison in Dual 2+2 (T1 Unison): 2 gestapelte Stimmen (±d/2), T2 eine', u1.length === 2 && u1.every(x => x[1] === 60) && tim(v, 2).join() === '60', JSON.stringify(v.map(x => [x[0], x[1], M(x[2], 3)])));
  v = voicesAt(prog({mode: 1, tv: 1}, {asg: 0}, {asg: 1}), four, .3);
  ok('MK3-02 STIMMEN 2+2, T1 Mono, T2 Poly, 4 Tasten: T1 eine Note, T2 drei (Mono-Regel 1/3)', tim(v, 1).join() === '72' && tim(v, 2).join() === '64,67,72', JSON.stringify([tim(v, 1), tim(v, 2)]));
  v = voicesAt(prog({mode: 1, tv: 0}, {asg: 2}, {asg: 0}), [[0, 'on', 60, .8], [.05, 'on', 64, .8]], .2);
  ok('MK3-02 T1 Unison, T2 Mono: T1 2 gestapelte Stimmen, T2 eine', v.filter(x => x[0] === 1).length === 2 && v.filter(x => x[0] === 1).every(x => x[1] === 64) && tim(v, 2).join() === '64', JSON.stringify(v.map(x => x.slice(0, 2))));
  v = voicesAt(prog({mode: 1, tv: 1}, {asg: 0}, {asg: 0}), four, .3);
  ok('MK3-02 beide Mono: 1 + 1', tim(v, 1).join() === '72' && tim(v, 2).join() === '72', JSON.stringify([tim(v, 1), tim(v, 2)]));
  v = voicesAt(prog({mode: 2, tv: 1, split: 60}, {asg: 1}, {asg: 0}), [[0, 'on', 48, .8], [.02, 'on', 52, .8], [.04, 'on', 55, .8], [.06, 'on', 72, .8]], .3);
  ok('MK3-02 Split, T1 Poly neben T2 Mono: T1 3 Stimmen, T2 eine', tim(v, 1).join() === '48,52,55' && tim(v, 2).join() === '72', JSON.stringify([tim(v, 1), tim(v, 2)]));
  // after release of the newest key the held one comes back (priority, MK1)
  v = voicesAt(prog({mode: 1, tv: 0}), tri.concat([[.2, 'off', 67]]), .35);
  ok('MK3-02 1+3: Taste 67 los → T1 spielt wieder 64 (letzte gehaltene)', tim(v, 1).join() === '64' && tim(v, 2).join() === '60,64', JSON.stringify([tim(v, 1), tim(v, 2)]));
});

T('MK3-03', () => {
  const p = prog({mode: 2, split: 60}, {o1: {w: 0}}, {o1: {w: 1}});
  for (const [n, own] of [[48, 1], [60, 2], [59, 1], [72, 2]]) {
    const ev = [[0, 'on', n, .8]], a = R(p, ev, {sec: .5, at: [[0, {mkSolo: own}]]}), b = R(p, ev, {sec: .5, at: [[0, {mkSolo: 3 - own}]]});
    const la = lvl(a, .05, .45), lb = lvl(b, .05, .45);
    ok('MK3-03 Split C4: Note ' + n + ' nur T' + own + ' (das andere ≤ −60 dB)', la > -40 && lb - la <= -60, 'T' + own + ' ' + M(la) + ' dB, T' + (3 - own) + ' ' + M(lb) + ' dB');
  }
});

T('MK3-07', () => {
  // Single sounds of MK1 / MK2 bit-equal to the predecessor (MK2 4.10.0); also with a scale key but Gleichstufig, and T2 set
  const ev = [[0, 'on', 48, .8], [.05, 'on', 52, .7], [.1, 'on', 55, .9], [.15, 'on', 60, .8], [.2, 'on', 64, .8], [.6, 'off', 52], [.8, 'off', 48], [1.0, 'off', 55], [1.0, 'off', 60], [1.1, 'off', 64]];
  const cases = [{}, {asg: 0}, {asg: 2, udet: 40}, {asg: 0, porta: 60, trig: 0}, {prio: 1, f: {type: 1, cut: 70, res: 100, eg: 30, vel: 10, kbd: 48}},
    {mix: {o1: 100, o2: 80, n: 30}, o2: {w: 1, mod: 2, semi: 7, tune: 5}, l1: {w: 3, ks: 2, f: 90}},
    {o1: {w: 3, c1: 60, c2: 30}, mix: {o1: 127, o2: 90}, o2: {w: 2, semi: 12}}, {o1: {w: 4, c1: 50, c2: 20}}, {o1: {w: 6, c1: 30, c2: 90}, l2: {w: 3, f: 100}},
    {p: [{s: 2, d: 4, i: 40}, {s: 3, d: 6, i: -30}, {s: 4, d: 0, i: 10}, {s: 5, d: 5, i: 20}], a: {dist: 1, kbd: 20, vel: 30, pan: -40}},
    {o1: {w: 1, c1: 40, c2: 60}, e1: {a: 20, d: 50, s: 60, r: 40, rst: 0}, e2: {a: 10, d: 80, s: 90, r: 60, rst: 0}, l1: {w: 1, sync: 1, note: 3}, f: {type: 2, cut: 80}}];
  let worst = 0, bad = [];
  for (const c of cases) for (const top of [{}, {skey: 5}, {tv: 2, split: 30}]) {
    const p = prog(top, c, TT2), a = render(p, ev, {sec: 1.6, file: OLD}), b = render(p, ev, {sec: 1.6, file: NEW});
    const m = maxd(a, b); if (m > 0) bad.push(JSON.stringify(c).slice(0, 40) + JSON.stringify(top) + ' ' + m); worst = Math.max(worst, m);
  }
  ok('MK3-07 Single-Klänge (11 Patches × 3 Programm-Varianten, Rauschen, S/H, PATCH, Sync) bitgleich zu MK2 (4.10.0)', worst === 0, 'max |Δ| ' + worst + (bad.length ? ' ' + bad.slice(0, 3).join(' | ') : ''));
  // VA bit-equal
  const VA = {eng: 0}; const va = (f) => render(null, [[0, 'on', 60, .8], [.3, 'on', 64, .8], [.6, 'off', 60], [.8, 'off', 64]], {sec: 1, eng: 0, flat: {}, file: f});
  ok('MK3-07 VA-Klang bitgleich zu MK2', maxd(va(OLD), va(NEW)) === 0, 'max |Δ| ' + maxd(va(OLD), va(NEW)));
});

T('MK3-08', () => {
  // CPU: Dual 2+2 (2 keys → 4 voices) <= 1.05 x Single with 4 voices (4 keys); the same timbre; Node. The machine is shared with
  // other builds: per run the median quantum of the steady part (2..6 s) and the process CPU time; over 7 interleaved runs the minimum
  const c = cpu(7), r = Math.min(c.ratioQ, c.ratioCpu);
  ok('MK3-08 CPU: Dual 2+2 ≤ 1,05 × Single mit 4 Stimmen (Node, Minimum aus 7 verschachtelten Läufen)', r <= 1.05, 'Quantum Dual ' + M(c.q[1] * 1000, 2) + ' µs / Single ' + M(c.q[0] * 1000, 2) + ' µs → ' + M(c.ratioQ, 3) + ' ×; CPU-Zeit ' + M(c.cpu[1], 0) + ' / ' + M(c.cpu[0], 0) + ' ms → ' + M(c.ratioCpu, 3) + ' ×; Mediane ' + M(c.ratioMed, 3) + ' ×');
  // never more than 4 voices sound (dual + split + stealing with many keys)
  let mx = 0; const ev = []; for (let k = 0; k < 12; k++) ev.push([k * .05, 'on', 40 + k * 3, .8]);
  for (const top of [{mode: 1, tv: 0}, {mode: 1, tv: 1}, {mode: 1, tv: 2}, {mode: 2, split: 55}]) for (const [a1, a2] of [[1, 1], [2, 1], [0, 1], [2, 2], [2, 0]]) {
    const p = prog(top, {asg: a1}, {asg: a2});
    for (const t of [.1, .3, .58]) { const r = R(p, ev, {sec: t}); let n = 0; for (const tm of r.P.mk.tm) for (const v of tm.V) if (v.on && !v.ghost && !(v.fade > 0)) n++; mx = Math.max(mx, n); }
  }
  ok('MK3-08 nie mehr als 4 klingende Stimmen (Dual/Split, alle Zuweisungen, 12 Tasten; eine gestohlene Stimme in ihrer 5-ms-Blende zählt nicht, wie MK1)', mx <= 4, 'höchstens ' + mx);
});

T('MK3-09', () => {
  // MODUS and STIMMEN at sounding notes: M-KLICK always, M-EINBRUCH (engXf rule, voices kept)
  const chord = [[0, 'on', 57, .8], [0, 'on', 61, .8], [0, 'on', 64, .8]];
  // two different timbres (identical ones would cancel or add by their random phase: no real sound does that)
  const base = {o1: {w: 2}, f: {cut: 100}}, base2 = {o1: {w: 1, c1: 40}, f: {cut: 90}, trans: 12, a: {lvl: 110}}, rows = [];
  // M-KLICK with the chord; M-EINBRUCH with an octave chord 69/81/93 (no beating inside the 5 ms windows; a chord of
  // unrelated notes swings ±4 dB from window to window by itself). The split points are moved so that one key changes timbre.
  const oct = [[0, 'on', 69, .8], [0, 'on', 81, .8], [0, 'on', 93, .8]];
  const sw = (top, msg, lab, top2, msg2) => {
    const p = prog(top, base, base2), x = R(p, chord, {sec: 1, at: [[.5, {mkSet: msg}]]});
    const y = R(prog(top2 || top, base, base2), oct, {sec: 1, at: [[.5, {mkSet: msg2 || msg}]]});
    const k = mKlick(x.l, SR, [0]), k2 = mKlick(y.l, SR, [0]), e = mEinbruch(y.l, SR, .5);
    rows.push([lab, M(Math.max(k.worst, k2.worst)), M(e.worst, 2), M(e.step, 1)]);
    return k.ok && k2.ok && e.ok;
  };
  let all = true;
  all = sw({mode: 0}, {mode: 1}, 'Einzeln→Schicht') && all;
  all = sw({mode: 1}, {mode: 0}, 'Schicht→Einzeln') && all;
  all = sw({mode: 1}, {mode: 2, split: 60}, 'Schicht→Split', null, {mode: 2, split: 80}) && all;
  all = sw({mode: 2, split: 60}, {mode: 1}, 'Split→Schicht', {mode: 2, split: 80}) && all;
  all = sw({mode: 0}, {mode: 2, split: 62}, 'Einzeln→Split', null, {mode: 2, split: 82}) && all;
  all = sw({mode: 1, tv: 1}, {tv: 0}, 'STIMMEN 2+2→1+3') && all;
  all = sw({mode: 1, tv: 0}, {tv: 2}, 'STIMMEN 1+3→3+1') && all;
  all = sw({mode: 2, split: 60}, {split: 62}, 'SPLIT 60→62', {mode: 2, split: 80}, {split: 82}) && all;
  all = sw({mode: 1, tv: 1}, {'t.1.asg': 0}, 'T2 Poly→Mono (Dual)') && all;
  ok('MK3-09 Umschalten bei klingenden Noten: M-KLICK ≤ +6 dB, M-EINBRUCH ≥ −3 dB', all, rows.map(r => r.join(' ')).join(' | '));
  // no hanging note after switching with keys held and released
  const p = prog({mode: 1, tv: 1}, base, base), r = R(p, chord.concat([[.6, 'off', 57], [.6, 'off', 61], [.6, 'off', 64]]), {sec: 2, at: [[.3, {mkSet: {mode: 2, split: 60}}], [.45, {mkSet: {tv: 0}}], [.5, {mkSet: {mode: 0}}]]});
  const tail = lvl(r, 1.8, 2), ended = r.msgs.filter(m => m.end).map(m => m.end).flat().sort().join();
  ok('MK3-09 nach dem Loslassen keine hängende Note, alle 3 Noten gemeldet', tail < -90 && ended.split(',').length >= 3, 'Rest ' + M(tail) + ' dB, Ende ' + ended);
});

T('MK3-12', () => {
  const ev = [[0, 'on', 60, .8]];
  const pz = prog({mode: 1}, {a: {lvl: 0}}, {o1: {w: 1}}), d = R(pz, ev, {sec: .5}), t2 = R(pz, ev, {sec: .5, at: [[0, {mkSolo: 2}]]});
  const t1share = lvl({l: d.l.map((x, i) => x - t2.l[i]), r: d.r.map((x, i) => x - t2.r[i])}, .05, .45), l2 = lvl(t2, .05, .45);
  ok('MK3-12 PEGEL T1 = 0 → T1-Anteil ≤ −60 dB', t1share - l2 <= -60, 'T1-Anteil ' + M(t1share) + ' dB, T2 ' + M(l2) + ' dB');
  const pp = prog({mode: 1}, {a: {pan: -63}}, {a: {pan: 63}, o1: {w: 1}});
  const a = R(pp, ev, {sec: .5, at: [[0, {mkSolo: 1}]]}), b = R(pp, ev, {sec: .5, at: [[0, {mkSolo: 2}]]});
  const r = (x, ch) => db(rms(x[ch], 2400, 21600));
  const sA = r(a, 'l') - r(a, 'r'), sB = r(b, 'r') - r(b, 'l');
  ok('MK3-12 PAN T1 L63 / T2 R63 → Trennung ≥ 30 dB', sA >= 30 && sB >= 30, 'T1 L−R ' + M(sA) + ' dB, T2 R−L ' + M(sB) + ' dB');
});

T('MK3-13', () => {
  const p = prog({mode: 1}, {o1: {w: 0}}, {o1: {w: 1}}), ev = [[0, 'on', 60, .8]];
  const a = R(p, ev, {sec: .5, at: [[0, {mkSolo: 1}]]}), b = R(p, ev, {sec: .5, at: [[0, {mkSolo: 2}]]});
  const d = R(p, ev, {sec: .5}), only2 = {l: d.l.map((x, i) => x - a.l[i]), r: d.r.map((x, i) => x - a.r[i])};
  // with solo T1 the T2 share in the solo render = the solo render minus the T1-only render (T2 level 0)
  const t1only = R(prog({mode: 1}, {o1: {w: 0}}, {o1: {w: 1}, a: {lvl: 0}}), ev, {sec: .5});
  const rest = lvl({l: a.l.map((x, i) => x - t1only.l[i]), r: a.r.map((x, i) => x - t1only.r[i])}, .05, .45);
  ok('MK3-13 SHIFT + TIMBRE (Solo T1): T2 ≤ −90 dB', rest - lvl(a, .05, .45) <= -90 || rest <= -120, 'T2-Rest ' + M(rest) + ' dB, T1 ' + M(lvl(a, .05, .45)) + ' dB');
  // solo on / off while playing: 5 ms ramps, no click
  const x = R(p, [[0, 'on', 57, .8], [0, 'on', 64, .8]], {sec: 1.2, at: [[.4, {mkSolo: 2}], [.8, {mkSolo: 0}]]});
  const k = mKlick(x.l, SR, [0]);
  ok('MK3-13 Solo an/aus beim Spielen: M-KLICK ≤ +6 dB', k.ok, M(k.worst) + ' dB bei ' + M(k.at, 3) + ' s');
});

console.log(fails ? fails + ' FEHLER' : 'alles bestanden');
process.exit(fails ? 1 : 0);
