// QA regression VS2: real audio out (analyser) base vs new: demo, synth only, drums only, FM engine, cutoff change
import { open, APP, BASE as B0 } from './v3-qareg-mk1-pw.mjs';
const BASE = B0;
const res = {};
const sample = (p, ms) => p.evaluate(async ms => { const Q = window.SYNQUENZER, xs = [], cs = []; const t0 = performance.now(); while (performance.now() - t0 < ms) { const m = Q.meter(); if (isFinite(m.rmsDb)) { xs.push(m.rmsDb); cs.push(m.centroidHz); } await new Promise(r => setTimeout(r, 40)); }
  const lin = xs.map(x => Math.pow(10, x / 20)); const avg = lin.length ? 20 * Math.log10(Math.sqrt(lin.reduce((a, b) => a + b * b, 0) / lin.length)) : -Infinity; return {n: xs.length, avg: +avg.toFixed(1), max: +Math.max(...xs).toFixed(1), cen: Math.round(cs.reduce((a, b) => a + b, 0) / Math.max(1, cs.length))}; }, ms);
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  const r = {};
  r.engine = await p.evaluate(() => { const e = window.SYNQUENZER.engineInfo(); return JSON.stringify(e).slice(0, 300); });
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(120); Q.launchScene(0); });
  await p.waitForTimeout(800); r.demo = await sample(p, 3000);
  await p.evaluate(() => { window.SYNQUENZER.stop(); }); await p.waitForTimeout(1500); r.silent = await sample(p, 800);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'};
    Q.setClip(0, 0, {len: 1, key: K, notes: [0, 1, 2, 3].map(t => ({t, d: .8, n: 57 + t * 3, v: .9}))}); Q.launchClip(0, 0); });
  await p.waitForTimeout(800); r.synth = await sample(p, 2000);
  await p.evaluate(() => { const Q = window.SYNQUENZER; try { Q.setParam(0, 'filter.cutoff', 300); } catch (e) { try { Q.setParam(0, 'cutoff', 300); } catch (e2) { window.__perr = String(e2); } } });
  await p.waitForTimeout(300); r.synthDark = await sample(p, 2000); r.perr = await p.evaluate(() => window.__perr || null);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stopTrackNow(0); Q.setEngine(0, 'fm'); Q.launchClip(0, 0); });
  await p.waitForTimeout(800); r.fm = await sample(p, 2000);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stopTrackNow(0); Q.setClip(4, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 38, v: .9}, {t: 2, d: .1, n: 36, v: .9}, {t: 3, d: .1, n: 42, v: .9}]}); Q.launchClip(4, 0); });
  await p.waitForTimeout(800); r.drums = await sample(p, 2000);
  r.errs = errs.slice(); r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
  res[name] = r; await b.close();
}
for (const k of Object.keys(res.new)) console.log(k, 'base', JSON.stringify(res.base[k]), '| new', JSON.stringify(res.new[k]));
