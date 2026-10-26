import {open, sleep, OUT, check, done} from './v3-qa-gmk7-tl.mjs';
import {setupProject} from './v3-qa-gmk7-setup.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
await setupProject(E);
const nodeLvl = (expr, ms = 1500) => E(([expr, ms]) => new Promise(r => { const n = eval(expr); if (!n) return r(null); const c = AU.ctx, a = c.createAnalyser(); a.fftSize = 2048; n.connect(a); const b = new Float32Array(2048); let pk = 0, ss = 0, N = 0, over = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(b); for (const v of b) { pk = Math.max(pk, Math.abs(v)); ss += v * v; N++; if (Math.abs(v) > .891) over++; } }, 40); setTimeout(() => { clearInterval(iv); try { n.disconnect(a); } catch (e) {} r([+(20 * Math.log10(pk + 1e-15)).toFixed(1), +(10 * Math.log10(ss / Math.max(1, N) + 1e-30)).toFixed(1), +(over / Math.max(1, N) * 100).toFixed(2)]); }, ms); }), [expr, ms]);
await E(() => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); }); await sleep(1000);
await E(() => { SYNQUENZER.setEngine(2, 'mk'); SYNQUENZER.mkSet(2, 'mode', 3); SYNQUENZER.mkIn(2, 'e2', 3); }); await sleep(1500);
log('voc defaults', JSON.stringify(await E(() => { const v = SYNQUENZER.mkGet(2).voc; const o = {}; for (const k in v) if (!Array.isArray(v[k])) o[k] = v[k]; return o; })));
log('pad raw [pk, rms, %>-1dB]', await nodeLvl('AU.synth[2].node', 4000), 'master red', await E(() => AU.M.reductionDb));
const reds = []; for (let k = 0; k < 10; k++) { reds.push(await E(() => typeof AU.M.reductionDb === 'function' ? AU.M.reductionDb() : AU.M.reductionDb)); await sleep(200); }
log('master reduction samples', JSON.stringify(reds));
// with other tracks muted: only the vocoder → master
// Q7 repro: add t7, route, remove, undo – is t7 playing after undo?
const t7 = await E(() => SYNQUENZER.addTrack());
await E(([t7]) => { const Q = SYNQUENZER; Q.setClip(t7, 0, Q.getClip(3, 0)); Q.mkIn(2, 'e2', t7); Q.launchScene(0); }, [t7]); await sleep(2500);
log('t7 raw', await nodeLvl('AU.synth[' + t7 + '].node', 1000), 'pad', await nodeLvl('AU.synth[2].node', 1000), 'slots', JSON.stringify(await E(() => SYNQUENZER.runtime().slots)));
await E(t => SYNQUENZER.removeTrack(t), t7); await sleep(1200);
await E(() => SYNQUENZER.undo()); await sleep(2000);
log('after undo: t7 raw', await nodeLvl('AU.synth[' + t7 + '].node', 1000), 'pad', await nodeLvl('AU.synth[2].node', 1000), 'slots', JSON.stringify(await E(() => SYNQUENZER.runtime().slots)), JSON.stringify(await E(() => SYNQUENZER.mkInInfo().tracks)));
await E(() => SYNQUENZER.launchScene(0)); await sleep(4500);
log('after relaunch: t7 raw', await nodeLvl('AU.synth[' + t7 + '].node', 1000), 'pad', await nodeLvl('AU.synth[2].node', 1000), 'slots', JSON.stringify(await E(() => SYNQUENZER.runtime().slots)));
log('errs', errs);
await T.br.close();
