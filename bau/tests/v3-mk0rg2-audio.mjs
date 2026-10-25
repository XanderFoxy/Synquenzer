// QA regression MK0: real audio out (Q.meter) base vs new: demo, synth VA/FM/WT, drums (two kits), preset load during play
import { open, NEW, BASE } from './v3-mk0rg2-lib.mjs';
const res = {};
const sample = (p, ms) => p.evaluate(async ms => { const Q = window.SYNQUENZER, xs = [], cs = []; const t0 = performance.now(); while (performance.now() - t0 < ms) { const m = Q.meter(); if (isFinite(m.rmsDb)) { xs.push(m.rmsDb); cs.push(m.centroidHz); } await new Promise(r => setTimeout(r, 40)); }
  const lin = xs.map(x => Math.pow(10, x / 20)); const avg = lin.length ? 20 * Math.log10(Math.sqrt(lin.reduce((a, b) => a + b * b, 0) / lin.length)) : -Infinity; return {avg: +avg.toFixed(1), cen: Math.round(cs.reduce((a, b) => a + b, 0) / Math.max(1, cs.length))}; }, ms);
for (const [name, file] of [['base', BASE], ['new', NEW], ['base2', BASE], ['new2', NEW]]) {
  const {p, errs, close} = await open(file, 'P1', false);
  const r = {};
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(120); Q.launchScene(0); });
  await p.waitForTimeout(1000); r.demo = await sample(p, 3000);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stop(); Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'};
    Q.setClip(0, 0, {len: 1, key: K, notes: [0, 1, 2, 3].map(t => ({t, d: .8, n: 57 + t * 3, v: .9}))}); Q.launchClip(0, 0); });
  await p.waitForTimeout(800); r.va = await sample(p, 2000);
  await p.evaluate(() => window.SYNQUENZER.setEngine(0, 'fm')); await p.waitForTimeout(500); r.fm = await sample(p, 2000);
  await p.evaluate(() => window.SYNQUENZER.setEngine(0, 'wt')); await p.waitForTimeout(500); r.wt = await sample(p, 2000);
  await p.evaluate(() => { const Q = window.SYNQUENZER; const f = Q.factory().find(x => x.engine === 'analog' && /bass/i.test(x.cat || '')) || Q.factory()[3]; Q.loadPreset(0, f.id); }); await p.waitForTimeout(500); r.preset = await sample(p, 2000);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stopTrackNow(0); Q.setClip(4, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 38, v: .9}, {t: 2, d: .1, n: 36, v: .9}, {t: 3, d: .1, n: 42, v: .9}]}); Q.launchClip(4, 0); });
  await p.waitForTimeout(800); r.drums = await sample(p, 2000);
  await p.evaluate(() => { const Q = window.SYNQUENZER; const k = Q.kits()[1]; Q.loadKit(k.id || k); }); await p.waitForTimeout(500); r.drums2 = await sample(p, 2000);
  r.errs = errs.slice(); r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
  res[name] = r; await close();
}
for (const k of Object.keys(res.new)) console.log(k, 'base', JSON.stringify(res.base[k]), JSON.stringify(res.base2[k]), '| new', JSON.stringify(res.new[k]), JSON.stringify(res.new2[k]));
