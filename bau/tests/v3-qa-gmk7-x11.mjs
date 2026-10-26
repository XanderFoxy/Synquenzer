// ECO (forceNative) while the vocoder plays with „Quelle nur als Eingang“: what is heard? LCD hint? back to worklet?
import {open, sleep} from './v3-qa-gmk7-tl.mjs';
import {setupProject} from './v3-qa-gmk7-setup.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
await setupProject(E);
const nodeLvl = (expr, ms = 1500) => E(([expr, ms]) => new Promise(r => { const n = eval(expr); if (!n) return r(null); const c = AU.ctx, a = c.createAnalyser(); a.fftSize = 2048; n.connect(a); const b = new Float32Array(2048); let pk = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(b); for (const v of b) pk = Math.max(pk, Math.abs(v)); }, 30); setTimeout(() => { clearInterval(iv); try { n.disconnect(a); } catch (e) {} r(+(20 * Math.log10(pk + 1e-15)).toFixed(1)); }, ms); }), [expr, ms]);
await E(() => { SYNQUENZER.setEngine(2, 'mk'); SYNQUENZER.mkSet(2, 'mode', 3); SYNQUENZER.mkIn(2, 'e2', 3); SYNQUENZER.mkIn(2, 'e2', undefined, 0); SYNQUENZER.launchScene(0); SYNQUENZER.play(); });
await T.openEd(2); await sleep(2000);
const st = async l => log(l.padEnd(28), 'pad post', await nodeLvl('AU.tracks[2].cut'), 'lead post', await nodeLvl('AU.tracks[3].cut'), 'route', JSON.stringify((await E(() => SYNQUENZER.mkInInfo())).tracks.slice(2, 4)), 'synth[2]', await E(() => !!AU.synth[2]), '| lcd', await T.lcd2(), '| toast', await T.toast());
await st('worklet');
await E(() => SYNQUENZER.forceNative(true)); await sleep(2500);
await st('ECO 2.5 s');
await sleep(2000); await st('ECO 4.5 s');
await E(() => SYNQUENZER.forceNative(false)); await sleep(2500);
await st('back to worklet');
log('errs', errs);
await T.br.close();
