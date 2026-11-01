// QA K1: user-set built-in modulations that the Mod-Übersicht does not list: FM pitch envelope (TONH. page), WT scan (factory)
import {launch, renderIn, dbDiff, freqZC} from './n5-k-blib.mjs';
const {b, p, errs} = await launch();
const sr = 48000;
// FM: INIT FM, pitch EG L1 = 70 (above 50 = up), falling to 50 over the rates -> a pitch sweep on every note
const fm = await p.evaluate(() => { const A = SYNQUENZER; A.setEngine(1, 'fm'); A.initSound(1); const before = A.getSound(1); A.setFmPeg(1, {r: [60, 40, 99, 99], l: [62, 50, 50, 50]}); const s = A.getSound(1); return {before, after: s, peg: s.p.fm6 && s.p.fm6.peg, list: A.k1Mods(1).map(e => e.src + ' → ' + e.dst + ' ' + e.amt)}; });
const ev = [[0, 'on', 57, .8], [1.8, 'off', 57]];
const x = await renderIn(p, fm.after, ev, {sec: 2, seed: 1}), y = await renderIn(p, fm.before, ev, {sec: 2, seed: 1});
const cents = a => { const L = []; for (let t = .02; t < 1.2; t += .1) { const f = freqZC(a, sr, Math.round(t * sr), Math.round((t + .08) * sr)); L.push(Math.round(1200 * Math.log2(f / 220))); } return L; };
console.log('FM pitch EG', JSON.stringify(fm.peg), 'list', JSON.stringify(fm.list), 'cents over time with PEG', JSON.stringify(cents(x)), 'without', JSON.stringify(cents(y)));
// WT factory: WT Glas scan -0,5 / 1,5 s vs scan 0
for (const id of ['f-wt-glas', 'f-wt-vokal']) {
  const w = await p.evaluate(id => { const A = SYNQUENZER; A.setEngine(1, 'wt'); loadPreset(1, id); const s = A.getSound(1); return {s, list: A.k1Mods(1).map(e => e.src + ' → ' + e.dst)}; }, id);
  const z = JSON.parse(JSON.stringify(w.s)); z.p.wt.scan = 0;
  const a = await renderIn(p, w.s, ev, {sec: 2, seed: 1}), c = await renderIn(p, z, ev, {sec: 2, seed: 1});
  console.log(id, 'scan', w.s.p.wt.scan, 'scanTime', w.s.p.wt.scanTime, 'list', JSON.stringify(w.list), 'render vs scan 0', dbDiff(c, a).toFixed(1), 'dB');
}
console.log('errors', JSON.stringify(errs.slice(0, 4)));
await b.close();
