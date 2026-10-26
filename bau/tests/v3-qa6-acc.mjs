// QA (acceptance lens) MK6: independent Node checks of edge cases around MK6-02/04/05/06/09/10/14.
// Usage: MK_FILE=<index.html> MK_PREV=<prev.html> node v3-qa6-acc.mjs   (ONLY=<regex>)
import {render, mkPatch} from './v3-mk2-node.mjs';
import {db, rms} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE, PREV = process.env.MK_PREV;
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { console.log('ERR ' + id + ' ' + (e.stack || e)); } };
const log = (id, c, info) => console.log((c ? 'PASS ' : 'FAIL ') + id + ' — ' + info);
const Z = () => new Array(16).fill(0);
const Q = (k, m, v) => ({k, m: m == null ? 1 : m, v: v ? v.concat(Z()).slice(0, 16) : Z()});
const SP = (t, sq, ti) => { const p = mkPatch(t || {}); const q = (sq.q || []).concat([Q(0), Q(0), Q(0)]).slice(0, 3); p.t[ti || 0].seq = Object.assign({on: 1, last: 16, type: 0, run: 1, ks: 1, res: 3}, sq, {q}); return p; };
const R = (p, ev, o) => render(p, ev, Object.assign({file: FILE}, o || {}));
const GATE = {a: {gate: 1, lvl: 64}};
const scopes = r => r.msgs.filter(m => m.mkScope).map(m => m.mkScope);
const SC = [0, {mkScope: true}];
const maxd = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) d = Math.max(d, Math.abs(a[i] - b[i])); return d; };

// 1. Seq OFF with populated sequences (non-zero values on many targets incl. step length) = bit-equal to the predecessor
T('Q1 seq aus mit Werten', () => {
  const ev = [[0, 'on', 48, .8], [.05, 'on', 55, .7], [.1, 'on', 64, .9], [.6, 'off', 48], [.7, 'off', 55], [.8, 'off', 64]];
  let w = 0, n = 0;
  for (const tg of [[1, 2, 11], [15, 16, 12], [17, 21, 24], [3, 4, 5], [6, 7, 8], [9, 10, 13], [14, 25, 26], [27, 28, 29], [30, 22, 18]]) for (const ks of [0, 1, 2]) {
    const vals = [40, -40, 20, -63, 63, 5, -5, 10, 0, 33, -33, 60, -60, 1, -1, 50];
    const pm = SP({porta: 30, l1: {f: 90}, p: [{s: 2, d: 4, i: 30}, {s: 0, d: 1, i: 20}, {s: 3, d: 2, i: 0}, {s: 4, d: 5, i: 10}]}, {on: 0, ks, q: tg.map((k, j) => Q(k, j & 1, vals.map(x => x * (j + 1) % 64)))});
    const pb = mkPatch({porta: 30, l1: {f: 90}, p: [{s: 2, d: 4, i: 30}, {s: 0, d: 1, i: 20}, {s: 3, d: 2, i: 0}, {s: 4, d: 5, i: 10}]});
    const a = R(pm, ev, {sec: 1.2, mw0: .6, songStart: ks === 0 ? 0 : null}), b = render(pb, ev, {sec: 1.2, mw0: .6, file: PREV, songStart: ks === 0 ? 0 : null});
    w = Math.max(w, maxd(a.l, b.l), maxd(a.r, b.r)); n++;
  }
  log('Q1 Seq aus (Werte gefüllt) bitgleich', w === 0, n + ' Renders, max |Δ| ' + w);
});

// 2. Einmal + Glatt: after the last step the value stays exactly (and equals the last step value)
T('Q2 Einmal Glatt', () => {
  const v = [63, -63, 30, -20, 10, 50, 0, 0];
  const g = R(SP(GATE, {last: 5, run: 0, res: 3, q: [Q(15, 0, v)]}), [[0, 'on', 69, .8]], {sec: 1.5, tap: 'gain'}).l;
  const end = 5 * 6000; let mv = 0; for (let i = end + 64; i < g.length; i++) mv = Math.max(mv, Math.abs(g[i] - g[end + 64]));
  const ref = R(SP(GATE, {last: 5, run: 0, res: 3, q: [Q(15, 1, [10, 10, 10, 10, 10])]}), [[0, 'on', 69, .8]], {sec: .3, tap: 'gain'}).l[8000];
  // inside the last step (step 5: 0.5 .. 0.625 s): should it ramp toward step 1 (63) ? print the level at its start / middle / end
  const lv = i => 127 * Math.sqrt(g[i] / R(mkPatch({a: {gate: 1, lvl: 127}}), [[0, 'on', 69, .8]], {sec: .2, tap: 'gain'}).l[4000]) - 64;
  log('Q2 Einmal+Glatt hält nach dem letzten Schritt', mv === 0 && Math.abs(g[end + 64] - ref) < 1e-6, 'Abweichung nach Ende ' + mv + ' · Pegel nach Ende ' + lv(end + 64).toFixed(2) + ' (Schritt 5 = 10) · in Schritt 5: Anfang ' + lv(24000 + 100).toFixed(2) + ' Mitte ' + lv(27000).toFixed(2) + ' Ende ' + lv(29990).toFixed(2));
});

