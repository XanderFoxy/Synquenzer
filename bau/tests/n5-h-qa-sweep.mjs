// QA VC2a-05: cost of the background Abgleich (histSweep) and of a keyframe on a large project, repeated; min/median/max
import { chromium } from 'playwright';
const APP = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-H/index.html';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await (await b.newContext({viewport: {width: 390, height: 844}})).newPage();
await p.goto('file://' + APP); await p.waitForTimeout(2500);
const r = await p.evaluate(async () => {
  const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  Q.addTrack(); Q.addTrack(); for (const t of [0, 2]) Q.setEngine(t, 'mk');
  for (let t = 0; t < NT(); t++) for (let s = 0; s < NS(); s++) {
    if (S.tracks[t].kind === 'drum') { const notes = []; for (let i = 0; i < 64; i++) notes.push({n: [36, 38, 42, 46][i % 4], t: i * .25, d: .1, v: .8}); Q.setClip(t, s, {len: 4, notes}); continue; }
    if (S.tracks[t].kind !== 'synth') continue;
    const notes = []; for (let i = 0; i < 96; i++) notes.push({n: 48 + ((i * 7 + t * 3 + s) % 30), t: +((i / 6) % 16).toFixed(3), d: .2, v: .5 + (i % 5) / 10}); Q.setClip(t, s, {len: 4, notes});
  }
  Q.songFromChain([0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7].map(s => ({scene: s % NS(), bars: 4})));
  await sl(3000); await historyCheck();
  const size = serializeProject().length;
  const res = {size, sweepBpm: [], sweepClip: [], sweepNone: [], kf: [], drainClip: []};
  for (let i = 0; i < 15; i++) {
    // a tempo change (no undo) -> sweep
    S.bpm = 100 + i; markDirty(); let a = performance.now(); histSweep(); res.sweepBpm.push(performance.now() - a);
    // a clip gesture (undo) -> drain, then a sweep after it
    const c = Q.getClip(i % 4, i % NS()); c.notes = c.notes.slice(); c.notes[0] = Object.assign({}, c.notes[0], {v: .3 + i / 50}); Q.setClip(i % 4, i % NS(), c);
    a = performance.now(); histDrainNow(); res.drainClip.push(performance.now() - a);
    a = performance.now(); histSweep(); res.sweepClip.push(performance.now() - a);
    a = performance.now(); histSweep(); res.sweepNone.push(performance.now() - a);
    a = performance.now(); histKeyframe('n'); res.kf.push(performance.now() - a);
    await sl(50);
  }
  const st = x => { const s = x.slice().sort((a, b) => a - b); return {min: +s[0].toFixed(1), med: +s[s.length >> 1].toFixed(1), max: +s[s.length - 1].toFixed(1)}; };
  return {size, sweepBpm: st(res.sweepBpm), sweepAfterClip: st(res.sweepClip), sweepNothing: st(res.sweepNone), drainClip: st(res.drainClip), keyframe: st(res.kf)};
});
console.log(JSON.stringify(r));
await b.close();
