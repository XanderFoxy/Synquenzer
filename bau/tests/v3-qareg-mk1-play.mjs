// 45 s demo playback with editor work: scenes, editors VA/FM/WT/drum, engine VA->MS 2000->VA on a playing track, ECO, stop; errors, tickErrors, stuck voices
import { open, APP, BASE, OUT } from './v3-qareg-mk1-pw.mjs';
const VP = process.argv[2] === 'L1' ? {width: 844, height: 390} : {width: 390, height: 844};
for (const [n, f] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open(VP, f, true);
  const steps = [];
  const W = ms => p.waitForTimeout(ms);
  const mark = async lab => { const r = await p.evaluate(() => { const Q = window.SYNQUENZER; const m = Q.meter(); return {te: Q.tickErrors(), rms: Math.round(m.rmsDb), v: JSON.stringify(Q.voices()).length}; }); steps.push(lab + ' ' + JSON.stringify(r)); };
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.launchScene(0); }); await W(3000); await mark('play s1');
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); }); await W(2000); await mark('ed va');
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.launchScene(1); }); await W(3000); await mark('scene2');
  if (n === 'new') { await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setEngine(0, 'mk'); }); await W(3000); await mark('eng mk'); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.undo(); }); await W(2500); await mark('undo->va'); }
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setEngine(0, 'fm'); }); await W(2500); await mark('eng fm');
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setEngine(0, 'wt'); }); await W(2500); await mark('eng wt');
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.undo(); Q.undo(); }); await W(2000); await mark('undo x2');
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(4); Q.openEditor(); Q.pad('kick'); }); await W(2000); await mark('drum ed');
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.forceNative(true); }); await W(3000); await mark('eco on');
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(1); Q.openEditor(); }); await W(2000); await mark('eco ed');
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.forceNative(false); }); await W(3000); await mark('eco off');
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.closeEditor(); Q.launchScene(0); }); await W(4000); await mark('scene1');
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stop(); }); await W(4000); await mark('stopped');
  const vend = await p.evaluate(() => window.SYNQUENZER.voices());
  console.log('==', n); for (const s of steps) console.log('  ', s);
  console.log('  voices after stop', JSON.stringify(vend).slice(0, 400));
  console.log('  errs', JSON.stringify(errs));
  await b.close();
}
