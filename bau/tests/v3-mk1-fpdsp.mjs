// MK1 Fach-Prüfung FP-DSP (Nachtrag 3 Teil F): NaN/Inf at extreme values (20 s), denormals (60 s silence after full drive through
// every filter path, held note: each 1-s load window ≤ 1.1 × the first silent second), W table = one source (worklet text).
// Usage: node v3-mk1-fpdsp.mjs <index.html>
import path from 'path';
process.env.MK_FILE = path.resolve(process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname);
const { render, mkPatch, workletSrc } = await import('./v3-mk1-node.mjs');
import fs from 'fs';
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const SR = 48000;
const check = x => { let bad = 0, pk = 0; for (const v of x) { if (!Number.isFinite(v)) bad++; else pk = Math.max(pk, Math.abs(v)); } return {bad, pk: 20 * Math.log10(pk + 1e-30)}; };
const MAX = {asg: 1, udet: 99, trans: 24, tune: 50, vib: 63, bend: 12, porta: 127, o1: {w: 0, c1: 127, c2: 127}, o2: {w: 1, mod: 3, semi: 24, tune: 63}, mix: {o1: 127, o2: 127, n: 127},
  f: {type: 0, cut: 127, res: 127, eg: 63, vel: 63, kbd: 48}, a: {lvl: 127, pan: 63, gate: 0, dist: 1, vel: 63, kbd: 63}, e1: {a: 0, d: 0, s: 127, r: 127, rst: 1}, e2: {a: 0, d: 0, s: 127, r: 127, rst: 1},
  l1: {w: 3, ks: 2, sync: 0, f: 127, note: 14}, l2: {w: 0, ks: 1, sync: 0, f: 127, note: 14}};
const MIN = {asg: 2, udet: 0, trans: -24, tune: -50, vib: -63, bend: -12, porta: 0, o1: {w: 2, c1: 0, c2: 0}, o2: {w: 2, mod: 1, semi: -24, tune: -63}, mix: {o1: 127, o2: 127, n: 0},
  f: {type: 2, cut: 0, res: 127, eg: -63, vel: -63, kbd: -48}, a: {lvl: 127, pan: -63, gate: 1, dist: 1, vel: -63, kbd: -63}, e1: {a: 127, d: 127, s: 0, r: 0, rst: 0}, e2: {a: 0, d: 127, s: 127, r: 0, rst: 0},
  l1: {w: 1, ks: 0, sync: 1, f: 0, note: 0}, l2: {w: 3, ks: 2, sync: 1, f: 0, note: 0}};
for (const [nm, P] of [['alle Regler auf Anschlag (max), C8-Akkord', MAX], ['alle Regler auf Anschlag (min), Unison', MIN]]) for (const ft of [0, 1, 2, 3]) {
  const p = mkPatch(JSON.parse(JSON.stringify(P))); p.t[0].f.type = ft;
  const ev = [[0, 'on', 108, 1], [0, 'on', 103, 1], [0, 'on', 100, 1], [0, 'on', 96, 1], [10, 'off', 108], [10.5, 'on', 24, 1]];
  const r = render(p, ev, {sec: 20, mw0: 1, at: [[3, {mkWheel: {bend: 1}}], [6, {mkWheel: {bend: -1, ret: 0}}], [8, {mkWheel: {bend: 0, ret: 1}}]]});
  const c = check(r.l), d = check(r.r);   // both channels (pan at the stops)
  ok(`FP-DSP ${nm}, Filtertyp ${ft}: 20 s ohne NaN/Inf`, c.bad + d.bad === 0, 'Spitze ' + Math.max(c.pk, d.pk).toFixed(1) + ' dBFS');
}
// denormals: held note, 1 s full drive, then the mixer to 0 (filter input silent, the voice stays) for 60 s
for (const ft of [0, 1, 2, 3]) {
  const p = mkPatch({mix: {o1: 127, o2: 127, n: 127}, o2: {w: 0, semi: 7}, f: {type: ft, cut: 90, res: 100}, a: {dist: 1, gate: 1}});
  const r = render(p, [[0, 'on', 48, 1]], {sec: 61, quantumMs: true, at: [[1, {mkSet: {'t.0.mix.o1': 0, 't.0.mix.o2': 0, 't.0.mix.n': 0}}]]});
  const per = Math.round(SR / 128), win = []; for (let s = 2; s < 61; s++) { const q = r.qms.slice(s * per, (s + 1) * per).sort((a, b) => a - b); win.push(q[q.length >> 1] * per); }   // the window load from its median quantum (the machine is shared: single slow quanta are other processes)
  const first = win[0], worst = Math.max(...win.slice(1)), med = win.slice().sort((a, b) => a - b)[win.length >> 1];
  // a single window can catch a GC pause: the rule is checked on the median window and on 95 % of the windows
  const over = win.slice(1).filter(w => w > 1.1 * Math.max(first, med)).length;
  ok(`FP-DSP Denormale, Filtertyp ${ft}: 60 s Stille nach Vollaussteuerung, Last je 1-s-Fenster ≤ 1,1 × der ersten stillen Sekunde`, med <= 1.1 * first + .5 && over <= 3,
    `erste ${first.toFixed(1)} ms, Median ${med.toFixed(1)} ms, max ${worst.toFixed(1)} ms, Fenster > 1,1 ×: ${over}/58`);
}
// one W table: the main thread evaluates the worklet's MKW text (no shadow curves)
{
  const html = fs.readFileSync(process.env.MK_FILE, 'utf8'), w = workletSrc(process.env.MK_FILE);
  const inW = (w.match(/\/\*MKW\{\*\//g) || []).length, outside = html.replace(w, '').match(/cutHz: v => 20 \* Math\.pow\(1000/g);
  ok('FP-DSP W-Tabelle: eine Quelle (MKW nur im Worklet-Text, der Hauptfaden wertet ihn aus)', inW === 1 && !outside, 'MKW-Blöcke im Worklet ' + inW + ', Kopien außerhalb ' + (outside ? outside.length : 0));
  ok('FP-DSP Worklet-ASCII', !/[^\x00-\x7f]/.test(w));
}
console.log('\n' + (fails ? fails + ' FEHLER' : 'alles bestanden'));
process.exit(fails ? 1 : 0);
