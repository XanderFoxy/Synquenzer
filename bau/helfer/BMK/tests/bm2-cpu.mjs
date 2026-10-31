// BM2-13 CPU (Node / Xeon, like MK1-24): a whole Bit Mask voice (2 oscillators + noise 16x, decimator, SVF with resonance and
// filter envelope, LFO routes, PANS) against one VA voice of 'dirigent-analog' (vs-base-B) in the same run, 9 interleaved runs,
// medians; 12 voices <= 22 %; limiter levels 1 / 2 (8 / 6 voices, new notes take the quietest, the remaining voices bit-equal).
import fs from 'fs';
import {render, on, off} from './bm-node.mjs';
import {render as vaRender} from '../../../tests/v3-mk1-node.mjs';
import {db, rms} from '../../../tests/v3-mk1-ana.mjs';
const HERE = new URL('.', import.meta.url).pathname, BASE = new URL('../../../werkzeug/vs-base-B.html', import.meta.url).pathname;
const SR = 48000, qms = 128 / SR * 1000, R = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + ' — ' + info); res.push({id, ok: !!c, info}); };
const FULL = {o1: {m: 78, e: {l: 99, a: 2, d: 8, s: 10, r: 6}}, o2: {m: 255, st: 7, tu: 6, e: {l: 80, a: 0, d: 6, s: 12, r: 5}}, n: {fr: 70, e: {l: 30, a: 0, d: 5, s: 4, r: 4}},
  f: {md: 'lp', cu: 45, re: 60, tk: 50, e: {l: 40, a: 1, d: 7, s: 5, r: 6}}, pe: {ds: 6, dv: 30}, g: {mo: 'poly', vo: 80, ps: 8},
  l1: {sp: 55, w: 'sin', t: [['freq', 10], ['flt', 20], ['o1m', 8], ['vol', 0]]}, l2: {sp: 30, w: 'saws', t: [['pan', 40], ['freq', 0], ['mask', 0], ['vol', 0]]}};
const prog = {t: 'prog', ab: 'a', p: FULL};
const notes = n => [36, 43, 48, 52, 55, 59, 60, 62, 64, 67, 71, 72].slice(0, n).map((x, k) => [0, on(0, x, .8, k + 1)]);
const bm = n => render([[0, prog]].concat(notes(n)), {sec: 8, quantumMs: true}).qms;
const VA = {o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8};
const va = n => vaRender(null, [36, 43, 48, 52].slice(0, n).map(x => [0, 'on', x, .8]), {sec: 8, quantumMs: true, eng: 0, flat: VA, file: BASE}).qms;
const mean = q => { const a = Array.from(q).slice(750); return a.reduce((x, y) => x + y, 0) / a.length; };
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
if (!process.env.ONLY || /cpu/.test(process.env.ONLY)) {
  const cfg = {bmS: () => bm(0), bm1: () => bm(1), bm12: () => bm(12), vaS: () => va(0), va1: () => va(1)}, Rr = {};
  for (const k in cfg) Rr[k] = [];
  for (let r = 0; r < (+process.env.RUNS || 9); r++) for (const k in cfg) Rr[k].push(mean(cfg[k]()));
  const b1 = med(Rr.bm1) - med(Rr.bmS), b12 = med(Rr.bm12) - med(Rr.bmS), v1 = med(Rr.va1) - med(Rr.vaS);
  ok('BM2-13 ganze Stimme ≤ 1,8 × VA-Stimme; 12 Stimmen ≤ 22 %', b1 / v1 <= 1.8 && b12 / qms * 100 <= 22,
    R(b1 / v1) + ' × (Bit-Mask-Stimme ' + R(b1 / qms * 100) + ' %, VA-Stimme ' + R(v1 / qms * 100) + ' %); 12 Stimmen ' + R(b12 / qms * 100) + ' % (' + R(b12 / 12 / v1) + ' × VA je Stimme); Läufe bm1 ' + R(Math.min(...Rr.bm1) / qms * 100) + '–' + R(Math.max(...Rr.bm1) / qms * 100) + ' %');
  fs.writeFileSync(HERE + 'bm2-cpu.raw.json', JSON.stringify(Rr));
}
// limiter: level 1 -> at most 8 voices, level 2 -> 6; existing voices untouched
{
  const cnt = lv => { let n = 0; render([[0, {t: 'prog', ab: 'a', p: FULL}], [0, {t: 'lim', level: lv}]].concat(notes(12).map(([, m], k) => [0, Object.assign(m, {list: m.list.map(x => Object.assign(x, {at: .01 + k * .02}))})])), {sec: .5, each: (P, f) => { if (f === 128 * 180) n = P.V.filter(v => v.on && !v.ghost).length; }}); return n; };
  const c0 = cnt(0), c1 = cnt(1), c2 = cnt(2);
  const P2 = {o1: {m: 7, e: {l: 99, a: 0, d: 0, s: 15, r: 6}}, f: {md: 'lp', cu: 70}, g: {mo: 'pretrig'}};
  const ten = [[0, {t: 'prog', ab: 'a', p: P2}]]; for (let k = 0; k < 10; k++) ten.push([0, on(.01 + .005 * k, 48 + 3 * k, .8, k + 1)]);
  const X = render(ten.concat([[0, off(.25, 0, 1)], [.3, {t: 'lim', level: 2}], [0, on(.4, 84, .8, 11)]]), {sec: .8});
  const Y = render(ten.filter((x, k) => k !== 1).concat([[0, on(.4, 84, .8, 11)]]), {sec: .8});
  const Z = render(ten.concat([[0, off(.25, 0, 1)]]), {sec: .4});
  let dPre = 0; for (let i = 0; i < Math.round(.4 * SR); i++) dPre = Math.max(dPre, Math.abs(X.l[i] - Z.l[i]));
  const a = Math.round(.41 * SR), d = new Float32Array(X.l.length - a); for (let i = 0; i < d.length; i++) d[i] = X.l[a + i] - Y.l[a + i];
  const mn = db(rms(d) / rms(Y.l, a));
  ok('BM2-13 Begrenzer: Stufe 1 → 8, Stufe 2 → 6 Stimmen; neue Note nimmt die leiseste; die übrigen unverändert (M-NULL ≤ −90 dB)', c0 === 12 && c1 === 8 && c2 === 6 && dPre === 0 && mn <= -90,
    'aktive Stimmen nach 12 Noten: ' + c0 + ' / ' + c1 + ' / ' + c2 + '; Stufe 2 an klingenden Stimmen: Differenz ' + dPre + '; nach dem Klau gegen „ohne die leiseste“: ' + R(mn, 1) + ' dB. Offline: der Host schickt keinen Begrenzer (BM6)');
}
fs.writeFileSync(HERE + 'bm2-cpu.out.json', JSON.stringify(res, null, 1));
process.exit(fails ? 1 : 0);
