// VV1-fix probe: cost of each stage of vvSwapIn (graph build on the offline context), production path vvRender of SONG8
import { open, SONG8 } from './n5-v-abn-lib.mjs';
const {b, p, errs} = await open({init: () => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({entryTypes: ['longtask']}); } catch (e) {} }});
const r = await p.evaluate(async (song) => {
  SYNQUENZER.setSong(song); SYNQUENZER.vvTest({});
  const T = {}; const wrap = n => { const f = window[n]; window[n] = function (...a) { const t = performance.now(); try { return f.apply(this, a); } finally { (T[n] = T[n] || []).push(+(performance.now() - t).toFixed(1)); } }; };
  for (const n of ['vvSnap', 'buildFx', 'upgradeHall', 'applyHall', 'buildTrack', 'syncEngines', 'rebuildNativeLfos', 'mkWheelSync', 'songPlayStart', 'vvSwapIn', 'vvSwapOut', 'tick', 'mkLoad']) if (typeof window[n] === 'function') wrap(n);
  const out = [];
  for (let k = 0; k < 3; k++) { for (const n in T) T[n].length = 0; VV.prof = {}; window.__lt.length = 0; const t0 = performance.now(); const x = await SYNQUENZER.vvRender(); const t1 = performance.now();
    out.push({ms: Math.round(t1 - t0), T: JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(T).map(([k, v]) => [k, k === 'tick' ? [v.length, Math.max(...v)] : v])))), prof: Object.fromEntries(Object.entries(VV.prof).filter(([k]) => k !== 'big').map(([k, v]) => [k, Math.round(v.max)])), lt: window.__lt.map(e => [Math.round(e[0] - t0), Math.round(e[1])])}); }
  return out;
}, SONG8);
console.log(JSON.stringify(r, null, 0), errs); await b.close();
