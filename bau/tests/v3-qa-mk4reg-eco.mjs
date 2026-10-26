// QA regression MK4: native fallback (forceNative) with an MS 2000 track that has effects set: plays, no errors (base vs new)
import { open, APP } from './v3-qa-mk4reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html';
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  const r = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    Q.newProject({init: true}); Q.setBpm(120); Q.setEngine(0, 'mk'); await sl(300);
    try { Q.mkSet(0, 'dly.dep', 64); Q.mkSet(0, 'mfx.dep', 80); Q.mkSet(0, 'eq.lg', 6); } catch (e) {}
    Q.setClip(0, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [0, 1, 2, 3].map(t => ({t, d: .5, n: 57 + t * 3, v: .9}))}); Q.launchClip(0, 0); await sl(1500);
    try { Q.forceNative(); } catch (e) { return {err: String(e)}; } await sl(500);
    const xs = []; for (let i = 0; i < 60; i++) { const m = Q.meter(); xs.push(isFinite(m.rmsDb) ? m.rmsDb : -200); await sl(40); }
    const info = Q.engineInfo(); return {path: info.perTrack[0].path, synth: info.synth, peak: Math.round(Math.max(...xs)), te: Q.tickErrors()}; });
  console.log(name, JSON.stringify(r), errs);
  await b.close();
}
