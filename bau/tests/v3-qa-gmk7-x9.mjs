// repeat: engine switch MS 2000 → VA on a sounding chord, vocoder (held) vs synth; largest single-sample step where the old engine stops
import {open, sleep} from './v3-qa-gmk7-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
await E(async () => { await SYNQUENZER.loadDemo(); ensureAudio(); }); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000}); await sleep(500);
const HOLD = [0, 0, 20, 40, 60, 70, 80, 70, 60, 60, 50, 40, 30, 20, 10, 5];
const run = async (voc, delay) => {
  await E(() => { SYNQUENZER.selectTrack(2); SYNQUENZER.setEngine(2, 'mk'); }); await sleep(300);
  await E(([v, H]) => { SYNQUENZER.mkSet(2, 'mode', v ? 3 : 0); if (v) SYNQUENZER.mkSet(2, 'voc.hold', H); SYNQUENZER.mkSet(2, 't.0.f.cut', 60); }, [voc, HOLD]); await sleep(500);
  const r = await E(delay => new Promise(res => { const c = AU.ctx, n = AU.synth[2].node; const sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const L = []; let n0 = null; sp.onaudioprocess = e => { if (n0 == null) n0 = e.playbackTime; const a = e.inputBuffer.getChannelData(0), b = e.inputBuffer.getChannelData(1); const x = new Float32Array(a.length); for (let i = 0; i < a.length; i++) x[i] = (a[i] + b[i]) / 2; L.push(x); }; n.connect(sp); sp.connect(z); z.connect(c.destination);
    SYNQUENZER.keyOn(60); SYNQUENZER.keyOn(64); SYNQUENZER.keyOn(67);
    let tsw = null; setTimeout(() => { tsw = c.currentTime; SYNQUENZER.setEngine(2, 'analog'); }, delay);
    setTimeout(() => { SYNQUENZER.keyOff(60); SYNQUENZER.keyOff(64); SYNQUENZER.keyOff(67); try { n.disconnect(sp); } catch (e) {} sp.disconnect(); const N = L.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of L) { x.set(b, o); o += b.length; } res({sr: c.sampleRate, n0, tsw, x: Array.from(x)}); }, delay + 700); }), delay);
  const x = r.x, sr = r.sr; const i0 = Math.round((r.tsw - r.n0 - 0.02) * sr), i1 = Math.round((r.tsw - r.n0 + 0.3) * sr);
  // the end of the old engine: first 5-ms window after the switch whose peak is 25 dB below the window before
  let cut = null; const W = Math.round(sr * .0025);
  for (let i = i0 + W; i < i1; i += W) { let a = 0, b = 0; for (let k = i - W; k < i; k++) a = Math.max(a, Math.abs(x[k])); for (let k = i; k < i + W; k++) b = Math.max(b, Math.abs(x[k])); if (a > 1e-3 && 20 * Math.log10(b / a) < -20) { let mx = 0, at = 0; for (let k = i - W; k < i + W; k++) { const d = Math.abs(x[k] - x[k - 1]); if (d > mx) { mx = d; at = k; } } cut = {t: +((at / sr) + r.n0 - r.tsw).toFixed(4), before: +(20 * Math.log10(a)).toFixed(1), after: +(20 * Math.log10(b + 1e-12)).toFixed(1), step: +(20 * Math.log10(mx)).toFixed(1), x: Array.from(x.slice(at - 3, at + 3)).map(v => +v.toFixed(4))}; break; } }
  return cut;
};
for (let k = 0; k < 4; k++) { log('vocoder', JSON.stringify(await run(true, 600 + k * 37))); log('synth  ', JSON.stringify(await run(false, 600 + k * 37))); }
log('errs', errs);
await T.br.close();
