import {launch, openApp} from './v3-qa-mk2-lib.mjs';
const b = await launch(); const {page, errs} = await openApp(b, new URL('../mk-wt/index.html', import.meta.url).pathname);
const r = await page.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 500)); const o = await SYNQUENZER.perfProbe(['kern']); return {load_med: o.load_med, load_max: o.load_max, frames_ok: o.frames_ok, q: o.quantum_max_ms, lt: o.longtasks, net: o.net, cases: o.cases && o.cases.map(c => ({id: c.id || c.name, reports: c.reports, load_med: c.load_med}))}; });
console.log(JSON.stringify(r), 'errors', errs.length, errs.slice(0, 2));
await b.close();
