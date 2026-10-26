// QA regression MK4: MK program delay tail vs stop / ■■ / panic / new project / engine switch / track delete
import { open } from './v3-qa-mk4reg-pw.mjs';
const mode = process.argv[2] || 'panic';
const {b, p, errs} = await open({width: 390, height: 844});
const trace = (ms) => p.evaluate(async ms => { const Q = window.SYNQUENZER, xs = []; const t0 = performance.now(); while (performance.now() - t0 < ms) { const m = Q.meter(); xs.push(Math.round(performance.now() - t0) + ':' + (isFinite(m.rmsDb) ? m.rmsDb.toFixed(0) : '-inf')); await new Promise(r => setTimeout(r, 50)); } return xs.join(' '); }, ms);
const peak = s => Math.max(...s.split(' ').map(x => +x.split(':')[1]).map(v => isFinite(v) ? v : -200));
await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120);
  Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 400));
  Q.mkSet(0, 'dly.dep', 127); Q.mkSet(0, 'dly.sync', 0); Q.mkSet(0, 'dly.time', 110); await new Promise(r => setTimeout(r, 1000));
  Q.setClip(0, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: .25, n: 57, v: .9}]}); Q.launchClip(0, 0); });
const r = {mode};
r.play = peak(await trace(2300));
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stop(); });
r.afterStop = peak(await trace(600));
if (mode === 'panic') await p.evaluate(() => window.SYNQUENZER.panic());
if (mode === 'stop2') await p.evaluate(() => { window.SYNQUENZER.stop(); });
if (mode === 'stopbtn') { await p.click('#bStop').catch(e => r.clickErr = String(e)); }
if (mode === 'newproj') await p.evaluate(() => window.SYNQUENZER.newProject({init: true}));
if (mode === 'demo') await p.evaluate(async () => { await window.SYNQUENZER.loadDemo(); });
if (mode === 'engine') await p.evaluate(() => window.SYNQUENZER.setEngine(0, 'analog'));
if (mode === 'remove') await p.evaluate(() => window.SYNQUENZER.removeTrack(0));
if (mode === 'mute') await p.evaluate(() => window.SYNQUENZER.setMute(0, true));
r.toast = await p.evaluate(() => { const t = document.getElementById('toast'); return t ? t.textContent : null; });
const t = await trace(5000); r.after = t.split(' ').filter((x, i) => i % 4 === 0).join(' ');
r.peak0_1 = peak(t.split(' ').filter(x => +x.split(':')[0] < 1000).join(' ')); r.peak1_5 = peak(t.split(' ').filter(x => +x.split(':')[0] >= 1000).join(' '));
r.track0 = await p.evaluate(() => { const s = window.SYNQUENZER.getSound(0); return s && s.engine; });
r.errs = errs;
console.log(JSON.stringify(r));
await b.close();
