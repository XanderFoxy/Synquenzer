// MK3 (Nachtrag 3 MK3) in Node with the app's worklet text: MK3-01 Dual = sum, MK3-02 voice split, MK3-03 split (audio),
// MK3-07 bit-equal to MK2, MK3-08 CPU, MK3-09 switching (M-KLICK / M-EINBRUCH), MK3-12 balance, MK3-13 solo (audio).
// Usage: MK_FILE=<new index.html> MK_OLD=<MK2 index.html> node v3-mk3-timbre.mjs   (ONLY=<regex>)
import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms, peak, mKlick, mEinbruch, spectrum, pdb} from './v3-mk1-ana.mjs';
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

{
  const p = prog({mode: 1}, {o1: {w: 0}}, {o1: {w: 1}}), ev = [[0, 'on', 57, .8], [0, 'on', 64, .8]];
  for (const seed of [0, 1, 2, 3, 5, 7]) {
    const at0 = seed ? [[0, {mkSeed: seed}]] : [];
    const x = R(p, ev, {sec: 1.2, at: at0.concat([[.4, {mkSolo: 2}], [.8, {mkSolo: 0}]])}), y = R(p, ev, {sec: 1.2, at: at0});
    const kx = mKlick(x.l, SR, [0]), ky = mKlick(y.l, SR, [0]);
    // only the windows around the switches (0.4 / 0.8 s)
    const near = (z) => { let w = -99; for (const t of [.4, .8]) { const i0 = Math.round((t - .03) * SR), i1 = Math.round((t + .03) * SR); const s = mKlick(z.l.slice(i0 - SR / 10, i1 + SR / 10), SR, []); w = Math.max(w, s.worst); } return w; };
    console.log('seed', seed, 'with solo: worst', kx.worst.toFixed(2), '@', kx.at.toFixed(3), '| no solo at all: worst', ky.worst.toFixed(2), '@', ky.at.toFixed(3), '| near switches', near(x).toFixed(2));
  }
}
