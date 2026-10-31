// BM4-01 ... BM4-05 (layer / split, section 1.13) in Node: two programs (prog a / b), {t:'ly'}; voices observed in the processor.
import fs from 'fs';
import {render, on, off} from './bm-node.mjs';
import {rms, db} from '../../../tests/v3-mk1-ana.mjs';
const HERE = new URL('.', import.meta.url).pathname, SR = 48000;
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + ' — ' + info); res.push({id, ok: !!c, info}); };
const R = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const A = {o1: {m: 31, e: {l: 99, a: 0, d: 0, s: 15, r: 0}}, f: {md: 'hp', cu: 0}, fx: {t1: 'CH1', b1: 0, t2: 'RV1', b2: 0}}, B = {o1: {m: 31, e: {l: 99, a: 0, d: 0, s: 15, r: 0}}, f: {md: 'hp', cu: 0}};
const base = (ly, a, b) => [[0, {t: 'prog', ab: 'a', p: Object.assign({}, A, a || {})}], [0, {t: 'prog', ab: 'b', p: Object.assign({}, B, b || {})}], [0, {t: 'ly', p: Object.assign({md: 'lay', semi: 0, bal: 50, pan: 0, tune: 0, sp: 60}, ly)}]];
const snap = (msgs, t, sec) => { let s = null; const want = Math.round(t * SR / 128) * 128; const r = render(msgs, {sec, each: (P, f) => { if (f === want) s = P.V.filter(v => v.on && !v.ghost).map(v => ({pg: v.pg, n: v.n, f1: v.Z[3] * 16 * SR / 4294967296, gL: v.D[10], gR: v.D[13]})); }}); return {s, r}; };
// BM4-01
{ const {s} = snap(base({semi: 12, tune: 0}).concat([[0, on(.01, 57, .8)]]), .1, .2), a = s.find(v => v.pg === 0), b = s.find(v => v.pg === 1), ct = 1200 * Math.log2(b.f1 / a.f1);
  const {s: s2} = snap(base({semi: 0, tune: 37}).concat([[0, on(.01, 57, .8)]]), .1, .2), ct2 = 1200 * Math.log2(s2.find(v => v.pg === 1).f1 / s2.find(v => v.pg === 0).f1);
  const only = (bal, keep) => { const msgs = base({bal}, keep === 'a' ? {} : {o1: {m: 31, e: {l: 0}}}, keep === 'b' ? {} : {o1: {m: 31, e: {l: 0}}}).concat([[0, on(.01, 57, .8)]]); const r = render(msgs, {sec: .4}); return rms(r.l, 9600, 19200); };
  const a0 = only(0, 'a'), b0 = only(0, 'b'), a50 = only(50, 'a'), b50 = only(50, 'b'), a100 = only(100, 'a'), b100 = only(100, 'b');
  const {s: sp} = snap(base({pan: 100}).concat([[0, on(.01, 57, .8)]]), .1, .2), pa = sp.find(v => v.pg === 0), pb = sp.find(v => v.pg === 1);
  ok('BM4-01 Layer: jede Note A und B; SEMI +12 → +1200 ± 0,5 ct; BAL 0/50/100 → nur A / gleich ± 0,2 dB / nur B; PAN trennt A links, B rechts; TUNE ± 1 ct',
    s.length === 2 && Math.abs(ct - 1200) <= .5 && b0 < 1e-9 && a100 < 1e-9 && Math.abs(db(a50 / b50)) <= .2 && a0 > 1e-3 && b100 > 1e-3 && pa.gR < 1e-12 && pb.gL < 1e-12 && Math.abs(ct2 - 37) <= 1,
    s.length + ' Stimmen; B +' + R(ct, 3) + ' ct; BAL 0: B ' + (b0 < 1e-9 ? 'still' : R(db(b0))) + ', 50: A−B ' + R(db(a50 / b50), 3) + ' dB, 100: A ' + (a100 < 1e-9 ? 'still' : R(db(a100))) + '; PAN 100: A R=' + pa.gR.toExponential(1) + ', B L=' + pb.gL.toExponential(1) + '; TUNE 37 → ' + R(ct2, 3) + ' ct'); }