// 3. Glatt + Rückwärts / Wechsel: the ramp goes to the next step in play order
T('Q3 Glatt Rückwärts', () => {
  const v = [0, 10, 20, 30, 40, 50, 60, 63, 0, 0, 0, 0, 0, 0, 0, 0];
  const g127 = R(mkPatch({a: {gate: 1, lvl: 127}}), [[0, 'on', 69, .8]], {sec: .2, tap: 'gain'}).l[4000];
  for (const [ty, name, ord] of [[1, 'Rückwärts', [7, 6, 5, 4, 3, 2, 1, 0]], [2, 'Wechsel 1', [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1]]]) {
    const g = R(SP(GATE, {last: 8, type: ty, res: 3, q: [Q(15, 0, v)]}), [[0, 'on', 69, .8]], {sec: 2, tap: 'gain'}).l;
    let worst = 0; const pts = [];
    for (let k = 0; k < ord.length - 1; k++) { const i = k * 6000 + 2999 + 16 - ((k * 6000 + 3000) % 16), u = ((i + 1) / SR - k * .125) / .125, a = v[ord[k]], b = v[ord[k + 1]], exp = a + (b - a) * u;
      const val = 127 * Math.sqrt(g[i] / g127) - 64; worst = Math.max(worst, Math.abs(val - exp)); pts.push(val.toFixed(1) + '/' + exp.toFixed(1)); }
    log('Q3 Glatt ' + name, worst <= 1.26, 'Mitte gemessen/erwartet: ' + pts.join(' ') + ' · max ' + worst.toFixed(2));
  }
});

// 4. every target is audible (value +40 / -40 against 0)
T('Q4 Ziele hörbar', () => {
  const base = {o1: {w: 1, c1: 40, c2: 40}, o2: {w: 0, semi: 0, tune: 0}, mix: {o1: 100, o2: 60, n: 20}, f: {cut: 64, res: 40, eg: 20, kbd: 20}, a: {lvl: 90, pan: 0},
    e1: {a: 30, d: 60, s: 40, r: 40}, e2: {a: 20, d: 60, s: 80, r: 40}, l1: {f: 60}, l2: {f: 60}, vib: 40, porta: 0,
    p: [{s: 2, d: 4, i: 30}, {s: 0, d: 4, i: 30}, {s: 3, d: 0, i: 10}, {s: 4, d: 5, i: 20}]};
  const ev = [[0, 'on', 57, .8], [.4, 'off', 57], [.45, 'on', 64, .8], [.9, 'off', 64], [.92, 'on', 60, .8], [1.4, 'off', 60]];
  const ref = R(mkPatch(base), ev, {sec: 1.8});
  const out = [];
  for (let tg = 1; tg <= 30; tg++) {
    if (tg === 2) continue;
    const vv = tg === 1 || tg === 6 ? 7 : 40;
    const a = R(SP(base, {res: 3, q: [Q(tg, 1, new Array(16).fill(vv))]}), ev, {sec: 1.8}), b = R(SP(base, {res: 3, q: [Q(tg, 1, new Array(16).fill(-vv))]}), ev, {sec: 1.8});
    const d = new Float32Array(a.l.length); for (let i = 0; i < d.length; i++) d[i] = a.l[i] - ref.l[i] + a.r[i] - ref.r[i];
    const d2 = new Float32Array(a.l.length); for (let i = 0; i < d.length; i++) d2[i] = b.l[i] - ref.l[i] + b.r[i] - ref.r[i];
    const r0 = rms(ref.l) + rms(ref.r), x = db(rms(d) / r0), y = db(rms(d2) / r0);
    out.push([tg, x, y]);
  }
  const bad = out.filter(([, x, y]) => x < -30 && y < -30);
  log('Q4 alle Ziele ändern den Klang', !bad.length, out.map(([t, x, y]) => t + ':' + x.toFixed(0) + '/' + y.toFixed(0)).join(' ') + ' dB (Differenz gegen Seq-frei, +/−)' + (bad.length ? ' · ohne Wirkung: ' + bad.map(b => b[0]).join(',') : ''));
});

