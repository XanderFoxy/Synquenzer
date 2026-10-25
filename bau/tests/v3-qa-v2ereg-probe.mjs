import { open } from './v3-v2d-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844}, undefined, true);
const r = await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(240); Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); Q.songView(true); await new Promise(r => setTimeout(r, 400));
  return {info: Q.svLayoutInfo(), marks: Q.songMarks(), song: (({bars, carrier, marks, melodyTrack, loop}) => ({bars, carrier, marks, melodyTrack, loop}))(Q.song()), parts: (Q.parts() || []).map(x => x && x.name)}; });
console.log(JSON.stringify(r, null, 0).slice(0, 3000));
console.log(errs); await b.close();
