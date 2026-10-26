// QA MK7 regression: N.cut in every track chain: sends (Hall/Echo) tails, track volume 0, mute; base vs new (real meter)
import { open, APP } from './v3-qa-mk7reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk6-base-4.12.0.html';
const sample = (p, ms) => p.evaluate(async ms => { const Q = window.SYNQUENZER, xs = []; const t0 = performance.now(); while (performance.now() - t0 < ms) { const m = Q.meter(); if (isFinite(m.rmsDb)) xs.push(m.rmsDb); await new Promise(r => setTimeout(r, 40)); }
  const lin = xs.map(x => Math.pow(10, x / 20)); return lin.length ? +(20 * Math.log10(Math.sqrt(lin.reduce((a, b) => a + b * b, 0) / lin.length))).toFixed(1) : -999; }, ms);
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  const r = {};
  for (const [lab, rev, dly] of [['dry', 0, 0], ['hall', 1, 0], ['echo', 0, 1]]) {
    await p.evaluate(([rev, dly]) => { const Q = window.SYNQUENZER; Q.stop(); Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'};
      Q.setTrackFx(0, 'rev', rev); Q.setTrackFx(0, 'dly', dly);
      Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .2, n: 69, v: .9}]}); Q.launchClip(0, 0); }, [rev, dly]);
    await p.waitForTimeout(700); r[lab + '_on'] = await sample(p, 800);
    await p.evaluate(() => window.SYNQUENZER.stopTrackNow(0)); await p.waitForTimeout(250); r[lab + '_tail'] = await sample(p, 700);
  }
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stop(); Q.newProject({init: true}); Q.setBpm(120); Q.setClip(0, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [0, 1, 2, 3].map(t => ({t, d: .8, n: 57, v: .9}))}); Q.launchClip(0, 0); });
  await p.waitForTimeout(700); r.play = await sample(p, 800);
  await p.evaluate(() => window.SYNQUENZER.setTrackFx(0, 'vol', 0)); await p.waitForTimeout(400); r.vol0 = await sample(p, 800);
  await p.evaluate(() => window.SYNQUENZER.setTrackFx(0, 'vol', .8)); await p.waitForTimeout(400); r.vol8 = await sample(p, 800);
  await p.evaluate(() => window.SYNQUENZER.setMute(0, true)); await p.waitForTimeout(800); r.mute = await sample(p, 800);
  await p.evaluate(() => window.SYNQUENZER.setMute(0, false)); await p.waitForTimeout(1200); r.unmute = await sample(p, 800);
  r.errs = errs.slice(); console.log(name, JSON.stringify(r)); await b.close();
}
