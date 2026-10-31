// QA musiker VV1-05: where the main-thread time goes (VV.prof) — realistic song vs. same song without the MS 2000 track, interleaved
import { open, buildSong, OUTQ } from './n5-v-qm-lib.mjs';
import { execSync } from 'child_process';
const {b, p, errs} = await open({touch: true});
await buildSong(p, {bars: 24});
await p.evaluate(() => { const s = JSON.parse(JSON.stringify(S.song)); s.lanes = s.lanes.map(l => { const o = []; for (let k = 0; k < 24; k += 12) for (const e of l) if (e.bar < 12) o.push(Object.assign({}, e, {bar: e.bar + k})); return o; }); window.__full = s; const s2 = JSON.parse(JSON.stringify(s)); s2.lanes[3] = []; window.__nomk = s2; SYNQUENZER.vvTest({opus: true}); });
const run = async (which, make) => p.evaluate(async ([which, make]) => {
  SYNQUENZER.setSong(window[which]); await new Promise(r => setTimeout(r, 300));
  window.__lt = []; const po = new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }); po.observe({type: 'longtask'});
  const t0 = performance.now(); let x; if (make) x = await SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}); else x = await SYNQUENZER.vvRender({});
  const wall = performance.now() - t0; po.disconnect();
  const P = SYNQUENZER.vvInfo().prof || {}, big = {}; for (const [k] of (P.big || [])) big[k] = (big[k] || 0) + 1;
  const f = o => o ? {n: o.n, max: Math.round(o.max), avg: +(o.sum / o.n).toFixed(1)} : null;
  return {which, make, dur: +x.dur.toFixed(1), wallS: +(wall / 1000).toFixed(1), x: +(x.dur * 1000 / wall).toFixed(2), lt: window.__lt.length, ltMax: Math.max(0, ...window.__lt), lt100: window.__lt.filter(d => d > 100).length, susp: f(P.susp), frame: f(P.frame), swapIn: f(P.swapIn), big30: big};
}, [which, make]);
for (const make of [false, true]) for (const w of ['__full', '__nomk', '__full', '__nomk']) { const l = execSync('cat /proc/loadavg').toString().split(' ')[0]; const r = await run(w, make); console.log('load', l, JSON.stringify(r)); }
console.log('errors', errs);
await b.close();
