import { open, SONG8 } from './n5-v-lib.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(async (s) => {
  const bars = 32, lanes = [[], [], [], [], [], []]; for (let k = 0; k < bars; k += 8) { lanes[0].push({bar: k, slot: 0}); lanes[1].push({bar: k, slot: 0}); lanes[4].push({bar: k, slot: 0}, {bar: k + 4, slot: 1}); }
  SYNQUENZER.setSong({bars, lanes, carrier: [], mel: {}, marks: []}); SYNQUENZER.vvTest({opus: true});
  window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({type: 'longtask'});
  const m = await SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}); const i = SYNQUENZER.vvInfo();
  const big = i.prof.big; delete i.prof.big; for (const k in i.prof) { i.prof[k].avg = +(i.prof[k].sum / i.prof[k].n).toFixed(1); i.prof[k].max = +i.prof[k].max.toFixed(1); delete i.prof[k].sum; }
  return {big, prof: i.prof, lt: window.__lt, dur: m.dur, ms: m.ms};
}, SONG8);
console.log(JSON.stringify(r)); console.log(errs); await b.close();
