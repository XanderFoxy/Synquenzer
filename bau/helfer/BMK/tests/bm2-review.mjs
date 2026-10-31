// Counter-tests for the findings of the independent review of BM1/BM2 (CHANGES.md "Prüfer-Befunde"): every finding with a
// scripted case. Node. Writes bm2-review.out.json.
import fs from 'fs';
import {render, makeScope, on, off} from './bm-node.mjs';
import {rms, db} from '../../../tests/v3-mk1-ana.mjs';
const HERE = new URL('.', import.meta.url).pathname, SR = 48000;
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + ' — ' + info); res.push({id, ok: !!c, info}); };
const prog = p => ({t: 'prog', ab: 'a', p});
const alive = (r, t0) => { const a = Math.round(t0 * SR); return rms(r.l, a, a + 4800); };
const sus = v => ({t: 'ctl', list: [{k: 'sus', v, at: 0}]});
// 1 PARA + sustain: after the pedal the shared set releases
{ const r = render([[0, prog({g: {mo: 'para'}, o1: {e: {l: 99, a: 0, d: 0, s: 15, r: 3}}})], [0, {t: 'ctl', sus: 1}], [0, on(.01, 60, .8, 1)], [0, on(.02, 64, .8, 2)], [0, off(.2, 0, 1)], [0, off(.21, 0, 2)], [.4, {t: 'ctl', sus: 0}]], {sec: 1.2});
  ok('R1 PARA + Halten: nach dem Pedal klingt alles aus', alive(r, .3) > 1e-3 && alive(r, 1.0) < 1e-6, 'gehalten ' + db(alive(r, .3)).toFixed(1) + ' dBFS, nach dem Pedal ' + db(alive(r, 1.0)).toFixed(1) + ' dBFS'); }
// 2 CIC headroom: all three levels at 99 with o1v / o2v / nv routes +99 from MW, LFO, AT
{ const P = {o1: {m: 31, e: {l: 99}}, o2: {m: 31, e: {l: 99}}, n: {fr: 99, e: {l: 99}}, mo: {mw: [['o1v', 99], ['o2v', 99], ['nv', 99], ['vol', 0]], at: [['o1v', 99], ['o2v', 99], ['nv', 99], ['vol', 0]]},
    l1: {sp: 1, w: 'sqr', t: [['o1v', 99], ['o2v', 99], ['nv', 99], ['vol', 0]]}, f: {md: 'lp', cu: 99}};
  const r = render([[0, prog(P)], [0, {t: 'ctl', mw: 1, pr: 1}], [0, on(.01, 60, 1, 1)]], {sec: .6}); let pk = 0; for (const x of r.l) pk = Math.max(pk, Math.abs(x));
  const r0 = render([[0, prog({o1: {m: 31, e: {l: 99}}, o2: {m: 31, e: {l: 99}}, n: {fr: 99, e: {l: 99}}, f: {md: 'lp', cu: 99}})], [0, on(.01, 60, 1, 1)]], {sec: .6}); let p0 = 0; for (const x of r0.l) p0 = Math.max(p0, Math.abs(x));
  ok('R2 Pegel-Routen über Faktor 4: kein CIC-Überlauf (Spitze begrenzt, kein Rauschen)', pk < 3 * p0 && pk < 4, 'Spitze ' + pk.toFixed(3) + ' gegen ohne Routen ' + p0.toFixed(3)); }
// 3 MONO after a fast off (tau): the new note sounds
{ const r = render([[0, prog({g: {mo: 'mono'}})], [0, on(.01, 60, .8, 1)], [0, {t: 'off', list: [{n: 60, at: .2, id: 1, tau: .05}]}], [0, on(.21, 64, .8, 2)]], {sec: .8});
  ok('R3 MONO nach schnellem Loslassen (tau): die neue Note klingt', alive(r, .5) > 1e-2, db(alive(r, .5)).toFixed(1) + ' dBFS'); }
// 4 sustain: C held by the pedal, C again, pedal off, C off -> silence; one 'end' per id
{ const r = render([[0, prog({o1: {e: {l: 99, r: 3}}})], [0, {t: 'ctl', sus: 1}], [0, on(.01, 60, .8)], [0, off(.1, 60)], [0, on(.2, 60, .8, 7)], [.3, {t: 'ctl', sus: 0}], [0, off(.4, 0, 7)]], {sec: 1.2});
  const ends = r.msgs.filter(m => m.t === 'end').map(m => m.id);
  ok('R4 Halten: erneut angeschlagene Taste, Pedal los, Taste los → still; je id ein end', alive(r, 1.0) < 1e-6 && ends.length === 2 && new Set(ends).size === 2, 'Pegel ' + db(alive(r, 1.0)).toFixed(1) + ' dBFS, end ' + JSON.stringify(ends)); }
