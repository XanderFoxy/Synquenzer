import {launch, openG, sleep, toI16, hz, ct, median, yinTrack, notePitch} from './h.mjs';
import {singer} from './sig.mjs';
import {rec2Start, rec2Stop} from '../rec2.mjs';
const SR = 48000, MEL = [67, 71, 74, 71, 69, 66, 62, 66];
const ph = MEL.map((m, k) => ({t0: 0.04 + k * 0.5, cons: k % 3 === 1 ? 's' : null, vib: 12, segs: [{m, off: 0, d: k % 3 === 1 ? 0.36 : 0.43, vowel: 'aeoua'[k % 5], f0: hz(m)}]}));
const {x} = singer(SR, 4.3, ph, {seed: 33, amp: 1.3});
const br = await launch(null), H = await openG(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
await p.evaluate(() => { SYNQUENZER.setClip(0, 0, {len: 2, notes: [55, 59, 62].map(n => ({t: 0, d: 4, n, v: .5})).concat([62, 66, 69].map(n => ({t: 4, d: 4, n, v: .5})))}); SYNQUENZER.setClip(1, 0, {len: 2, notes: [{t: 0, d: 4, n: 43, v: .6}, {t: 4, d: 4, n: 38, v: .6}]}); });
await p.evaluate(() => SYNQUENZER.play()); await sleep(200); await p.evaluate(() => SYNQUENZER.stop());
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(x)); const R = {t: r1.track, s: 0};
await p.evaluate(R => SYNQUENZER.tkSheet(R), R); await sleep(800); 
await p.evaluate(R => SYNQUENZER.g6Make(R, 'drei', 'up', '80'), R); await p.evaluate(R => SYNQUENZER.g6Wait(R), R);
const b = Float32Array.from((await p.evaluate(R => SYNQUENZER.g6Buf(R, 1, 0), R)).data);
console.log('buf voice2 copy0 note pitches', MEL.map((m, k) => notePitch(b, SR, 0.04 + k * .5 + .08, 0.04 + k * .5 + .38).toFixed(1)).join(' '));
for (const solo of [1, 0]) {
  await p.evaluate(k => { while (SYNQUENZER.g6Info().solo != null) SYNQUENZER.g6Solo(SYNQUENZER.g6Info().solo); SYNQUENZER.g6Solo(k); }, solo);
  await p.evaluate(() => { SYNQUENZER.setMute(0, true); SYNQUENZER.setMute(1, true); SYNQUENZER.launchScene(0); });
  await rec2Start(p); await p.evaluate(() => SYNQUENZER.play()); await sleep(4300); await p.evaluate(() => SYNQUENZER.stop()); await sleep(300); const G = await rec2Stop(p);
  const L = Float32Array.from(G.l), Rr = Float32Array.from(G.r); let on = 0; for (let i = 0; i < L.length; i++) if (Math.abs(L[i]) + Math.abs(Rr[i]) > 0.003) { on = i; break; }
  const t0 = on / G.sr; console.log('solo', solo, 'onset', t0.toFixed(3), 'L pitch per note', MEL.map((m, k) => notePitch(L, G.sr, t0 + k * .5 + .08, t0 + k * .5 + .36).toFixed(1)).join(' '), ' R', MEL.map((m, k) => notePitch(Rr, G.sr, t0 + k * .5 + .08, t0 + k * .5 + .36).toFixed(1)).join(' '));
  console.log('nodes', JSON.stringify(await p.evaluate(() => SYNQUENZER.g6Nodes())));
}
await br.close();
