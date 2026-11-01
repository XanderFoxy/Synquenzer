// QA K1: ✕ in the Mod-Übersicht while a note holds: does the deletion step click? (raw engine output of the track,
// 5 kHz HP energy in 2 ms windows against the ±20 ms median, and the 2nd-difference spike) — VA route, VA Filter-Hüllk.,
// MS 2000 PATCH intensity, MS 2000 EG 1 int, and the same change made slowly (reference)
import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch();
await p.evaluate(async () => { mkLoad(); for (let i = 0; i < 80 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100)); });
const cap = (t, ms, act, at) => p.evaluate(([t, ms, act, at]) => new Promise(r => {
  const c = AU.ctx, n = AU.synth[t].node, sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const L = []; let tAct = null;
  sp.onaudioprocess = e => L.push(Float32Array.from(e.inputBuffer.getChannelData(0)));
  n.connect(sp); sp.connect(z); z.connect(c.destination); const t0 = c.currentTime;
  setTimeout(() => { tAct = c.currentTime - t0; (new Function('t', act))(t); }, at);
  setTimeout(() => { try { n.disconnect(sp); } catch (e) {} sp.disconnect(); const N = L.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of L) { x.set(b, o); o += b.length; }
    // analysis in the page
    const sr = c.sampleRate, hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
    const h = hp(hp(x, 5000, .5412), 5000, 1.3066), W = Math.round(sr * .005), e = []; for (let i = 0; i + W <= x.length; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(s / W + 1e-20); }
    const r2 = []; for (let i = 0; i + W <= x.length; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += x[k] * x[k]; r2.push(10 * Math.log10(s / W + 1e-20)); } const k0 = Math.round(.4 * sr / W), kA = Math.round((tAct || 0) * sr / W); let atAct = -99; let worst = {db: -99}; for (let k = Math.max(10, k0); k < e.length - 10; k++) { const nb = e.slice(k - 10, k + 11).filter((_, q) => q !== 10).sort((a, b) => a - b); let mn = 0; for (let q = k - 10; q <= k + 10; q++) mn = Math.min(mn, r2[q]); if (mn < -50) continue; const db = 10 * Math.log10(e[k] / Math.max(nb[10], 1e-14)); if (Math.abs(k - kA) <= 6 && db > atAct) atAct = +db.toFixed(1); if (db > worst.db && 10 * Math.log10(e[k]) > -90) worst = {db: +db.toFixed(1), t: +(k * W / sr).toFixed(3), lv: +(10 * Math.log10(e[k])).toFixed(1)}; }
    let rms = 0; for (const v of x) rms += v * v; rms = 10 * Math.log10(rms / x.length + 1e-20);
    r({secs: +(x.length / sr).toFixed(2), tAct: +(tAct || 0).toFixed(3), atAct, worst, rmsDb: +rms.toFixed(1)});
  }, ms);
}), [t, ms, act, at]);
const cases = [
  ['VA route LFO 1 -> Cutoff (deep) ✕', 0, `const A = SYNQUENZER; A.initSound(0); const s = A.getSound(0); s.p.cutoff = 2500; s.p.l1rate = .7; s.mods = [{src: 'lfo1', dst: 'cutoff', amt: .2}]; A.setSound(0, s);`, `SYNQUENZER.k1Del(t, 'r:lfo1:cutoff')`],
  ['VA Filter-Hüllk. (fenv .9, sustain) ✕', 0, `const A = SYNQUENZER; A.initSound(0); const s = A.getSound(0); s.p.cutoff = 600; s.p.fenv = .6; s.p.fS = .8; A.setSound(0, s);`, `SYNQUENZER.k1Del(t, 'p:fenv')`],
  ['MS 2000 PATCH LFO 1 -> Cutoff 63 ✕', 1, `const A = SYNQUENZER; A.setEngine(1, 'mk'); A.initSound(1); A.mkSet(1, 't.0.f.cut', 80); A.mkSet(1, 't.0.p.0.s', 2); A.mkSet(1, 't.0.p.0.d', 4); A.mkSet(1, 't.0.p.0.i', 63); A.mkSet(1, 't.0.l1.f', 20);`, `SYNQUENZER.k1Del(t, 't.0.p.0.i')`],
  ['MS 2000 PATCH LFO 1 -> Cutoff 63 set 0 by mkSet (reference, same jump)', 1, `const A = SYNQUENZER; A.setEngine(1, 'mk'); A.initSound(1); A.mkSet(1, 't.0.f.cut', 80); A.mkSet(1, 't.0.p.0.s', 2); A.mkSet(1, 't.0.p.0.d', 4); A.mkSet(1, 't.0.p.0.i', 63); A.mkSet(1, 't.0.l1.f', 20);`, `SYNQUENZER.mkSet(t, 't.0.p.0.i', 0)`],
  ['MS 2000 EG 1 int 63 (sustain) ✕', 1, `const A = SYNQUENZER; A.setEngine(1, 'mk'); A.initSound(1); A.mkSet(1, 't.0.f.cut', 30); A.mkSet(1, 't.0.f.eg', 63); A.mkSet(1, 't.0.e1.s', 110);`, `SYNQUENZER.k1Del(t, 't.0.f.eg')`],
  ['no change (noise floor of the meter)', 0, `const A = SYNQUENZER; A.initSound(0); const s = A.getSound(0); s.p.cutoff = 2500; s.p.l1rate = .7; s.mods = [{src: 'lfo1', dst: 'cutoff', amt: .2}]; A.setSound(0, s);`, ``],
];
for (const [name, t, setup, act] of cases) {
  for (let rep = 0; rep < 2; rep++) {
    await p.evaluate(([t, setup]) => { (new Function(setup))(); SYNQUENZER.selectSlot && 0; }, [t, setup]); await p.waitForTimeout(300);
    await p.evaluate(t => { const k = SYNQUENZER; k.selectTrack(t); k.keyOn(69, .9); }, t);
    const r = await cap(t, 2600, act, 1500 + rep * 333);
    await p.evaluate(t => SYNQUENZER.keyOff(69), t); await p.waitForTimeout(600);
    console.log(name.padEnd(70), 'rep', rep, JSON.stringify(r));
  }
}
console.log('errors', JSON.stringify(errs.slice(0, 4)));
await b.close();
