// QA MK2-07 / B.6 Nr. 1: MK1 sounds (waves 0-2, patches at intensity 0), VA and FM render bit-identical to 4.9.0 (mkRender in both apps)
import {launch, openApp, RS} from './v3-qa-mk2-lib.mjs';
const NEW = new URL('../mk-wt/index.html', import.meta.url).pathname, OLD = new URL('../synq-snapshots/G-MK1-merged.html', import.meta.url).pathname;
const b = await launch(); const A = await openApp(b, OLD), B = await openApp(b, NEW);
// random MK1 sounds built in the OLD page (its normMk), deterministic generator
const snds = await A.page.evaluate(() => {
  let s = 7; const R = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }, I = (a, b) => a + Math.floor(R() * (b - a + 1));
  const out = [];
  for (let k = 0; k < 24; k++) {
    const x = factorySound(INIT_IDS.mk), t = x.p.mk.t[0];
    t.asg = I(0, 2); t.o1 = {w: I(0, 2), c1: I(0, 127), c2: I(0, 127)}; t.o2 = {w: I(0, 2), mod: I(0, 3), semi: I(-24, 24), tune: I(-63, 63)};
    t.mix = {o1: I(40, 127), o2: I(0, 127), n: R() < .3 ? I(0, 60) : 0}; t.f = {type: I(0, 3), cut: I(20, 127), res: I(0, 127), eg: I(-63, 63), vel: I(-63, 63), kbd: I(-63, 63)};
    t.a = {lvl: I(60, 127), pan: I(-63, 63), gate: I(0, 1), dist: I(0, 1), vel: I(-63, 63), kbd: I(-63, 63)};
    t.e1 = {a: I(0, 60), d: I(0, 127), s: I(0, 127), r: I(0, 80), rst: I(0, 1)}; t.e2 = {a: I(0, 60), d: I(0, 127), s: I(0, 127), r: I(0, 80), rst: I(0, 1)};
    t.l1 = {w: I(0, 3), ks: I(0, 2), sync: 0, f: I(0, 127), note: I(0, 14)}; t.l2 = {w: I(0, 3), ks: I(0, 2), sync: I(0, 1), f: I(0, 127), note: I(0, 14)};
    t.vib = I(-63, 63); t.porta = R() < .3 ? I(0, 90) : 0; t.udet = I(0, 99); t.trans = I(-5, 5); t.tune = I(-50, 50); t.bend = I(-12, 12);
    t.p = t.p.map(p => ({s: I(0, 7), d: I(0, 7), i: 0}));
    x.p.mk = SQMK.normMk(x.p.mk); out.push(x);
  }
  // VA and FM factory sounds (a few)
  const lib = (typeof FACTORY !== 'undefined' ? FACTORY : []).filter(f => f && f.engine && f.engine !== 'drum');
  for (const e of ['analog', 'fm6', 'wt']) { const l = lib.filter(f => f.engine === e).slice(0, 4); for (const f of l) out.push(JSON.parse(JSON.stringify(f))); if (!l.length) out.push(factorySound(INIT_IDS[e])); }
  return out;
});
const ev = [[0, 'on', 48, .9], [.1, 'on', 55, .7], [.25, 'on', 60, .5], [.4, 'on', 64, .8], [.5, 'on', 67, .6], [.8, 'off', 48], [.9, 'off', 55], [1.0, 'off', 60], [1.1, 'off', 64], [1.2, 'off', 67], [1.3, 'on', 72, 1], [1.7, 'off', 72]];
let bad = 0, n = 0, eng = {};
for (const s of snds) {
  const a = await RS(A.page, s, ev, {sec: 2.2, seed: 3}), c = await RS(B.page, s, ev, {sec: 2.2, seed: 3});
  let d = 0, e = 0; for (let k = 0; k < a.l.length; k++) { d = Math.max(d, Math.abs(a.l[k] - c.l[k]), Math.abs(a.r[k] - c.r[k])); e = Math.max(e, Math.abs(a.l[k])); }
  n++; eng[s.engine] = (eng[s.engine] || 0) + 1; if (d > 1e-6) { bad++; console.log('DIFF', s.engine, s.name || '', 'max|d|', d, 'peak', e); }
}
console.log('MK2-07 sounds', n, JSON.stringify(eng), 'differing', bad, 'errors', A.errs.length, B.errs.length);
await b.close();
