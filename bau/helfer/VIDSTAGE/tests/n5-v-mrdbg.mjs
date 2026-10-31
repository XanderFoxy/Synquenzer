import { open, SONG8 } from './n5-v-lib.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(async (s) => {
  SYNQUENZER.setSong(s); SYNQUENZER.vvTest({noVE: true});
  const c = AU.ctx, log = [];
  const t0 = performance.now(), c0 = c.currentTime;
  const iv = setInterval(() => log.push([Math.round(performance.now() - t0), +(c.currentTime - c0).toFixed(2), c.state]), 1000);
  const m = await SYNQUENZER.vvMake({fmt: '9:16', view: 'matrix', range: {a: 0, b: 4}});
  clearInterval(iv);
  return {m, log, base: c.baseLatency, out: c.outputLatency, sr: c.sampleRate};
}, SONG8);
console.log(JSON.stringify(r)); console.log(errs); await b.close();