// BM4-02 split
{ const {s} = snap(base({md: 'spl', sp: 60}).concat([[0, on(.01, 59, .8, 1)], [0, on(.01, 60, .8, 2)]]), .1, .2);
  ok('BM4-02 Split: Note < sp → A, ≥ sp → B (Splitpunkt per „Split halten + Taste“: Bedienfeld BM5)', s.length === 2 && s.find(v => v.n === 59).pg === 0 && s.find(v => v.n === 60).pg === 1, s.map(v => v.n + '→' + (v.pg ? 'B' : 'A')).join(', ')); }
// BM4-03 FX types from A, FX1 share per program, FX2 once from A
{ const runp = (a, b) => render(base({md: 'lay', bal: 50}, Object.assign({fx: Object.assign({t1: 'RM16', b1: 0, t2: 'RV1', b2: 0}, a)}), {o1: {m: 7, e: {l: 99, a: 0, d: 0, s: 15, r: 0}}, fx: Object.assign({t1: 'DT16', b1: 0, t2: 'DL1', b2: 0}, b)}).concat([[0, on(.01, 57, .8)]]), {sec: .5});
  const dry = runp({}, {}), aOnly = runp({b1: 100}, {}), bOnly = runp({}, {b1: 100}), typeB = runp({}, {b1: 100, t1: 'RM1'});
  const diff = (x, y) => { let d = 0; for (let i = 0; i < x.l.length; i++) d = Math.max(d, Math.abs(x.l[i] - y.l[i])); return d; };
  // B's FX1 plays A's type (RM16): changing B's own t1 changes nothing; FX2 type and share only from A
  const fx2B = runp({}, {t2: 'DL1', b2: 100}), fx2A = runp({t2: 'DL1', b2: 100}, {});
  ok('BM4-03 FX-Typen aus A; FX1-Anteil je Programm (zwei Instanzen); FX2 einmal (Typ und Anteil aus A)', diff(aOnly, dry) > 1e-3 && diff(bOnly, dry) > 1e-3 && diff(bOnly, aOnly) > 1e-3 && diff(typeB, bOnly) === 0 && diff(fx2B, dry) === 0 && diff(fx2A, dry) > 1e-3,
    'FX1 A wirkt ' + R(diff(aOnly, dry), 3) + ', FX1 B wirkt ' + R(diff(bOnly, dry), 3) + ', B-eigener Typ ändert nichts (' + diff(typeB, bOnly) + '), FX2 aus B ändert nichts (' + diff(fx2B, dry) + '), FX2 aus A wirkt'); }
// BM4-04 LFOs per program
{ const lfo = (sp, w) => ({l1: {sp, w, t: [['freq', 60], ['flt', 0], ['mask', 0], ['vol', 0]]}});
  const pit = []; const r = render(base({semi: 0}, lfo(60, 'sin'), lfo(45, 'sqr')).concat([[0, on(.01, 57, .8)]]), {sec: 2, each: (P, f) => { if (f % 1920 === 0 && f > 0) { const a = P.V.find(v => v.on && v.pg === 0), b = P.V.find(v => v.on && v.pg === 1); if (a && b) pit.push([a.Z[3], b.Z[3]]); } }});
  const differ = pit.filter(([x, y]) => x !== y).length, bVals = new Set(pit.map(p => p[1])).size;
  ok('BM4-04 LFOs je Programm: A und B mit eigenen Werten', differ >= pit.length - 1 && bVals >= 2 && pit.length > 5, pit.length + ' Zeitpunkte, verschieden ' + differ + ', B (Rechteck) ' + bVals + ' Werte'); }
// BM4-05 two voices per note: the 7th note steals
{ const msgs = base({}); for (let k = 0; k < 7; k++) msgs.push([0, on(.01 + .02 * k, 48 + 2 * k, .8, k + 1)]);
  const {s, r} = snap(msgs, .3, .35), ends = r.msgs.filter(m => m.t === 'end');
  const firstGone = !s.some(v => v.n === 48), seventh = s.filter(v => v.n === 60).length;
  ok('BM4-05 Layer braucht 2 Stimmen je Note; die 7. Note klaut (12 Stimmen)', s.length === 12 && firstGone && seventh === 2, s.length + ' Stimmen, 1. Note geklaut ' + firstGone + ', 7. Note mit ' + seventh + ' Stimmen'); }
fs.writeFileSync(HERE + 'bm4-layer.out.json', JSON.stringify(res, null, 1));
process.exit(fails ? 1 : 0);
