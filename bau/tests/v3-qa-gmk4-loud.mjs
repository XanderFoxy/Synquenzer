// a sustained 4-note pad chord with DELAY TIEFE 127 (feedback 0.8): engine output, track and master peaks vs. without delay
import {open, sleep, check, done} from './v3-qa-gmk4-tl.mjs';
const T = await open({viewport: {width: 428, height: 926}}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); ensureAudio(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); });
await sleep(1000);
const run = dep => E(async dep => { const Q = SYNQUENZER; Q.mkSet(0, 'dly.dep', dep); Q.mkSet(0, 'dly.sync', 1); Q.mkSet(0, 'dly.note', 5); Q.mkSet(0, 'dly.type', 1); await new Promise(r => setTimeout(r, 300));
  const c = AU.ctx, taps = {eng: AU.synth[0].node, master: AU.M.ceil}; const R = {};
  const sps = Object.entries(taps).map(([k, n]) => { const sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; R[k] = {pk: 0, s: 0, n: 0}; sp.onaudioprocess = e => { for (let ch = 0; ch < 2; ch++) { const x = e.inputBuffer.getChannelData(ch); for (const v of x) { R[k].pk = Math.max(R[k].pk, Math.abs(v)); R[k].s += v * v; R[k].n++; } } }; n.connect(sp); sp.connect(z); z.connect(c.destination); return [n, sp]; });
  for (const n of [48, 55, 60, 64]) Q.keyOn(n, 1); await new Promise(r => setTimeout(r, 4000)); for (const n of [48, 55, 60, 64]) Q.keyOff(n); await new Promise(r => setTimeout(r, 300));
  for (const [n, sp] of sps) { try { n.disconnect(sp); } catch (e) {} sp.disconnect(); }
  const db = v => +(20 * Math.log10(v + 1e-12)).toFixed(1); const out = {}; for (const k in R) out[k] = {peak: db(R[k].pk), rms: +(10 * Math.log10(R[k].s / R[k].n + 1e-20)).toFixed(1)}; Q.panic && Q.panic(); return out; }, dep);
const a = await run(0); await sleep(1500); const b = await run(127); await sleep(1500); const c = await run(64);
console.log('dep 0', JSON.stringify(a)); console.log('dep 127', JSON.stringify(b)); console.log('dep 64', JSON.stringify(c));
console.log('errs', JSON.stringify(errs));
await T.br.close();
