import {launch, openG, sleep, toI16, hz, setKey} from './h.mjs';
import {singer} from './sig.mjs';
const SR = 44100, N = (m, off, d, vowel) => ({m, off, d, vowel, f0: hz(m + off / 100)});
const phrases = [{t0: 0.5, cons: 's', vib: 15, segs: [N(62, 31, .45, 'i')]}, {t0: 1.5, cons: 's', vib: 15, segs: [N(48, 31, .45, 'a')]}];
const {x, cons} = singer(SR, 2.5, phrases, {seed: 21});
console.log(cons);
const br = await launch(null), H = await openG(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setMetronome(false); }); await setKey(p, 3, 'ionian');
await p.evaluate(() => SYNQUENZER.play()); await sleep(200); await p.evaluate(() => SYNQUENZER.stop());
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 44100, scene: 0, len: 2}), toI16(x)); const R = {t: r1.track, s: 0};
const xr = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), r1.id));
const an = await p.evaluate(R => SYNQUENZER.g2Analyse(R), R);
console.log(JSON.stringify(an.notes), an.hop);
for (const [a, b] of cons) { const i0 = Math.floor((a - 0.03) / an.hop), i1 = Math.ceil((b + 0.03) / an.hop); console.log('f0 frames', (i0 * an.hop).toFixed(3), an.f0.slice(i0, i1).map(v => v.toFixed(0)).join(' ')); }
await p.evaluate(R => SYNQUENZER.g2Quantize(R, {q: true, mode: 'hard', str: 1}), R);
const y = Float32Array.from((await p.evaluate(R => SYNQUENZER.g2Played(R), R)).data);
for (const [a, b] of cons) { let first = -1, last = -1, mx = 0; for (let i = Math.floor(a * SR); i < Math.ceil(b * SR); i++) if (y[i] !== xr[i]) { if (first < 0) first = i; last = i; mx = Math.max(mx, Math.abs(y[i] - xr[i])); } let pk = 0; for (let i = Math.floor(a * SR); i < Math.ceil(b * SR); i++) pk = Math.max(pk, Math.abs(xr[i])); console.log('cons', a.toFixed(3), b.toFixed(3), 'diff', first / SR, last / SR, 'max', (20 * Math.log10(mx + 1e-12)).toFixed(1), 'dB re s-peak', (20 * Math.log10(mx / pk + 1e-12)).toFixed(1)); }
await br.close();
