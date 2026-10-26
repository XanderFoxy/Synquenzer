// MS 2000 in Single/Schicht/Split: clip with chords, stopTrackNow, live chord, stop → no hanging voice, silence
import { open, APP } from './v3-qa-mk3reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html';
const meas = (p, ms) => p.evaluate(async ms => { let mx = -200; const t0 = performance.now(); while (performance.now() - t0 < ms) { const m = window.SYNQUENZER.meter(); if (isFinite(m.rmsDb)) mx = Math.max(mx, m.rmsDb); await new Promise(r => setTimeout(r, 30)); } return +mx.toFixed(1); }, ms);
const vo = p => p.evaluate(() => { const v = window.SYNQUENZER.voices(); return JSON.stringify(v).slice(0, 200); });
for (const [name, file, modes] of [['base', BASE, [0]], ['new', APP, [0, 1, 2]]]) for (const mode of modes) {
  const {b, p, errs} = await open({width: 390, height: 844}, file, true);
  await p.evaluate(async mode => { const Q = window.SYNQUENZER; await Q.newProject({init: true}); Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 500));
    if (mode) { Q.mkSet(0, 'mode', mode); Q.mkSet(0, 't.1.o1.w', 1); Q.mkSet(0, 't.1.e2.r', 60); Q.mkSet(0, 'split', 64); }
    Q.mkSet(0, 't.0.e2.r', 60);
    Q.setBpm(240); const N = (t, n, d) => ({t, d, n, v: .8});
    Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [N(0, 60, 1.9), N(0, 64, 1.9), N(0, 67, 1.9), N(0, 72, 1.9), N(2, 62, 1.9), N(2, 65, 1.9), N(2, 69, 1.9), N(2, 74, 1.9)]});
    Q.launchClip(0, 0); }, mode);
  const r = {name, mode};
  await p.waitForTimeout(2500); r.play = await meas(p, 800);
  await p.evaluate(() => window.SYNQUENZER.stopTrackNow(0)); await p.waitForTimeout(4000); r.afterStopTrack = await meas(p, 600); r.voicesA = await vo(p);
  await p.evaluate(() => window.SYNQUENZER.chord([55, 60, 64, 67, 71], 500)); await p.waitForTimeout(150); r.chord = await meas(p, 300);
  await p.waitForTimeout(4500); r.afterChord = await meas(p, 600);
  await p.evaluate(() => window.SYNQUENZER.launchClip(0, 0)); await p.waitForTimeout(2200); await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(4500);
  r.afterStop = await meas(p, 600); r.voicesB = await vo(p); r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
  r.errs = errs; console.log(JSON.stringify(r)); await b.close();
}
