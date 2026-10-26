import {open, sleep} from './v3-qa-gmk3-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await E(() => { const Q = SYNQUENZER; Q.setMetronome(false); Q.setEngine(0, 'mk'); Q.mkSet(0, 'mode', 1); });
await T.openEd(0);
console.log('ctx before', await E(() => !!AU.ctx), 'synthHost', await E(() => SynthHost.state));
await E(() => [55, 60, 64, 67].forEach((x, k) => SYNQUENZER.keyOn(x, .8, 'c' + k)));
for (const ms of [50, 300, 800, 1500]) { await sleep(ms); console.log(ms, JSON.stringify(await E(() => ({ctx: AU.ctx && AU.ctx.state, host: SynthHost.state, eng: AU.synth[0] ? (AU.synth[0].node ? 'node' : 'native?') : null, voices: SYNQUENZER.voices().length, ei: SYNQUENZER.engineInfo().mode || SYNQUENZER.engineInfo().engine})))); }
const lv = await E(() => new Promise(r => { const a = AU.ctx.createAnalyser(); AU.M.ceil.connect(a); const b = new Float32Array(2048); setTimeout(() => { a.getFloatTimeDomainData(b); let m = 0; for (const v of b) m = Math.max(m, Math.abs(v)); r(20 * Math.log10(m + 1e-12)); }, 300); }));
console.log('master lvl', lv);
await E(() => SYNQUENZER.mkScope(0)); await sleep(200); console.log('scope', JSON.stringify(await E(() => SYNQUENZER.mkScope(0))));
await T.br.close();
