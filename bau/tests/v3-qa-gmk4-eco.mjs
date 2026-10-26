// echo after ECO on/off, engine switch MK → VA → MK, scene/track reload: the program delay is back and audible
import {open, sleep, check, done} from './v3-qa-gmk4-tl.mjs';
const T = await open({viewport: {width: 428, height: 926}}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); ensureAudio(); SYNQUENZER.setEngine(0, "mk"); SYNQUENZER.selectTrack(0); });
await sleep(1000);
await E(() => { const Q = SYNQUENZER; for (const [k, v] of Object.entries({'t.0.e2.a': 0, 't.0.e2.d': 30, 't.0.e2.s': 0, 't.0.e2.r': 10, 'dly.dep': 64, 'dly.sync': 1, 'dly.note': 5, 'mfx.type': 1, 'mfx.dep': 127})) Q.mkSet(0, k, v); });
await sleep(300);
const meas = () => E(async () => { const c = AU.ctx, node = AU.tracks[0].trackIn, sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const L = [], R = []; sp.onaudioprocess = e => { L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); R.push(Float32Array.from(e.inputBuffer.getChannelData(1))); }; node.connect(sp); sp.connect(z); z.connect(c.destination);
  await new Promise(r => setTimeout(r, 100)); SYNQUENZER.keyOn(60, .8); await new Promise(r => setTimeout(r, 40)); SYNQUENZER.keyOff(60); await new Promise(r => setTimeout(r, 900)); try { node.disconnect(sp); } catch (e) {} sp.disconnect();
  const cat = A => { const N = A.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of A) { x.set(b, o); o += b.length; } return x; }; const l = cat(L), r = cat(R);
  let mx = 0; for (const v of l) mx = Math.max(mx, Math.abs(v)); let i0 = 0; while (i0 < l.length && Math.abs(l[i0]) < .1 * mx) i0++; i0 = Math.max(0, i0 - 64); const sr = c.sampleRate, D = Math.round(.5 * 60 / SYNQUENZER.runtime().bpm * sr), W = Math.round(.02 * sr);
  let a = 0, e = 0, sl = 0, sr2 = 0, slr = 0; for (let i = 0; i < W; i++) { a += l[i0 + i] ** 2; e += l[i0 + D + i] ** 2; } for (let i = i0; i < i0 + Math.round(.2 * sr); i++) { sl += l[i] * l[i]; sr2 += r[i] * r[i]; slr += l[i] * r[i]; }
  return {mx: +mx.toFixed(4), echo: +(10 * Math.log10(e / a + 1e-30)).toFixed(1), corr: +(slr / Math.sqrt(sl * sr2 + 1e-30)).toFixed(3)}; });
const r0 = await meas(); console.log('start', JSON.stringify(r0));
await E(() => SYNQUENZER.forceNative(true)); await sleep(800);
const rE = await meas(); console.log('ECO on', JSON.stringify(rE));
await E(() => SYNQUENZER.forceNative(false)); await sleep(800);
const r1 = await meas(); console.log('ECO off', JSON.stringify(r1));
check('E1 after ECO off: delay echo and Ensemble stereo are back', Math.abs(r1.echo - r0.echo) < 2 && r1.corr < .95, {r0, rE, r1});
await E(() => SYNQUENZER.setEngine(0, 'va')); await sleep(600); await E(() => SYNQUENZER.setEngine(0, 'mk')); await sleep(800);
const r2 = await meas(); console.log('VA → MK', JSON.stringify(r2), JSON.stringify(await E(() => SYNQUENZER.mkGet(0).dly)));
check('E2 engine MS 2000 → VA → MS 2000: the program delay comes back audible', Math.abs(r2.echo - r0.echo) < 2, {r0, r2});
console.log('errs', JSON.stringify(errs));
await T.br.close(); done();
