// QA MK7: "Quelle nur als Eingang" must give the source track back when the MS 2000 track stops using it (engine change, undo, new project, load)
import { open, APP } from './v3-qa-mk7reg-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844}, APP);
await p.evaluate(() => { ensureAudio(); }); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
const r = await p.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), o = {};
  const info = () => Q.mkInInfo().tracks.slice(0, 3).map(t => t && (t.dryCut ? 'CUT' : '-') + (t.e2 ? '+e2' : ''));
  Q.newProject({init: true}); Q.setEngine(0, 'mk'); const s = Q.getSound(0); s.p.mk.mode = 3; applySound(0, s); await sl(300);
  Q.mkIn(0, 'e2', 1, false); await sl(1200); o.set = info();
  Q.setEngine(0, 'analog'); await sl(1300); o.engVA = info();
  o.mkInAfterVA = JSON.stringify(Q.project().tracks[0].mkIn || null); Q.setEngine(0, 'mk'); await sl(1300); o.backToMk = info(); o.mode = Q.getSound(0).p.mk.mode;
  const ser = Q.serialize(); Q.newProject({init: true}); await sl(1300); o.newProj = info();
  Q.importJSON(ser); await sl(1500); o.load = info();
  Q.setClip(1, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [0, 1, 2, 3].map(t => ({t, d: .8, n: 57, v: .9}))});
  Q.newProject({init: true}); await sl(300); Q.setClip(1, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [0, 1, 2, 3].map(t => ({t, d: .8, n: 57, v: .9}))}); Q.launchClip(1, 0); await sl(1500);
  const xs = []; for (let k = 0; k < 15; k++) { xs.push(Q.meter().rmsDb); await sl(40); } o.track1AfterNew = Math.round(Math.max(...xs));
  return o; });
console.log(JSON.stringify(r), JSON.stringify(errs)); await b.close();
