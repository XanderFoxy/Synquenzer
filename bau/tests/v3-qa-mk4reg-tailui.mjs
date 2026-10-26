// QA MK4 regression: ■ then ■ again within 1 s (header button, real clicks) = "Hall und Echo aus" -> does the MS 2000 DELAY stop?
// base 4.10.0 with the bus echo (VA track, ECHO send) vs MK4 with the program delay of an MS 2000 track
import { open, APP } from './v3-qa-mk4reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html';
for (const [name, file, kind] of [['base', BASE, 'bus'], ['new', APP, 'bus'], ['new', APP, 'mk']]) for (const vp of [[390, 844], [844, 390]]) {
  const {b, p, errs} = await open({width: vp[0], height: vp[1]}, file, true);
  const trace = (ms) => p.evaluate(async ms => { const Q = window.SYNQUENZER, xs = []; const t0 = performance.now(); while (performance.now() - t0 < ms) { const m = Q.meter(); xs.push([performance.now() - t0, isFinite(m.rmsDb) ? m.rmsDb : -200]); await new Promise(r => setTimeout(r, 25)); } return xs; }, ms);
  const pk = (xs, a, z) => Math.round(Math.max(...xs.filter(x => x[0] >= a && x[0] < z).map(x => x[1])));
  await p.evaluate(async kind => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120);
    if (kind === 'mk') { Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 300)); Q.mkSet(0, 'dly.time', 110); Q.mkSet(0, 'dly.dep', 127); }
    else { Q.setTrackFx(0, 'dly', 1); Q.setBusFx('echo.fb', .85); }
    Q.setClip(0, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: .25, n: 57, v: .9}]}); Q.launchClip(0, 0); }, kind);
  await p.waitForTimeout(4400);
  await p.tap('#bPlay'); await p.waitForTimeout(350); await p.tap('#bPlay');
  const toast = await p.evaluate(() => { const t = document.getElementById('toast'); return t ? t.textContent : null; });
  const xs = await trace(4000);
  console.log(name, kind, vp.join('x'), JSON.stringify({toast, playing: await p.evaluate(() => window.SYNQUENZER.runtime().playing), dB_0_300ms: pk(xs, 0, 300), dB_300ms_1s: pk(xs, 300, 1000), dB_1_4s: pk(xs, 1000, 4000), errs}));
  await b.close();
}
