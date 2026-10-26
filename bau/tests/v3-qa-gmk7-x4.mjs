// level staging: master limiter gain reduction and track levels for pad = VA / MS 2000 synth / vocoder (E2 = lead) / vocoder only-input / held
import {open, sleep} from './v3-qa-gmk7-tl.mjs';
import {setupProject} from './v3-qa-gmk7-setup.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
await setupProject(E);
const nodeLvl = (expr, ms = 1500) => E(([expr, ms]) => new Promise(r => { const n = eval(expr); if (!n) return r(null); const c = AU.ctx, a = c.createAnalyser(); a.fftSize = 2048; n.connect(a); const b = new Float32Array(2048); let pk = 0, ss = 0, N = 0, over = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(b); for (const v of b) { pk = Math.max(pk, Math.abs(v)); ss += v * v; N++; if (Math.abs(v) > 1) over++; } }, 40); setTimeout(() => { clearInterval(iv); try { n.disconnect(a); } catch (e) {} r({pk: +(20 * Math.log10(pk + 1e-15)).toFixed(1), rms: +(10 * Math.log10(ss / Math.max(1, N) + 1e-30)).toFixed(1), over1: +(over / Math.max(1, N) * 100).toFixed(2)}); }, ms); }), [expr, ms]);
const red = async (ms = 4000) => { const r = []; const t0 = Date.now(); while (Date.now() - t0 < ms) { r.push(await E(() => AU.M.reductionDb())); await sleep(100); } r.sort((a, b) => a - b); return {min: +r[0].toFixed(1), med: +r[r.length >> 1].toFixed(1)}; };
await E(() => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); }); await sleep(1500);
const out = {};
const meas = async k => { await sleep(1200); out[k] = {padRaw: await nodeLvl('AU.synth[2].node', 3000), padPost: await nodeLvl('AU.tracks[2].cut', 2000), master: await nodeLvl('AU.M.ceil', 2000), red: await red(4000)}; log(k, JSON.stringify(out[k])); };
await meas('VA pad');
await E(() => SYNQUENZER.setEngine(2, 'mk')); await meas('MS 2000 synth pad');
await E(() => { SYNQUENZER.mkSet(2, 'mode', 3); SYNQUENZER.mkIn(2, 'e2', 3); }); await meas('vocoder E2=lead');
await E(() => { SYNQUENZER.mkIn(2, 'e2', undefined, 0); }); await meas('vocoder E2=lead, nur Eingang');
await E(() => { SYNQUENZER.mkSet(2, 'mode', 0); }); await meas('MS 2000 synth again (lead cut? no: mode 0)');
await E(() => { SYNQUENZER.mkSet(2, 'mode', 3); SYNQUENZER.mkIn(2, 'e2', 5); SYNQUENZER.mkIn(2, 'e2', undefined, 1); }); await meas('vocoder E2=drums');
log('errs', errs);
await T.br.close();
