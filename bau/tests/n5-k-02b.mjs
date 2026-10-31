// K1-02 (Hintergrund): the context the 30-s idle timer suspended while the page was hidden runs again when the page is
// visible (LFOs, LFO dot), without waiting for a tap
import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch();
const r = await p.evaluate(async () => {
  await AU.ctx.suspend(); UI.idleSusp = true; const t0 = AU.ctx.currentTime, s0 = AU.ctx.state;
  document.dispatchEvent(new Event('visibilitychange')); await new Promise(r => setTimeout(r, 400));
  return {before: s0, after: AU.ctx.state, advanced: +(AU.ctx.currentTime - t0).toFixed(3)};
});
console.log(JSON.stringify(Object.assign(r, {pass: r.before === 'suspended' && r.after === 'running' && r.advanced > .1, errs})));
await b.close();
