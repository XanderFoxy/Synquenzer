// BM2-07 (9 play modes, scripted sequences, table of section 1.11) and BM2-08 (12 voices, the 13th steals by the rule, 3 ms
// crossfade, M-KLICK). Node; snapshots of the processor's voices at given times. ONLY=regex. Writes bm2-modes.out.json.
import fs from 'fs';
import {render, on, off} from './bm-node.mjs';
import {mKlick, rms, db} from '../../../tests/v3-mk1-ana.mjs';
const HERE = new URL('.', import.meta.url).pathname, SR = 48000;
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; const line = (c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : ''); res.push({id, ok: !!c, info}); console.log(line); };
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = (id, f) => { if (only && !only.test(id)) return; try { f(); } catch (e) { ok(id, false, 'Fehler ' + (e.stack || e)); } };
const R = (x, d = 3) => Math.round(x * 10 ** d) / 10 ** d;
const prog = (mo, x) => ({t: 'prog', ab: 'a', p: Object.assign({o1: {m: 7, e: {l: 99, a: 6, d: 8, s: 10, r: 9, lp: 0}}, o2: {e: {l: 0}}, n: {e: {l: 0}}, g: {mo, po: 5}}, x || {})});
// run a script; snapshots [{t, v: [{k, n, gate, st, lv, gld, id}]}] right after the events at the given times (+ 2 ms), and the 'end' ids
function play(mo, ev, at, x) {
  const msgs = [[0, prog(mo, x)]];
  for (const [t, k, n, id] of ev) msgs.push([0, k === 'on' ? on(t, n, .8, id) : off(t, n, id)]);
  const snaps = {}, want = at.map(t => Math.round((t + .002) * SR / 128) * 128);
  const r = render(msgs, {sec: Math.max(...at) + .1, each: (P, f) => { const i = want.indexOf(f); if (i >= 0) snaps[at[i]] = P.V.filter(v => v.on && !v.ghost).map(v => ({k: v.k, n: v.n, gate: v.gate, st: v.es[0], lv: v.el[0], q: v.eq[0], gld: v.gld, id: v.id})); }});
  return {snaps, ends: r.msgs.filter(m => m.t === 'end').map(m => m.id), r};
}
const gated = s => s.filter(v => v.gate);

