// QA K1-03 MS 2000: OSC 1 CONTROL 2 (o1.c2) on Säge/Puls/Dreieck = LFO 1 -> wave shape (MKW.form: m = (c1 + LFO1 * c2) / 127).
// Which programs use it, does the Mod-Übersicht list it, is it audible (render vs c2 = 0, shape movement over time)?
import {launch, seedWorklet, renderIn, dbDiff} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
await seedWorklet(p);
const L = await p.evaluate(async () => { mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
  const out = []; for (const [id, f] of FACTORY_BY_ID) if (f.engine === 'mk') { const s = factorySound(id), m = s.p.mk; const dual = m.mode === 1 || m.mode === 2;
    for (let k = 0; k < (dual ? 2 : 1); k++) { const o = m.t[k].o1; if (o.w <= 2 && o.c2 > 0 && m.mode !== 3) { loadPreset(2, id); out.push({id, name: s.name, t: k, w: o.w, c1: o.c1, c2: o.c2, l1: m.t[k].l1, list: SYNQUENZER.k1Mods(2).map(e => e.src + ' → ' + e.dst)}); } } }
  return out; });
console.log('programs with OSC1 CONTROL 2 > 0 on Säge/Puls/Dreieck:', L.length);
for (const o of L.slice(0, 8)) console.log(JSON.stringify({id: o.id, name: o.name, t: o.t, w: o.w, c1: o.c1, c2: o.c2, lfo1: o.l1, listMentionsOsc1: o.list.filter(x => /Osz 1|Steuer|Form|Puls/i.test(x)), list: o.list}));
// audible: the first two single-timbre ones, render vs c2 = 0 and the brightness over time
const sr = 48000, ev = [[0, 'on', 57, .8, 'n'], [2.8, 'off', 57, .8, 'n']];
for (const o of L.filter(o => o.t === 0).slice(0, 3)) {
  const s = await p.evaluate(id => factorySound(id), o.id);
  const a = await renderIn(p, s, ev, {sec: 3, seed: 1}); const z = JSON.parse(JSON.stringify(s)); z.p.mk.t[0].o1.c2 = 0; const c = await renderIn(p, z, ev, {sec: 3, seed: 1});
  // first-difference energy / energy per 50 ms window = brightness; its spread over time
  const br = x => { const r = []; for (let t = .3; t < 2.6; t += .05) { let e = 0, d = 0; const i0 = Math.round(t * sr); for (let i = 1; i < 2400; i++) { e += x[i0 + i] ** 2; d += (x[i0 + i] - x[i0 + i - 1]) ** 2; } r.push(10 * Math.log10(d / e)); } return +(Math.max(...r) - Math.min(...r)).toFixed(2); };
  console.log(JSON.stringify({id: o.id, name: o.name, c2: o.c2, vsC2zero: +dbDiff(c, a).toFixed(1), brightnessSwingDb: br(a), brightnessSwingDbC2zero: br(c), overviewEntries: o.list.length}));
}
console.log('errs', errs);
await b.close();