// 5. step length extremes: res 0 with -6 everywhere, res 15 with +6: finite, durations clamped
T('Q5 Schrittlänge Extrem', () => {
  const a = R(SP(GATE, {res: 0, q: [Q(2, 1, new Array(16).fill(-6)), Q(15, 1, Array.from({length: 16}, (_, i) => i & 1 ? 40 : -40))]}), [[0, 'on', 69, .8]], {sec: .5, tap: 'gain'}).l;
  let bad = 0; for (const x of a) if (!Number.isFinite(x)) bad++;
  let e = 0; for (let i = 1; i < a.length; i++) if (Math.abs(a[i] - a[i - 1]) > 1e-6 && Math.abs(a[i - 1] - a[i - 2]) < 1e-9) e++;
  log('Q5 −6 bei 1/48 endlich', bad === 0, 'NaN ' + bad + ', Stufen in 0,5 s: ' + e + ' (1/48 = 41,7 ms → ≈ 12)');
});

// 6. KEY SYNC aus + Einmal: starts at song beat 0 and holds after C (song started at 0 s, note at 3 s; C = 16 x 1/16 = 4 beats = 2 s)
T('Q6 aus Einmal', () => {
  const r = R(SP({}, {ks: 0, run: 0, res: 3, q: [Q(11, 1, Array.from({length: 16}, (_, i) => i + 1))]}), [[.5, 'on', 60, .8], [3.5, 'off', 60]], {sec: 3.6, songStart: 0, at: [SC]});
  const L = scopes(r).map(m => [m.t.toFixed(2), m.seq[0].step, m.seq[0].done]);
  const at = t => L.find(x => +x[0] >= t);
  log('Q6 KEY SYNC aus + Einmal', at(.6)[1] === 5 && at(2.5)[1] === 16 && at(3.2)[1] === 16, 'Schritt bei 0,6 s ' + at(.6)[1] + ' (erw. 5 = Schlag 1,2), bei 2,5 s ' + at(2.5)[1] + ' (erw. 16, gehalten), 3,2 s ' + at(3.2)[1]);
});

// 7. KEY SYNC aus, song stopped: free running (a second note does not restart)
T('Q7 aus frei', () => {
  const r = R(SP({}, {ks: 0, res: 3, q: [Q(11, 1, Array.from({length: 16}, (_, i) => i + 1))]}), [[0, 'on', 60, .8], [.2, 'off', 60], [.6, 'on', 62, .8], [.9, 'off', 62]], {sec: 1, at: [SC]});
  const L = scopes(r).map(m => [m.t, m.seq[0].step]);
  const s = t => (L.find(x => x[0] >= t) || [0, -1])[1];
  log('Q7 KEY SYNC aus ohne Song frei laufend', s(.65) !== 1, 'Schritt bei 0,65 s (Note 2 bei 0,6 s): ' + s(.65) + ' · 0,1 s: ' + s(.1) + ' · 0,4 s: ' + s(.4));
});

