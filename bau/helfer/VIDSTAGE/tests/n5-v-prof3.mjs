import { open, SONG8 } from './n5-v-lib.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(async (song) => {
  const A = SYNQUENZER; A.setSong(song); const out = {};
  for (const st of [0.1, 0.25, 0.5, 0.1, 0.25]) { VV.test = {step: st}; const t = performance.now(); const rr = await vvRenderAudio(); out['s' + st + '_' + Object.keys(out).length] = Math.round(performance.now() - t); }
  // floor: same graph, events only (no suspends) – plain offline context with silence of same length
  return out;
}, SONG8);
console.log(JSON.stringify(r)); console.log(errs);
await b.close();
