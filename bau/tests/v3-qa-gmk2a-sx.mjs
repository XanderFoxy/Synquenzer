import {open, sleep, OUT} from './v3-qa-gmk2a-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setMetronome(false); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.mkSet(0, 't.0.o1.w', 3); });
for (const c1 of [0, 32, 74, 127]) {
  await E(c1 => SYNQUENZER.mkSet(0, 't.0.o1.c1', c1), c1);
  await E(() => SYNQUENZER.audition(0, 41, 1200)); 
  const s = await T.spec(500); await sleep(900);
  console.log('live X-MOD', c1, JSON.stringify(s));
}
const r = await E(async () => { const out = {}; for (const c1 of [0, 32, 74, 127]) { const snd = SYNQUENZER.getSound(0); snd.p.mk.t[0].o1.c1 = c1; const {l} = await SYNQUENZER.mkRender(snd, [[0, 'on', 41, .8], [1, 'off', 41, 0]], {sec: 1.2, sr: 48000});
  // DFT at harmonics of 87.307
  const f0 = 87.307, sr = 48000, a = l.subarray(12000, 12000 + 48000 * .5); const hs = []; for (let k = 1; k <= 12; k++) { let re = 0, im = 0; for (let i = 0; i < a.length; i++) { const ph = 2 * Math.PI * f0 * k * i / sr; re += a[i] * Math.cos(ph); im += a[i] * Math.sin(ph); } hs.push(+(20 * Math.log10(2 * Math.hypot(re, im) / a.length + 1e-9)).toFixed(1)); } out[c1] = hs; } return out; });
console.log(JSON.stringify(r));
await T.br.close();
