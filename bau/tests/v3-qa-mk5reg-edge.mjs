// QA MK5: arp edge cases around core flows (new only): remove track, mute, project switch, song with melody, tempo, undo
import { open, APP } from './v3-qa-mk5reg-pw.mjs';
const only = process.argv[2] ? process.argv[2].split(',') : null;
const scen = {
  removeTrack: async p => p.evaluate(async () => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
    Q.newProject({init: true}); Q.setBpm(120); const ok = Q.addTrack(); await sl(300); const i = Q.project().tracks.length - 1;
    Q.selectTrack(i); Q.setEngine(i, 'mk'); await sl(500); Q.mkSet(i, 'arp.on', 1); Q.mkSet(i, 'arp.latch', 1); await sl(200);
    Q.keyOn(60, .8, 'a'); Q.keyOn(64, .8, 'b'); await sl(300); Q.keyOff(60, 'a'); Q.keyOff(64, 'b'); await sl(600);
    const n0 = Q.arpLog(i).length; const v0 = Q.voices().length;
    const rm = Q.removeTrack(i); await sl(1500);
    const v1 = Q.voices(); const info = Q.arpInfo(i);
    // add a fresh track at the same index: does it inherit anything?
    Q.addTrack(); await sl(300); const j = Q.project().tracks.length - 1; await sl(800); const v2 = Q.voices();
    return {ok, i, n0, v0, rm, voicesAfterRemove: v1.length, v1: JSON.stringify(v1).slice(0, 300), info: JSON.stringify(info).slice(0, 300), j, voicesAfterReAdd: v2.length, engJ: Q.getSound(j) && Q.getSound(j).engine}; }),
  mute: async p => p.evaluate(async () => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
    Q.newProject({init: true}); Q.setBpm(120); Q.setEngine(1, 'mk'); await sl(500); const K = {root: 9, scale: 'aeolian'};
    Q.setClip(1, 0, {len: 1, key: K, notes: [57, 60, 64].map(n => ({t: 0, d: 4, n, v: .8}))}); Q.mkSet(1, 'arp.on', 1); await sl(200);
    Q.launchClip(1, 0); await sl(1200);
    const nA = Q.arpLog(1).length; window.setMute(1, true); const tM = performance.now(); await sl(1200); const nB = Q.arpLog(1).length; const vB = Q.voices().filter(v => v.track === 1).length;
    const lateNotes = Q.noteLog(400).filter(n => n.track === 1 && n.src === 'arp' && n.time > AU.ctx.currentTime - 1.0).length;
    window.setMute(1, false); await sl(2500); const nC = Q.arpLog(1).length;
    Q.stop(); await sl(1500);
    return {nA, nB, vB, lateNotes, resumed: nC - nB, vEnd: Q.voices().length}; }),
  projectSwitch: async p => p.evaluate(async () => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
    Q.newProject({init: true}); Q.setBpm(120); Q.setEngine(0, 'mk'); await sl(500); Q.selectTrack(0); Q.mkSet(0, 'arp.on', 1); Q.mkSet(0, 'arp.latch', 1); await sl(200);
    Q.keyOn(60, .8, 'a'); Q.keyOn(67, .8, 'b'); await sl(300); Q.keyOff(60, 'a'); Q.keyOff(67, 'b'); await sl(500);
    await Q.loadDemo(); await sl(1500); const v = Q.voices(); const n1 = Q.noteLog(400).filter(n => n.src === 'arp' && n.time > AU.ctx.currentTime - .8).length;
    return {voices: v.length, arpAfter: n1, eng0: Q.getSound(0).engine}; }),
  song: async p => p.evaluate(async () => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
    Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'};
    Q.setEngine(1, 'mk'); await sl(500);
    Q.setClip(1, 0, {len: 1, key: K, notes: [57, 60, 64].map(n => ({t: 0, d: 4, n, v: .8}))}); Q.setClip(1, 1, {len: 1, key: K, notes: [55, 59, 62].map(n => ({t: 0, d: 4, n, v: .8}))});
    Q.setClip(4, 0, {len: 1, key: K, notes: [0, 1, 2, 3].map(t => ({t, d: .1, n: 36, v: .9}))}); Q.setClip(4, 1, {len: 1, key: K, notes: [0, 1, 2, 3].map(t => ({t, d: .1, n: 38, v: .9}))});
    Q.mkSet(1, 'arp.on', 1); await sl(200);
    Q.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}]); Q.clearLog(); Q.songPlay(0); await sl(2400); Q.stop(); await sl(1500);
    const L = Q.noteLog(4000).filter(n => n.beat != null && n.beat >= 0);
    const t1 = L.filter(n => n.track === 1), set = (a, b) => [...new Set(t1.filter(n => n.beat >= a && n.beat < b).map(n => n.out))].sort();
    return {bar0: set(0, 4), bar1: set(4, 8), src: [...new Set(t1.map(n => n.src))], drums: L.filter(n => n.track === 4).length, voices: Q.voices().length, te: Q.tickErrors()}; }),
  tempoUndo: async p => p.evaluate(async () => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
    Q.newProject({init: true}); Q.setBpm(120); Q.setEngine(0, 'mk'); await sl(500); Q.selectTrack(0); Q.mkSet(0, 'arp.on', 1);
    Q.play && Q.play(); await sl(300); Q.keyOn(60, .8, 'a'); Q.keyOn(64, .8, 'b'); await sl(600); Q.setBpm(90); await sl(800); Q.keyOff(60, 'a'); Q.keyOff(64, 'b'); await sl(300);
    const L = Q.arpLog(0).map(x => x.t); const d = []; for (let k = 1; k < L.length; k++) d.push(+(L[k] - L[k - 1]).toFixed(4));
    Q.stop(); await sl(1200); const u = Q.undoInfo();
    for (let k = 0; k < 4; k++) Q.undo(); await sl(200);
    return {gaps: [...new Set(d)], voices: Q.voices().length, undoTop: u.top && u.top.label, eng: Q.getSound(0).engine, arp: Q.mkGet(0) && Q.mkGet(0).arp.on}; }),
};
for (const k of Object.keys(scen)) {
  if (only && !only.includes(k)) continue;
  const {b, p, errs} = await open({width: 390, height: 844}, APP);
  let r; try { r = await scen[k](p); } catch (e) { r = {fail: String(e).slice(0, 400)}; }
  console.log('==', k, JSON.stringify(r), 'errs', JSON.stringify(errs));
  await b.close();
}