T('BM2-07', () => {
  const rows = [];
  // staccato (A), legato (B), slur steps (C), chord + single (D)
  const A = [[.05, 'on', 60, 1], [.25, 'off', 60, 1], [.45, 'on', 64, 2], [.65, 'off', 64, 2]];
  const B = [[.05, 'on', 60, 1], [.25, 'on', 64, 2], [.45, 'off', 60, 1], [.65, 'off', 64, 2]];
  const Bret = [[.05, 'on', 60, 1], [.25, 'on', 64, 2], [.45, 'off', 64, 2], [.65, 'off', 60, 1]];
  const C = [[.05, 'on', 60, 1], [.25, 'on', 62, 2], [.45, 'on', 65, 3], [.65, 'off', 65, 3], [.66, 'off', 62, 2], [.67, 'off', 60, 1]];
  const D = [[.05, 'on', 48, 1], [.065, 'on', 52, 2], [.08, 'on', 55, 3], [.3, 'on', 60, 4], [.6, 'off', 48, 1], [.6, 'off', 52, 2], [.6, 'off', 55, 3], [.6, 'off', 60, 4]];
  const check = (mo, name, cond, info) => { rows.push([mo, name, !!cond, info]); };
  for (const mo of ['poly', 'pretrig', 'mono', 'mport', 'mretrig', 'slur', 'para', 'pslur', 'moly']) {
    const a = play(mo, A, [.05, .45]), b = play(mo, B, [.05, .25, .45]), br = play(mo, Bret, [.25, .45]), c = play(mo, C, [.25, .45]), d = play(mo, D, [.1, .3, .62]);
    const a1 = a.snaps[.45], b1 = b.snaps[.25], b2 = b.snaps[.45], c1 = c.snaps[.25], c2 = c.snaps[.45], d1 = d.snaps[.1], d2 = d.snaps[.3];
    const mono = ['mono', 'mport', 'mretrig'].includes(mo), polyish = ['poly', 'pretrig', 'slur', 'para', 'pslur'].includes(mo);
    if (polyish) {
      check(mo, 'Akkord: 3 Stimmen, + Einzelton: 4', gated(d1).length === 3 && gated(d2).length === 4, gated(d1).length + '/' + gated(d2).length);
      check(mo, 'staccato: neue Stimme', gated(a1).length === 1 && a1.length === 2 && gated(a1)[0].n === 64, a1.length + ' klingend');
    }
    if (mo === 'poly' || mo === 'pretrig' || mo === 'para') check(mo, 'legato ±4: zweite Stimme', gated(b1).length === 2, gated(b1).length + ' gehalten');
    if (mono) {
      check(mo, 'eine Stimme (Akkord)', d1.length === 1 && d2.length === 1 && d2[0].n === 60, d1.length + '/' + d2.length + ' Stimme, Ton ' + d2[0].n);
      const lg = gated(b1)[0], first = b.snaps[.05][0];
      const restart = lg.st === 1 && lg.lv < .2, same = lg.k === first.k;
      if (mo === 'mretrig') check(mo, 'legato: Neustart + Gleiten', restart && lg.gld !== 0, 'Stufe ' + lg.st + ', Pegel ' + R(lg.lv) + ', Gleiten ' + R(lg.gld));
      else check(mo, 'legato: kein Neustart, Gleiten, gleiche Stimme', !restart && lg.st !== 1 && same && lg.gld !== 0, 'Stufe ' + lg.st + ', Pegel ' + R(lg.lv) + ', Gleiten ' + R(lg.gld));
      // back to the held key
      const back = gated(br.snaps[.45]); check(mo, 'Rückkehr zur gehaltenen Taste', back.length === 1 && back[0].n === 60, back.length ? 'Ton ' + back[0].n : 'still');
      const st = a.snaps[.45].filter(v => v.gate)[0], st0 = a.snaps[.05][0];
      if (mo === 'mono') check(mo, 'staccato: kein Neustart (Attack vom aktuellen Pegel), Gleiten immer', st.k === st0.k && st.lv > .05 && st.gld !== 0, 'Pegel beim Anschlag ' + R(st.lv) + ', Gleiten ' + R(st.gld));
      else check(mo, 'staccato: Neustart, ohne Gleiten', st.lv < .2 && st.st === 1 && st.gld === 0, 'Pegel ' + R(st.lv) + ', Gleiten ' + R(st.gld));
    }
    if (mo === 'poly' || mo === 'pretrig') { const v2 = gated(b1).find(v => v.n === 64); check(mo, 'Poly-Portamento von der letzten Tonhöhe der Stimme (neue Stimme: keine)', v2 && v2.gld === 0, 'Gleiten ' + (v2 ? R(v2.gld) : '–')); }
    if (mo === 'slur' || mo === 'pslur') {
      check(mo, '±2 HT legato: dieselbe Stimme gleitet, alte Taste losgelassen', gated(c1).length === 1 && gated(c1)[0].n === 62 && gated(c1)[0].gld !== 0 && c.ends.includes(1), gated(c1).length + ' gehalten, Ton ' + gated(c1)[0].n + ', Gleiten ' + R(gated(c1)[0].gld) + ', Ende id 1: ' + c.ends.includes(1));
      check(mo, '±3 HT: neue Stimme', gated(c2).length === 2, gated(c2).length + ' gehalten');
    }
    if (mo === 'para' || mo === 'pslur') {
      const s = b.snaps[.25], v1 = s.find(v => v.n === 60), v2 = s.find(v => v.n === 64);
      check(mo, 'ein ADSR-Satz: die zweite Note setzt beim aktuellen Pegel ein', v1 && v2 && Math.abs(v1.q - v2.q) < 1e-9 && v2.q > .3, v1 && v2 ? 'Pegel ' + R(v1.q) + ' / ' + R(v2.q) : '–');
    }
    if (mo === 'moly') {
      check(mo, 'staccato: neue Stimme', a1.length === 2 && gated(a1).length === 1, a1.length + ' klingend');
      const lg = gated(b1); check(mo, 'legato: Mono-Verhalten (eine Stimme, kein Neustart, gleitet)', lg.length === 1 && lg[0].n === 64 && lg[0].st !== 1 && lg[0].gld !== 0, lg.length + ' gehalten, Stufe ' + lg[0].st + ', Gleiten ' + R(lg[0].gld));
    }
    // all off: everything released
    const e = d.snaps[.62]; check(mo, 'alle los: alles im Release', e.every(v => !v.gate), e.filter(v => v.gate).length + ' noch gehalten');
  }
  const bad = rows.filter(r => !r[2]);
  for (const mo of [...new Set(rows.map(r => r[0]))]) { const rs = rows.filter(r => r[0] === mo); ok('BM2-07 ' + mo.toUpperCase() + ' (' + rs.length + ' Folgen)', rs.every(r => r[2]), rs.map(r => (r[2] ? '✓ ' : '✗ ') + r[1] + ' (' + r[3] + ')').join('; ')); }
});
T('BM2-08', () => {
  // 12 voices; the 13th steals: first the longest released, else the oldest held; crossfade <= 5 ms, M-KLICK <= 6 dB
  const ev = []; for (let k = 0; k < 12; k++) ev.push([.05 + k * .01, 'on', 48 + 2 * k, k + 1]);
  ev.push([.4, 'off', 52, 3]); ev.push([.5, 'on', 80, 13]); ev.push([.7, 'on', 82, 14]); ev.push([.9, 'off', 48, 1]);
  const p = play('poly', ev, [.2, .5, .7, .95], {o1: {m: 7, e: {l: 99, a: 0, d: 0, s: 15, r: 12}}, g: {mo: 'poly', po: 0}});
  const s1 = p.snaps[.2], s2 = p.snaps[.5], s3 = p.snaps[.7];
  const tookRel = !s2.some(v => v.id === 3) && s2.some(v => v.id === 13), tookOld = !s3.some(v => v.id === 1) && s3.some(v => v.id === 14);
  ok('BM2-08 12 Stimmen; die 13. klaut zuerst die am längsten losgelassene, dann die älteste gehaltene', s1.length === 12 && tookRel && tookOld && p.ends.includes(3) && p.ends.includes(1),
    s1.length + ' Stimmen; 13. Note nahm die losgelassene (id 3): ' + tookRel + '; 14. nahm die älteste gehaltene (id 1): ' + tookOld + ' (ihr end folgt mit dem Loslassen der Taste)');
  // crossfade: a held sawtooth at C3 taken over; the ghost fades linearly in 3 ms; M-KLICK on the output
  const msgs = [[0, prog('poly', {o1: {m: 7, e: {l: 99, a: 0, d: 0, s: 15, r: 12}}, f: {md: 'lp', cu: 99}})]];
  for (let k = 0; k < 12; k++) msgs.push([0, on(.05, 48 + 3 * k, .8, k + 1)]);
  msgs.push([0, on(.4013, 47, .8, 13)]);
  let ghostLen = 0, maxG = 0;
  const r = render(msgs, {sec: .8, each: (P) => { const g = P.V.filter(v => v.on && v.ghost).length; if (g) ghostLen += 128; maxG = Math.max(maxG, g); }});
  const kl = mKlick(r.l, SR, [.05]);
  ok('BM2-08 Klau mit Blende ≤ 5 ms, M-KLICK ≤ 6 dB', ghostLen / SR <= .0054 && maxG >= 1 && kl.worst <= 6, 'Blende ' + R(ghostLen / SR * 1000, 1) + ' ms (in 128er-Blöcken gezählt; linear 3 ms), M-KLICK ' + R(kl.worst, 2) + ' dB @ ' + R(kl.at, 3) + ' s');
});
console.log('\n' + (fails ? fails + ' FEHLER' : 'alles bestanden') + ' (' + res.length + ' Prüfungen)');
fs.writeFileSync(HERE + 'bm2-modes.out.json', JSON.stringify(res, null, 1));
process.exit(fails ? 1 : 0);
