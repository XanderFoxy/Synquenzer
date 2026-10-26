// QA regression MK4: does panic()/■■ silence echo tails? bus echo (VA track, base 4.10.0 and MK4) vs MK program delay (MK4)
import { open, APP } from './v3-qa-mk4reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html';
const [file, kind, act] = [process.argv[2] === 'base' ? BASE : APP, process.argv[3], process.argv[4]];
const {b, p, errs} = await open({width: 390, height: 844}, file);
const trace = (ms) => p.evaluate(async ms => { const Q = window.SYNQUENZER, xs = []; const t0 = performance.now(); while (performance.now() - t0 < ms) { const m = Q.meter(); xs.push(Math.round(performance.now() - t0) + ':' + (isFinite(m.rmsDb) ? m.rmsDb.toFixed(0) : '-inf')); await new Promise(r => setTimeout(r, 50)); } return xs.join(' '); }, ms);
const peak = (s, a, z) => Math.max(...s.split(' ').filter(x => +x.split(':')[0] >= a && +x.split(':')[0] < z).map(x => +x.split(':')[1]).map(v => isFinite(v) ? v : -200));
await p.evaluate(async kind => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120);
  if (kind === 'mk') { Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 400)); Q.mkSet(0, 'dly.dep', 127); Q.mkSet(0, 'dly.sync', 0); Q.mkSet(0, 'dly.time', 110); }
  else { Q.setTrackFx(0, 'dly', 1); Q.setBusFx('echo.fb', .85); }
  await new Promise(r => setTimeout(r, 1000));
  Q.setClip(0, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: .25, n: 57, v: .9}]}); Q.launchClip(0, 0); }, kind).catch(e => console.log('setup err', String(e)));
await trace(2300);
await p.evaluate(() => window.SYNQUENZER.stop());
const s0 = await trace(400);
if (act === 'panic') await p.evaluate(() => window.SYNQUENZER.panic()); else if (act === 'newproj') await p.evaluate(() => window.SYNQUENZER.newProject({init: true})); else if (act === 'load') await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.save(); await Q.load(); }); else if (act === 'import') await p.evaluate(() => { const Q = window.SYNQUENZER; Q.importJSON(Q.serialize()); }); else await p.evaluate(() => window.SYNQUENZER.stop());
const toast = await p.evaluate(() => { const t = document.getElementById('toast'); return t ? t.textContent : null; });
const t = await trace(4000);
console.log(process.argv[2], kind, act, JSON.stringify({beforeAct: peak(s0, 0, 400), toast, after_0_300ms: peak(t, 0, 300), after_300_1000: peak(t, 300, 1000), after_1_4s: peak(t, 1000, 4000), errs}));
await b.close();
