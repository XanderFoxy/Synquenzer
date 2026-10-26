// Independent check of the commit side effects after a staccato AUFN. take (touch flow, KEY SYNC Timbre default)
import {open, sleep} from './v3-qa-gmk6-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {E, errs} = T;
const TR = 2;
await T.openEd(TR); await T.toMk();
await E(t => { const Q = SYNQUENZER; Q.setBpm(120); Q.mkSet(t, 't.0.f.cut', 40); Q.mkSet(t, 't.0.e2.a', 0); Q.mkSet(t, 't.0.e2.s', 127); Q.mkSet(t, 't.0.seq.last', 16); MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); }, TR);
await sleep(400);
const before = await E(t => { const m = SYNQUENZER.mkGet(t).t[0]; return {ks: m.seq.ks, on: m.seq.on, k: m.seq.q[0].k, cut: m.f.cut}; }, TR);
const n0 = await E(t => AU.synth[t].mkRecN || 0, TR);
await T.tapMk('rec', 400);
await E(() => { let k = 0; const go = () => { const id = 'n' + k++; SYNQUENZER.keyOn(45, .8, id); setTimeout(() => SYNQUENZER.keyOff(0, id), 150); }; go(); window.__iv = setInterval(go, 250); });
await sleep(300);
const sw = T.sweep('k0', -100, 90, 40);   // ~3.6 s
await sleep(1000);
const mid = await E(t => ({recN: AU.synth[t].mkRecN || 0, info: AU.synth[t].mkRecLast}), TR);
await sw; await sleep(500);
await E(() => clearInterval(window.__iv)); await sleep(300);
const after = await E(t => { const m = SYNQUENZER.mkGet(t).t[0]; return {on: m.seq.on, k: m.seq.q[0].k, cut: m.f.cut, v: m.seq.q[0].v.join(',')}; }, TR);
console.log('before', JSON.stringify(before));
console.log('1 s into the 3.6 s knob turn: take already ended =', mid.recN > n0, JSON.stringify(mid.info && {from: mid.info.from, to: mid.info.to}));
console.log('after', JSON.stringify(after), 'lcd', await T.lcd2());
console.log('errs', JSON.stringify(errs));
await T.br.close();
