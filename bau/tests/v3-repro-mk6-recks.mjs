// Independent repro: MK6 AUFN. take vs. KEY SYNC restarts (no touch helpers; worklet message + test API only)
import {open, sleep} from './v3-qa-gmk6-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {E, errs} = T;
const TR = 2;
await T.openEd(TR); await T.toMk(); await sleep(800);
for (let i = 0; i < 40 && !(await E(t => !!(AU.synth[t] && AU.synth[t].node), TR)); i++) await sleep(250);
console.log('engine', await E(t => SYNQUENZER.getSound(t).engine + ' synth=' + !!AU.synth[t], TR));
const run = async (pattern, ks) => {
  return E(async ([t, pattern, ks]) => {
    const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    Q.setBpm(120); Q.mkSet(t, 't.0.f.cut', 40); Q.mkSet(t, 't.0.e2.a', 0); Q.mkSet(t, 't.0.e2.s', 127); Q.mkSet(t, 't.0.seq.ks', ks); Q.mkSet(t, 't.0.seq.last', 16); Q.mkSet(t, 't.0.seq.res', 3);
    await sl(300);
    const E_ = AU.synth[t], n0 = E_.mkRecN || 0; let k = 0, iv = null;
    const go = () => { if (pattern === 'held') Q.keyOn(57, .8, 'h');
      else if (pattern === 'staccato') { const id = 'n' + k++; Q.keyOn(45, .8, id); setTimeout(() => Q.keyOff(0, id), 150); }
      else if (pattern === 'legato') { const id = 'n' + k++; Q.keyOn(45 + (k % 2) * 7, .8, id); setTimeout(() => Q.keyOff(0, id), 300); } };   // legato: overlapping
    go(); if (pattern !== 'held') iv = setInterval(go, 250);
    await sl(600);   // already playing when the knob first moves
    E_.node.port.postMessage({mkRec: {ti: 0, k: 0, tg: 11, base: 40}});
    const t0 = performance.now(), k0 = k;
    // turn CUTOFF 40 -> 100 over 3 s (the "knob" in the worklet's T)
    let c = 40; const cv = setInterval(() => { c = Math.min(100, c + 1); Q.mkSet(t, 't.0.f.cut', c); }, 50);
    while ((E_.mkRecN || 0) === n0 && performance.now() - t0 < 5000) await sl(20);
    const ms = Math.round(performance.now() - t0);
    clearInterval(iv); clearInterval(cv); Q.keyOff(0, 'h'); for (let i = 0; i < k + 1; i++) Q.keyOff(0, 'n' + i);
    if ((E_.mkRecN || 0) === n0) { E_.node.port.postMessage({mkRec: {ti: 0, cancel: 1}}); return {ended: false, ms}; }
    const L = E_.mkRecLast; await sl(400);
    return {ended: true, ms, notesDuringTake: k - k0, from: L.from, to: L.to, written: L.v.filter((x, i) => i + 1 >= L.from && i + 1 <= L.to).length, v: L.v.join(',')};
  }, [TR, pattern, ks]);
};
for (const [p, ks, name] of [['held', 1, 'Timbre held'], ['staccato', 1, 'Timbre staccato'], ['staccato', 2, 'Stimme staccato'], ['staccato', 0, 'aus staccato'], ['legato', 1, 'Timbre legato']]) {
  const r = await run(p, ks); console.log(name.padEnd(18), JSON.stringify(r)); await sleep(500);
}
console.log('errs', JSON.stringify(errs));
await T.br.close();
