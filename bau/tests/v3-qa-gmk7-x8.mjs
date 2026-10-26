// structural switches on a sounding chord: Synth ↔ Vocoder (mode), Vocoder → VA, VA → Vocoder sound, ECO on/off, QUELLE switch
import {open, sleep} from './v3-qa-gmk7-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
await E(async () => { await SYNQUENZER.loadDemo(); ensureAudio(); }); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000}); await sleep(500);
const HOLD = [0, 0, 20, 40, 60, 70, 80, 70, 60, 60, 50, 40, 30, 20, 10, 5];
const run = async (label, prep, sw) => {
  await E(() => { SYNQUENZER.selectTrack(2); SYNQUENZER.setEngine(2, 'mk'); }); await sleep(300); await E(prep, HOLD); await sleep(500);
  const r = await E(sw => new Promise(res => { const c = AU.ctx, n = AU.synth[2].node; const sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const L = []; let n0 = null; sp.onaudioprocess = e => { if (n0 == null) n0 = e.playbackTime; const a = e.inputBuffer.getChannelData(0), b = e.inputBuffer.getChannelData(1); const x = new Float32Array(a.length); for (let i = 0; i < a.length; i++) x[i] = (a[i] + b[i]) / 2; L.push(x); }; n.connect(sp); sp.connect(z); z.connect(c.destination);
    SYNQUENZER.keyOn(60); SYNQUENZER.keyOn(64); SYNQUENZER.keyOn(67);
    let tsw = null; setTimeout(() => { tsw = c.currentTime; (0, eval)('(' + sw + ')')(); }, 700);
    setTimeout(() => { SYNQUENZER.keyOff(60); SYNQUENZER.keyOff(64); SYNQUENZER.keyOff(67); try { n.disconnect(sp); } catch (e) {} sp.disconnect(); const N = L.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of L) { x.set(b, o); o += b.length; } res({sr: c.sampleRate, n0, tsw, x: Array.from(x)}); }, 1700); }), sw.toString());
  const x = r.x, sr = r.sr; const d2 = i => Math.abs(x[i] - 2 * x[i - 1] + x[i - 2]);
  let worst = null; const is = Math.max(70, Math.round((r.tsw - r.n0 - 0.05) * sr)), ie = Math.min(x.length - 70, Math.round((r.tsw - r.n0 + 0.5) * sr));
  for (let i = is; i < ie; i++) { let s = 0; for (let k = i - 64; k < i + 64; k++) if (k < i - 1 || k > i + 1) s += d2(k) * d2(k); const rm = Math.sqrt(s / 125) + 1e-9; const ratio = 20 * Math.log10(d2(i) / rm); if (d2(i) > 1e-3 && (!worst || ratio > worst.ratio)) worst = {t: +((i / sr) + r.n0 - r.tsw).toFixed(4), ratio: +ratio.toFixed(1), d2: +d2(i).toFixed(4), x: Array.from(x.slice(i - 3, i + 3)).map(v => +v.toFixed(4))}; }
  const env = []; for (let i = is; i < Math.min(ie, is + Math.round(sr * .25)); i += Math.round(sr * .005)) { let pk = 0; for (let k = i; k < i + Math.round(sr * .005); k++) pk = Math.max(pk, Math.abs(x[k])); env.push(+(20 * Math.log10(pk + 1e-12)).toFixed(0)); }
  log(label.padEnd(34), 'worst', JSON.stringify(worst), '\n   env 5ms from −50 ms', env.join(' '));
};
await run('synth → vocoder(held) mode', H => { SYNQUENZER.mkSet(2, 'mode', 0); SYNQUENZER.mkSet(2, 'voc.hold', H); }, () => SYNQUENZER.mkSet(2, 'mode', 3));
await run('vocoder(held) → synth mode', H => { SYNQUENZER.mkSet(2, 'mode', 3); SYNQUENZER.mkSet(2, 'voc.hold', H); }, () => SYNQUENZER.mkSet(2, 'mode', 0));
await run('vocoder(held) → VA', H => { SYNQUENZER.mkSet(2, 'mode', 3); SYNQUENZER.mkSet(2, 'voc.hold', H); }, () => SYNQUENZER.setEngine(2, 'analog'));
await run('synth MK → VA (reference)', H => { SYNQUENZER.mkSet(2, 'mode', 0); }, () => SYNQUENZER.setEngine(2, 'analog'));
await run('vocoder(held) → ECO (forceNative)', H => { SYNQUENZER.mkSet(2, 'mode', 3); SYNQUENZER.mkSet(2, 'voc.hold', H); }, () => SYNQUENZER.forceNative(true));
await E(() => SYNQUENZER.forceNative(false)); await sleep(800);
await run('synth MK → ECO (reference)', H => { SYNQUENZER.mkSet(2, 'mode', 0); }, () => SYNQUENZER.forceNative(true));
await E(() => SYNQUENZER.forceNative(false)); await sleep(800);
await run('vocoder(held) HALTEN off (hold null)', H => { SYNQUENZER.mkSet(2, 'mode', 3); SYNQUENZER.mkSet(2, 'voc.hold', H); }, () => SYNQUENZER.mkSet(2, 'voc.hold', null));
log('errs', errs);
await T.br.close();
