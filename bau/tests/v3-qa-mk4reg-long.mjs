// QA regression MK4 (DoD): 60 s demo playback with an MS 2000 track using all three effects, editor open on DELAY, scene
// switches, transpose chords, single-clip stops; P1 and L1 with touch. Console errors, tick errors, stuck voices, audio present.
import { open, APP } from './v3-qa-mk4reg-pw.mjs';
const vp = process.argv[2] === 'L' ? {width: 844, height: 390} : {width: 390, height: 844};
const {b, p, errs} = await open(vp, APP, true);
const r = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), out = {lv: []};
  await Q.loadDemo(); Q.setBpm(140); Q.launchScene(0); await sl(1500);
  Q.setEngine(0, 'mk'); Q.setEngine(2, 'mk'); await sl(300);
  for (const t of [0, 2]) { Q.mkSet(t, 'mfx.type', t ? 1 : 2); Q.mkSet(t, 'mfx.dep', 100); Q.mkSet(t, 'dly.sync', 1); Q.mkSet(t, 'dly.note', 8); Q.mkSet(t, 'dly.dep', 70); Q.mkSet(t, 'eq.lg', 6); Q.mkSet(t, 'eq.hg', -4); }
  Q.selectTrack(0); Q.openEditor(); await sl(600); window.MKUI && window.MKUI.setWahl(2, 5);
  const t0 = performance.now(); let k = 0;
  while (performance.now() - t0 < 60000) {
    await sl(2500); k++;
    const m = Q.meter(); out.lv.push(Math.round(m.rmsDb));
    if (k % 4 === 0) Q.launchScene(k % 8 === 0 ? 0 : 1);
    if (k === 5) { Q.setKbMode('transpose'); Q.chord([62, 65, 69], 300); }
    if (k === 7) Q.tap(64, 300);
    if (k === 9) { Q.resetCarrier(); Q.setKbMode('play'); }
    if (k === 10) Q.stopTrackNow(2);
    if (k === 11) Q.launchClip(2, 0);
    if (k === 12) Q.setBpm(100);
    if (k === 14) Q.mkSet(0, 'dly.note', 11);
    if (k === 16) Q.setBpm(160);
    if (k === 18) Q.tapSlot(0, Q.runtime().slots[0] < 0 ? 0 : Q.runtime().slots[0]);
  }
  out.te = Q.tickErrors(); out.ed = Q.runtime().editor; out.panel = Q.mkPanel() && Q.mkPanel().sel;
  out.info = Q.engineInfo().perTrack.map(x => [x.path, +(x.load || 0).toFixed(3), x.voices]);
  Q.stop(); await sl(300); Q.stop(); await sl(1500);
  out.voicesAfter = Q.voices().length; out.mkInfo = Q.mkInfo();
  return out; });
r.errs = errs;
console.log(process.argv[2] || 'P', JSON.stringify(r));
await b.close();