// 8. EG times: KEY SYNC Timbre, A-HK ATTACK +63 only at step 1; a note after an earlier one that ended on step 5: the attack must be long
T('Q8 Attack Schritt 1', () => {
  const eg = {e2: {a: 0, d: 64, s: 127, r: 0}, a: {lvl: 100}};
  const v = [63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  // note 1 0..0.55 s (to step 5), all keys up, note 2 at 1.0 s; step 1 starts again with note 2 -> attack +63
  const g = R(SP(eg, {ks: 1, res: 3, q: [Q(21, 1, v)]}), [[0, 'on', 69, .8], [.55, 'off', 69], [1.0, 'on', 69, .8]], {sec: 1.3, tap: 'gain'}).l;
  const gref = R(mkPatch({e2: {a: 63, d: 64, s: 127, r: 0}, a: {lvl: 100}}), [[0, 'on', 69, .8]], {sec: .3, tap: 'gain'}).l;
  const g0 = R(mkPatch(eg), [[0, 'on', 69, .8]], {sec: .3, tap: 'gain'}).l;
  const i1 = Math.round(1.0 * SR) + 480, j = 480;
  log('Q8 Attack +63 an Schritt 1 wirkt auf die Note', Math.abs(db(g[i1] / gref[j])) < 1, 'Pegel 10 ms nach Note 2: ' + db(g[i1]).toFixed(1) + ' dB · erwartet (ATTACK 63) ' + db(gref[j]).toFixed(1) + ' dB · ohne Seq ' + db(g0[j]).toFixed(1) + ' dB; erste Note: ' + db(g[480]).toFixed(1) + ' dB');
});

// 9. motion recording: Einmal already finished, LAENGE 1, idle (no note)
const recRun = (sq, ev, t0, t1, sec) => { const at = [[t0, {mkRec: {ti: 0, k: 0, tg: 11, base: 40}}]]; for (let t = t0; t < t1; t += .01) at.push([t + .001, {mkSet: {'t.0.f.cut': 40 + Math.min(80, (t - t0) * 60)}}]);
  const r = R(SP({f: {cut: 40}}, sq), ev, {sec, at: at.concat([SC])}); return {done: r.msgs.filter(m => m.mkRecDone).map(m => m.mkRecDone), sc: scopes(r)}; };
T('Q9 Aufnahme', () => {
  // a) LAUF Einmal, the sequence has finished before AUFN. (note held all the time)
  let x = recRun({on: 1, last: 8, run: 0, res: 3, q: [Q(0), Q(15, 1, [5, 5])]}, [[0, 'on', 60, .8], [3.9, 'off', 60]], 1.3, 3.8, 4);
  const stA = [...new Set(x.sc.filter(m => m.t > 1.3 && m.seq[0].rec).map(m => m.seq[0].step))];
  log('Q9a Aufnahme nach beendetem Einmal-Lauf', x.done.length === 1, x.done.length ? 'Ende ' + x.done[0].from + '…' + x.done[0].to : 'keine mkRecDone in 2,5 s; Schritte während AUFN.: ' + stA.join(',') + ' (rec noch aktiv: ' + !!x.sc[x.sc.length - 1].seq[0].rec + ')');
  // b) LAENGE 1
  x = recRun({on: 1, last: 1, run: 1, res: 3, q: [Q(0), Q(15, 1, [5])]}, [[0, 'on', 60, .8], [3.9, 'off', 60]], .3, 2.0, 2.5);
  log('Q9b Aufnahme bei LÄNGE 1 endet', x.done.length === 1, x.done.length ? 'Ende ' + x.done[0].from + '…' + x.done[0].to : 'keine mkRecDone in 2,2 s (rec noch aktiv: ' + !!x.sc[x.sc.length - 1].seq[0].rec + ')');
  // c) LAENGE 2
  x = recRun({on: 1, last: 2, run: 1, res: 3, q: [Q(0), Q(15, 1, [5])]}, [[0, 'on', 60, .8], [3.9, 'off', 60]], .3, 2.0, 2.5);
  log('Q9c Aufnahme bei LÄNGE 2 endet', x.done.length === 1, x.done.length ? 'Ende ' + x.done[0].from + '…' + x.done[0].to : 'keine mkRecDone');
  // d) no note at all (idle), LAUF Einmal after an earlier note that ran the one-shot out
  x = recRun({on: 1, last: 4, run: 0, res: 3, q: [Q(0), Q(15, 1, [5])]}, [[0, 'on', 60, .8], [.8, 'off', 60]], 1.2, 3.0, 3.2);
  log('Q9d Aufnahme ohne Note nach Einmal-Lauf', x.done.length === 1, x.done.length ? 'Ende ' + x.done[0].from + '…' + x.done[0].to : 'keine mkRecDone in 2 s (rec noch aktiv: ' + !!x.sc[x.sc.length - 1].seq[0].rec + ')');
  // e) prior values before the start step are kept
  x = recRun({on: 1, last: 8, run: 1, res: 3, q: [Q(11, 1, [7, 7, 7, 7, 7, 7, 7, 7, 9, 9])]}, [[0, 'on', 60, .8], [3.9, 'off', 60]], .3, 1.5, 1.6);
  log('Q9e Werte vor dem Startschritt und nach LÄNGE bleiben', x.done[0] && x.done[0].v[0] === 7 && x.done[0].v[1] === 7 && x.done[0].v[8] === 9, x.done[0] ? 'v = ' + x.done[0].v.join(',') : 'kein Ende');
});

// 10. T2 sequence in Dual (Schicht): acts on T2 only
T('Q10 T2', () => {
  const p = mkPatch({f: {cut: 50}}); p.mode = 1; p.t[1] = JSON.parse(JSON.stringify(p.t[0])); p.t[1].f.cut = 50;
  p.t[1].seq = {on: 1, last: 16, type: 0, run: 1, ks: 1, res: 3, q: [Q(15, 1, Array.from({length: 16}, (_, i) => i & 1 ? 63 : -63)), Q(0), Q(0)]};
  const p0 = JSON.parse(JSON.stringify(p)); p0.t[1].seq.on = 0;
  const a = R(p, [[0, 'on', 60, .8]], {sec: .6}), b = R(p0, [[0, 'on', 60, .8]], {sec: .6});
  const seg = (x, k) => rms(x, k * 6000 + 1000, k * 6000 + 5000);
  log('Q10 T2-Sequenz wirkt in Schicht', Math.abs(db(seg(a.l, 1) / seg(a.l, 2))) > 3, 'T2 Pegel ±63: Schritt 2 / 3 ' + db(seg(a.l, 1) / seg(a.l, 2)).toFixed(1) + ' dB; ohne ' + db(seg(b.l, 1) / seg(b.l, 2)).toFixed(1) + ' dB');
});
