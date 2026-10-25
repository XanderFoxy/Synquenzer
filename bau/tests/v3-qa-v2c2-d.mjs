// QA V2c′ – part D: audible check via master AnalyserNode: e-minor A4 under C → off F#4 (370 Hz), on F4 (349 Hz); Stärke 50 % short note
import { open } from './v3-v2d-pw.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(async () => {
  const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  const meas = async () => { const an = AU.ctx.createAnalyser(); an.fftSize = 32768; an.smoothingTimeConstant = 0; AU.M.ceil.connect(an);
    await sl(900); const f = new Float32Array(an.frequencyBinCount); an.getFloatFrequencyData(f); AU.M.ceil.disconnect(an);
    const bin = hz => Math.round(hz / (AU.ctx.sampleRate / an.fftSize)); const pk = hz => { let m = -999; for (let k = bin(hz) - 2; k <= bin(hz) + 2; k++) m = Math.max(m, f[k]); return m; };
    return {F4: +pk(349.23).toFixed(1), Fs4: +pk(369.99).toFixed(1), G4: +pk(392).toFixed(1)}; };
  const out = {};
  for (const [lbl, os, amt, d] of [['on', true, 1, 3.9], ['off', false, 1, 3.9], ['on-50%-long', true, .5, 3.9], ['on-50%-short', true, .5, .45]]) {
    Q.stop(); Q.newProject({init: true}); ensureAudio(); Q.oneScale(os); Q.setHarmony({osAmt: amt});
    const notes = d > 1 ? [{t: 0, d, n: 69, v: .8}] : [0, .5, 1, 1.5, 2, 2.5, 3, 3.5].map(t => ({t, d, n: 69, v: .8}));
    Q.setClip(0, 0, {len: 1, key: {root: 4, scale: 'aeolian', src: 'user'}, notes});
    Q.setChordRow('S1', {len: 1, ch: [{b: 0, tg: Q.parseChord('C')}]}); Q.setBpm(60);
    Q.play(); Q.launchScene(0); await sl(1300);
    out[lbl] = await meas(); Q.stop(); await sl(300);
  }
  return out;
});
console.log(JSON.stringify(r, null, 1)); console.log('errs', errs);
await b.close();