// 5 off and on at the same time (repeated note, no id): the old note ends, the new one sounds; with ids no legato
{ const r = render([[0, prog({g: {mo: 'mport', po: 6}})], [0, on(.01, 60, .8, 1)], [0, off(.2, 0, 1)], [0, on(.2, 67, .8, 2)], [0, {t: 'tap', on: true, k: 'ctl'}], [.25, {t: 'tap', on: false}]], {sec: .3});
  const b = r.msgs.find(m => m.t === 'tap').buf; let p0 = 0; for (let i = 0; i + 13 <= b.length; i += 13) if (b[i] > Math.round(.2 * SR)) { p0 = b[i + 10]; break; }
  ok('R5 off und on zur selben Zeit: off zuerst (kein Legato, kein Gleiten)', Math.abs(p0 - 67) < 1e-3, 'erster Schritt der neuen Note ' + p0.toFixed(3)); }
// 6 reset without tr run:false: the grid and LFO phase start with the next ▶
{ const P = {l1: {sp: 60, w: 'up', t: [['freq', 50], ['flt', 0], ['mask', 0], ['vol', 0]]}};
  const one = [[0, prog(P)], [0, {t: 'tr', run: true, at: .0101}], [0, on(.02, 60, .8, 1)]];
  const a = render(one, {sec: .5}), b = render([[0, prog(P)], [0, {t: 'tr', run: true, at: 0}], [0, on(.01, 48, .8, 9)], [.3, {t: 'reset'}]].concat(one.map(([t, m]) => [.3, JSON.parse(JSON.stringify(m).replace(/"at":([0-9.e-]+)/g, (q, x) => '"at":' + (+x + .3)))])), {sec: .8});
  const sh = Math.round(.3 * SR); let d = 0; for (let i = Math.round(.03 * SR); i < Math.round(.45 * SR); i++) d = Math.max(d, Math.abs(a.l[i] - b.l[i + sh]));
  ok('R6 reset + ▶ (ohne vorheriges run:false) bitgleich', d === 0, 'Differenz ' + d); }
// 8 ghost of a fading voice starts at its level; random flight: one 'end' per id, never for an unknown id
{ const {G, procs} = makeScope(SR), P = new procs['synq-bm']({}), send = m => P.port.onmessage({data: m}); const L = new Float32Array(128), R = new Float32Array(128);
  let s = 99, ids = new Set(), held = [], id = 1; const log = {}; const lg = (i, x) => (log[i] = log[i] || []).push(x); const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
  const modes = ['poly', 'mono', 'slur', 'mport', 'para', 'moly', 'pslur', 'mretrig', 'pretrig'];
  for (let b = 0; b < 375 * 120; b++) { const t = b * 128 / SR; G.T[0] = t;
    if (b % 1500 === 0) send({t: 'prog', ab: 'a', p: {g: {mo: modes[(b / 1500) % 9 | 0], po: 3}, o1: {e: {l: 99, a: 2, d: 5, s: 8, r: 5}}}});
    if (rnd() < .08) { const i = id++; ids.add(i); held.push(i); send({t: 'on', list: [{n: 48 + (rnd() * 24 | 0), v: .8, at: t + rnd() * .002, id: i}]}); lg(i, 'on ' + t.toFixed(3) + ' ' + modes[(b / 1500) % 9 | 0]); }
    if (held.length && rnd() < .08) { const i = held.splice(rnd() * held.length | 0, 1)[0]; const k = rnd(); lg(i, 'off ' + t.toFixed(3) + (k < .1 ? ' tau' : k > .95 ? ' kill' : '')); send({t: 'off', list: [{n: 0, at: t + rnd() * .002, id: i, tau: k < .1 ? .02 : 0, kill: k > .95 ? 1 : 0}]}); }
    if (rnd() < .002) send({t: 'ctl', sus: rnd() < .5 ? 1 : 0}); if (rnd() < .0005) send({t: 'stop', at: t, tau: .02});
    L.fill(0); R.fill(0); P.process([], [[L, R]]); }
  send({t: 'ctl', sus: 0}); for (const i of held) send({t: 'off', list: [{n: 0, at: 0, id: i}]}); for (let b = 0; b < 375 * 30; b++) { G.T[0] += 128 / SR; P.process([], [[L, R]]); }
  const cnt = {}; for (const m of P.__msgs) if (m.t === 'end') cnt[m.id] = (cnt[m.id] || 0) + 1;
  const dup = Object.values(cnt).filter(x => x > 1).length, unknown = Object.keys(cnt).filter(k => !ids.has(+k)).length, missing = [...ids].filter(i => !cnt[i]).length, act = P.V.filter(v => v.on && !v.ghost).length;
  ok('R10 Zufallsfolge (9 Modi, Halten, tau/kill, Stopp): je id genau ein end, keine fremde id, am Ende nichts hängend', dup === 0 && unknown === 0 && missing === 0 && act === 0, ids.size + ' Noten: doppelt ' + dup + ', fremd ' + unknown + ', fehlend ' + missing + ', noch aktiv ' + act); }
fs.writeFileSync(HERE + 'bm2-review.out.json', JSON.stringify(res, null, 1));
process.exit(fails ? 1 : 0);
