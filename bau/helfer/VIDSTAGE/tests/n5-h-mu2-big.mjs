// a big song project (8 tracks x 8 scenes, 64 notes each, MS 2000 on 2 tracks, song 64 bars): recorder cost per sweep/keyframe
import {open, sleep} from './n5-h-mu2-lib.mjs';
const T = await open({vp: [390, 844]}); const {p, E} = T;
await E(async () => { const Q = SYNQUENZER; mkLoad(); for (let i = 0; i < 80 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
  Q.addTrack(); Q.addTrack(); Q.setEngine(1, 'mk'); loadPreset(1, 'f-mk-d05'); Q.setEngine(6, 'mk'); loadPreset(6, 'f-mk-e15');
  for (let t = 0; t < NT(); t++) { if (S.tracks[t].kind !== "synth") continue; for (let s = 0; s < NS(); s++) Q.setClip(t, s, {len: 4, notes: Array.from({length: 64}, (_, i) => ({t: i * .25, d: .2, n: 48 + ((i * 7 + t * 3 + s) % 24), v: .5 + (i % 4) * .1}))}); }
  Q.songFromChain(Array.from({length: 16}, (_, i) => ({scene: i % NS(), bars: 4}))); });
await sleep(3000); await T.drain();
const r = await E(() => { const len = serializeProject().length; const m = []; for (let i = 0; i < 5; i++) { const a = performance.now(); histSweep(); m.push(performance.now() - a); }
  const k = []; for (let i = 0; i < 3; i++) { const a = performance.now(); histKeyframe('n'); k.push(performance.now() - a); }
  // one knob-like change, then the sweep
  const c = []; for (let i = 0; i < 5; i++) { S.tracks[0].sound.p.cutoff = 1000 + i; const a = performance.now(); histSweep(); c.push(performance.now() - a); }
  const g = []; for (let i = 0; i < 5; i++) { const a = performance.now(); SYNQUENZER.setClip(2, i % NS(), {len: 4, notes: [{t: 0, d: 1, n: 60 + i, v: .8}]}); histDrainNow(); g.push(performance.now() - a); }
  return {projKB: Math.round(len / 1024), sweepNoChange: m.map(x => +x.toFixed(1)), keyframe: k.map(x => +x.toFixed(1)), sweepOneChange: c.map(x => +x.toFixed(1)), clipGesture: g.map(x => +x.toFixed(1))}; });
console.log(JSON.stringify(r));
await T.b.close();
