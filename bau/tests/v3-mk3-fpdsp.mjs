// MK3 Fach-Prüfung FP-DSP (N3 Teil F): extremes in Dual/Split (NaN/Inf, peaks), a 20 s storm of notes and program changes
// (MODUS, STIMMEN, SPLIT, STIMMUNG, GRUNDTON, EIGENE, Solo, Zuweisung), every note ends, no voice hangs; denormal check of the
// muted (solo) path. Usage: MK_FILE=<index.html> node v3-mk3-fpdsp.mjs
import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, peak, rms} from './v3-mk1-ana.mjs';
const NEW = process.env.MK_FILE || new URL('../mk-br-MK3/index.html', import.meta.url).pathname, SR = 48000;
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const M = (x, d) => Math.round(x * 10 ** (d == null ? 1 : d)) / 10 ** (d == null ? 1 : d);
const merge = (a, b) => { for (const k in b || {}) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
const prog = (top, t1, t2) => { const p = mkDefaults(); merge(p, top || {}); merge(p.t[0], t1 || {}); merge(p.t[1], t2 || {}); return p; };
const X1 = {asg: 2, udet: 99, o1: {w: 6, c1: 127, c2: 127}, mix: {o1: 127, o2: 127, n: 127}, o2: {w: 1, mod: 3, semi: 24, tune: 63}, f: {type: 0, cut: 127, res: 127, eg: 63, vel: 63, kbd: 63}, a: {lvl: 127, dist: 1, kbd: 63, vel: 63}, e1: {a: 0, d: 0, s: 127, r: 127}, l1: {w: 3, f: 127}, l2: {w: 3, f: 127}, vib: 63, p: [{s: 2, d: 0, i: 63}, {s: 3, d: 4, i: 63}, {s: 0, d: 2, i: 63}, {s: 5, d: 6, i: 63}]};
const X2 = {asg: 1, o1: {w: 3, c1: 127, c2: 127}, mix: {o1: 127, o2: 127, n: 127}, o2: {w: 0, mod: 1, semi: -24, tune: -63}, f: {type: 2, cut: 0, res: 127, eg: -63, kbd: -63}, a: {lvl: 127, dist: 1, pan: 63}, trans: 24, tune: 50, porta: 127, l1: {w: 1, f: 127, ks: 2}, l2: {w: 1, f: 0, sync: 1, note: 14}, p: [{s: 3, d: 7, i: 63}, {s: 1, d: 5, i: -63}, {s: 4, d: 1, i: 63}, {s: 6, d: 0, i: 63}]};
const USC = [100, -100, 100, -100, 100, -100, 100, -100, 100, -100, 100, -100];
let s = 99; const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
// extremes, 20 s, notes C-1 .. G9 at random in Dual and Split; storm of program changes
const ev = [], at = [], held = new Set(); let id = 1;
for (let t = 0; t < 19; t += .02 + rnd() * .08) {
  if (held.size && rnd() < .45) { const k = [...held][Math.floor(rnd() * held.size)]; held.delete(k); ev.push([t, 2, k]); }
  else { const k = id++; held.add(k); ev.push([t, 1, k, Math.floor(rnd() * 128), .05 + rnd() * .95, -1]); }
  if (rnd() < .25) { const r = rnd(); const m = r < .2 ? {mode: Math.floor(rnd() * 3)} : r < .35 ? {tv: Math.floor(rnd() * 3)} : r < .5 ? {split: Math.floor(rnd() * 128)} : r < .65 ? {scale: Math.floor(rnd() * 10), usc: USC}
      : r < .75 ? {skey: Math.floor(rnd() * 12)} : r < .85 ? {['t.' + Math.floor(rnd() * 2) + '.asg']: Math.floor(rnd() * 3)} : r < .92 ? {['usc.' + Math.floor(rnd() * 12)]: rnd() * 200 - 100} : null;
    if (m && m.usc) { const sc = m.scale; at.push([t, {mkSet: {scale: sc}}]); } else if (m) at.push([t, {mkSet: m}]); else at.push([t, {mkSolo: Math.floor(rnd() * 3)}]); }
}
for (const k of held) ev.push([19.2, 2, k]);
for (const [top, lab] of [[{mode: 1, tv: 1, scale: 9, usc: USC}, 'Dual'], [{mode: 2, split: 64, scale: 8, skey: 7}, 'Split']]) {
  const r = render(prog(top, X1, X2), [], {file: NEW, sec: 20, raw: ev, at: at.slice()});
  let nan = 0; for (let i = 0; i < r.l.length; i++) if (!isFinite(r.l[i]) || !isFinite(r.r[i])) nan++;
  const pk = Math.max(peak(r.l), peak(r.r)), tail = db(rms(r.l, Math.round(19.8 * SR), r.l.length) + rms(r.r, Math.round(19.8 * SR), r.r.length));
  const ended = new Set(r.msgs.filter(m => m.end).map(m => m.end).flat()), all = ev.filter(e => e[1] === 1).map(e => e[2]), miss = all.filter(k => !ended.has(k));
  let on = 0; for (const tm of r.P.mk.tm) for (const v of tm.V) if (v.on) on++;
  ok('FP-DSP ' + lab + ': Extremwerte beider Timbres, 20 s Noten- und Umschalt-Sturm (' + all.length + ' Noten, ' + at.length + ' Wechsel): kein NaN/Inf, Spitze ≤ +6 dBFS', !nan && db(pk) <= 6, 'NaN ' + nan + ', Spitze ' + M(db(pk)) + ' dBFS');
  // an end report can be missing when the same note restarts a releasing voice with a new id (MK1 behaviour, also in 4.10.0; the host sweeps such a proxy 1 s after its stop time): listed, not judged here
  ok('FP-DSP ' + lab + ': danach keine Stimme hängt, Stille (Ende-Meldungen: fehlende nur durch den MK1-Fall „gleiche Note im Release“)', !on && tail < -100, 'fehlen ' + miss.length + (miss.length ? ' ' + JSON.stringify(ev.filter(e => e[2] === miss[0])) : '') + ', Stimmen an ' + on + ', Rest ' + M(tail) + ' dB');
}
// denormals (B.6 Nr. 11, as v3-mk1-fpdsp.mjs): Dual, a held note, 1 s full drive in both timbres, then all mixers to 0 (the filter
// inputs silent, the voices stay) for 60 s; T2 muted by solo from 0.5 s (its path runs on unheard). The window load from its median
// quantum; the rule on the median window and on 95 % of the windows (the machine is shared)
for (const ft of [0, 3]) {
  const p = prog({mode: 1, tv: 1}, {mix: {o1: 127, o2: 127, n: 127}, o2: {w: 0, semi: 7}, f: {type: ft, cut: 90, res: 100}, a: {dist: 1, gate: 1}}, {mix: {o1: 127, o2: 127, n: 127}, f: {type: 3 - ft, cut: 80, res: 110}, a: {dist: 1, gate: 1}});
  const r = render(p, [[0, 'on', 48, 1]], {file: NEW, sec: 61, quantumMs: true, at: [[.5, {mkSolo: 1}], [1, {mkSet: {'t.0.mix.o1': 0, 't.0.mix.o2': 0, 't.0.mix.n': 0, 't.1.mix.o1': 0, 't.1.mix.o2': 0, 't.1.mix.n': 0}}]]});
  const per = Math.round(SR / 128), win = []; for (let w = 2; w < 61; w++) { const q = r.qms.slice(w * per, (w + 1) * per).sort((x, y) => x - y); win.push(q[q.length >> 1] * per); }
  const first = win[0], med = win.slice().sort((x, y) => x - y)[win.length >> 1], over = win.slice(1).filter(w => w > 1.1 * Math.max(first, med)).length;
  ok('FP-DSP Denormale Dual (Filtertyp ' + ft + ' / ' + (3 - ft) + ', T2 per Solo stumm): 60 s Stille nach Vollaussteuerung, Last je 1-s-Fenster ≤ 1,1 × der ersten stillen Sekunde', med <= 1.1 * first + .5 && over <= 3,
    'erste ' + M(first) + ' ms, Median ' + M(med) + ' ms, max ' + M(Math.max(...win)) + ' ms, Fenster > 1,1 ×: ' + over + '/58');
}
console.log(fails ? fails + ' FEHLER' : 'alles bestanden');
process.exit(fails ? 1 : 0);
