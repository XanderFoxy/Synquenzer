// QA MK4: preview tail after the phrase: VA sound with ECHO send (base + new) vs MS 2000 sound with DELAY TIEFE 127 (new)
import { open, APP } from './v3-qa-mk4reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html';
for (const [name, file, kind] of [['base', BASE, 'va'], ['new', APP, 'va'], ['new', APP, 'mk']]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  const r = await p.evaluate(async kind => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), out = {};
    Q.newProject({init: true}); Q.setBpm(120);
    if (kind === 'mk') { Q.setEngine(0, 'mk'); await sl(300); Q.mkSet(0, 'dly.time', 110); Q.mkSet(0, 'dly.dep', 127); }
    else { Q.setTrackFx(0, 'dly', 1); Q.setBusFx('echo.fb', .85); }
    await Q.libraryReady(); await Q.saveSound(0, 'QA Echo ' + kind); const rec = Q.library().find(x => x.name === 'QA Echo ' + kind);
    if (kind === 'mk') Q.setEngine(0, 'analog'); else Q.setEngine(0, 'fm6'); await sl(300);
    Q.keyOn(40, .01); await sl(50); Q.keyOff(40); await sl(1500);
    Q.preview(0, rec.id);
    const xs = []; const t0 = performance.now(); let endAt = null;
    while (performance.now() - t0 < 8000) { const m = Q.meter(); if (!Q.previewState().on && endAt == null) endAt = performance.now() - t0; xs.push([performance.now() - t0, isFinite(m.rmsDb) ? m.rmsDb : -200]); await sl(10); }
    const pk = (a, z) => Math.round(Math.max(-200, ...xs.filter(x => x[0] >= endAt + a && x[0] < endAt + z).map(x => x[1])));
    return {previewEnd_ms: Math.round(endAt), during: pk(-1000, 0), after_0_300ms: pk(0, 300), after_300_1000ms: pk(300, 1000), after_1_3s: pk(1000, 3000)}; }, kind);
  console.log(name, kind, JSON.stringify(r), errs);
  await b.close();
}
