// vocoder with drums as modulator vs lead as modulator: levels of the tap (duck) and of the vocoder output
import {open, sleep} from './v3-qa-gmk7-tl.mjs';
import {setupProject} from './v3-qa-gmk7-setup.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
await setupProject(E);
const nodeLvl = (expr, ms = 1500) => E(([expr, ms]) => new Promise(r => { const n = eval(expr); if (!n) return r(null); const c = AU.ctx, a = c.createAnalyser(); a.fftSize = 2048; n.connect(a); const b = new Float32Array(2048); let pk = 0, ss = 0, N = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(b); for (const v of b) { pk = Math.max(pk, Math.abs(v)); ss += v * v; N++; } }, 40); setTimeout(() => { clearInterval(iv); try { n.disconnect(a); } catch (e) {} r({pk: +(20 * Math.log10(pk + 1e-15)).toFixed(1), rms: +(10 * Math.log10(ss / Math.max(1, N) + 1e-30)).toFixed(1)}); }, ms); }), [expr, ms]);
await E(() => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); SYNQUENZER.setEngine(2, 'mk'); SYNQUENZER.mkSet(2, 'mode', 3); }); await sleep(1000);
for (const [name, src] of [['lead t3', 3], ['drums t4', 4], ['FM pluck t1', 1], ['bass t0', 0]]) {
  await E(s => SYNQUENZER.mkIn(2, 'e2', s), src); await sleep(1500);
  log(name.padEnd(12), 'tap', JSON.stringify(await nodeLvl('AU.tracks[' + src + '].duck', 3000)), 'vocoder', JSON.stringify(await nodeLvl('AU.synth[2].node', 3000)), 'LED E2 lv', await E(() => { const E_ = AU.synth[2]; return E_ && E_.mkLv ? JSON.stringify(E_.mkLv) : null; }));
}
log('drum chain', await E(() => { const A = AU.tracks[4]; return Object.keys(A).filter(k => A[k] && A[k].connect).join(','); }));
log('errs', errs);
await T.br.close();
