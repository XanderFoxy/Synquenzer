// G-MK34-merge: the MK4 program effects sit after BOTH MK3 timbres (MkCore). Node, real worklet of MK_FILE.
import {render, mkDefaults} from './v3-mk1-node.mjs';
const FILE = process.env.MK_FILE, MK4 = process.env.MK4_FILE;
let bad = 0; const chk = (ok, s) => { if (!ok) bad++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const SR = 48000, pk = (y, a, b) => { let m = 0; for (let i = Math.round(a * SR); i < Math.round(b * SR); i++) m = Math.max(m, Math.abs(y[i])); return m; };
const md = (a, b) => { let m = 0; for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - b[i])); return m; };
const db = x => (20 * Math.log10(Math.max(1e-15, x))).toFixed(1);
const prog = (o) => { const p = mkDefaults(); p.mfx = {type: 0, spd: 64, dep: 0}; p.dly = {type: 0, sync: 0, time: 90, note: 8, dep: 0}; p.eq = {lf: 320, lg: 0, hf: 6000, hg: 0};
  for (const k of ['mfx', 'dly', 'eq']) if (o[k]) Object.assign(p[k], o[k]); for (const k of ['mode', 'tv', 'split']) if (o[k] != null) p[k] = o[k];
  for (const t of p.t) { t.e2 = {a: 0, d: 64, s: 127, r: 10, rst: 1}; t.f.cut = 100; }
  p.t[1].o1.w = 1; p.t[1].f.cut = 80; if (o.l0 != null) p.t[0].a.lvl = o.l0; if (o.l1 != null) p.t[1].a.lvl = o.l1; return p; };
const ev = [[0, 'on', 48, .9], [0, 'on', 72, .9], [.3, 'off', 48], [.3, 'off', 72]];
const FXS = [['DELAY 100', {dly: {dep: 100}}], ['DELAY Kreuz 90 + EQ', {dly: {type: 1, dep: 90}, eq: {lg: 6, hg: -4}}], ['Cho/Flg 100 (LFO steht)', {mfx: {type: 0, dep: 100}}], ['Phaser 90 + DELAY', {mfx: {type: 2, dep: 90}, dly: {dep: 60}}], ['Ensemble + EQ', {mfx: {type: 1, dep: 110}, eq: {hg: 8}}]];
const frz = [[0, {mkFxFrz: .25}]];
// 1 Single = MK4 branch bit-equal (the move of the effects into the program level changes nothing in Single)
if (MK4) for (const [n, fx] of FXS) {
  const a = render(prog(fx), ev, {sec: 2, file: FILE, at: frz}), b = render(prog(fx), ev, {sec: 2, file: MK4, at: frz});
  const d = Math.max(md(a.l, b.l), md(a.r, b.r)); chk(d === 0, `Single ${n}: merged = MK4 branch bit-equal (max |Δ| ${d})`);
}
// 2 Schicht: effects after the sum of both timbres = effect(T1) + effect(T2) (all effects are linear in the input; LFO frozen)
for (const [n, fx] of FXS) {
  const both = render(prog(Object.assign({mode: 1}, fx)), ev, {sec: 2.5, file: FILE, at: frz});
  const a = render(prog(Object.assign({mode: 1, l1: 0}, fx)), ev, {sec: 2.5, file: FILE, at: frz}), b = render(prog(Object.assign({mode: 1, l0: 0}, fx)), ev, {sec: 2.5, file: FILE, at: frz});
  const s = new Float32Array(a.l.length); for (let i = 0; i < s.length; i++) s[i] = a.l[i] + b.l[i];
  const d = md(both.l, s), tail = pk(b.l, .45, 2.4);
  chk(d < 1e-5 && (n.includes('DELAY') ? tail > 1e-3 : true), `Schicht ${n}: Effekt(T1 + T2) = Effekt(T1) + Effekt(T2) — max |Δ| ${d.toExponential(2)}, T2 tail after release ${db(tail)} dB`);
}
// 3 Split: a note above SPLIT plays T2 only and still gets its echo; below = T1 with echo
{ const p = prog({mode: 2, split: 60, dly: {dep: 100}}), hi = render(p, [[0, 'on', 72, .9], [.3, 'off', 72]], {sec: 2, file: FILE}), lo = render(p, [[0, 'on', 48, .9], [.3, 'off', 48]], {sec: 2, file: FILE});
  const p0 = prog({mode: 2, split: 60}), hi0 = render(p0, [[0, 'on', 72, .9], [.3, 'off', 72]], {sec: 2, file: FILE});
  chk(pk(hi.l, .5, 1.9) > 1e-3 && pk(lo.l, .5, 1.9) > 1e-3 && pk(hi0.l, .5, 1.9) < 1e-4, `Split: T2-Note mit Echo ${db(pk(hi.l, .5, 1.9))} dB, T1-Note ${db(pk(lo.l, .5, 1.9))} dB, ohne DELAY ${db(pk(hi0.l, .5, 1.9))} dB`); }
// 4 Solo T1 in Schicht: T2 muted before the effect (its echo too)
{ const p = prog({mode: 1, dly: {dep: 100}}), s1 = render(p, ev, {sec: 2.5, file: FILE, at: [[0, {mkSolo: 1}]]}), a = render(prog({mode: 1, l1: 0, dly: {dep: 100}}), ev, {sec: 2.5, file: FILE});
  const d = md(s1.l, a.l); chk(d < 1e-5, `Solo T1 + DELAY = T2 PEGEL 0 + DELAY — max |Δ| ${d.toExponential(2)}`); }
// 5 Panic in Schicht kills the tail of both timbres
{ const p = prog({mode: 1, dly: {dep: 127}}), a = render(p, ev, {sec: 3, file: FILE, at: [[.8, {ev: [[.8, 6, 0]]}]]});
  chk(pk(a.l, 1.3, 2.9) < 1e-5, `Panik in Schicht: Echo beider Timbres weg (${db(pk(a.l, 1.3, 2.9))} dB)`); }
// 6 an effect edit in the silence (Schicht) holds from the first sample: TIEFE 0 = dry bit-identical to no effect
{ const p0 = prog({mode: 1}), p1 = prog({mode: 1, dly: {dep: 100}}), ev2 = [[1, 'on', 48, .9], [1.3, 'off', 48]];
  const a = render(p1, ev2, {sec: 2, file: FILE, at: [[.5, {mkSet: {'dly.dep': 0}}]]}), b = render(p0, ev2, {sec: 2, file: FILE});
  const d = md(a.l, b.l); console.log('  (mkSet path used: ' + (a.P && a.P.mk ? 'ok' : '?') + ')'); chk(d === 0, `Schicht: DELAY TIEFE → 0 in der Stille = trocken bitgleich (max |Δ| ${d})`); }
process.exitCode = bad ? 1 : 0; console.log(bad ? bad + ' FAIL' : 'alles bestanden');
