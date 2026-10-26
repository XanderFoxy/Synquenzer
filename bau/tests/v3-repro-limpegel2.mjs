// Decomposition: synthesis bank only (hold), analysis only (noise modulator), realistic voice-like modulator.
import * as Q from './v3-qa7-lib.mjs';
const {SR, render, rms, db, noise} = Q;
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
const base = await Q.baseMk(page);
const sec = 3;
const both = r => { const L = rms(r.l, 1.5 * SR, 3 * SR), R = rms(r.r, 1.5 * SR, 3 * SR); return db(Math.sqrt((L * L + R * R) / 2)); };
const d = async (s, ev, inputs) => { const a = await render(page, s, ev, {sec, inputs, at: [[1.0, {set: {mkLim: 1}}]]}), b = await render(page, s, ev, {sec, inputs}); return (both(a) - both(b)).toFixed(2) + ' dB (ref ' + both(b).toFixed(1) + ' dBFS)'; };
const chord3 = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8]];
const out = [];
// 1) synthesis bank only: frozen hold spectrum (no analysis)
for (const [nm, t0] of [['saw', {}], ['noise', {mix: {o1: 0, o2: 0, n: 127}}]]) for (const res of [0, 64]) {
  const s = Q.vocSnd(base, {res, hold: new Array(16).fill(110)}, t0);
  out.push(`HOLD (synthesis bank only) ${nm} chord C3-E3-G3 RESO ${res}: ${await d(s, chord3, null)}`);
}
// 2) analysis bank only: broadband noise modulator, noise carrier
{ const m = noise(sec, .2, 11); const s = Q.vocSnd(base, {}, {mix: {o1: 0, o2: 0, n: 127}}); out.push(`noise modulator + noise carrier (both banks, broadband): ${await d(s, chord3, {e2: m})}`); }
// 3) noise modulator, saw carrier
{ const m = noise(sec, .2, 11); const s = Q.vocSnd(base, {}, {}); out.push(`noise modulator + INIT saw chord: ${await d(s, chord3, {e2: m})}`); }
// 4) voice-like modulator: 5 vowels, vibrato, as the app's own probe uses
for (const f0 of [110, 180]) {
  const m = Float32Array.from(await page.evaluate(([sec, f0]) => SYNQUENZER.mkVowel({f0, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec, sr: 48000, rms: -20, vib: 20}), [sec, f0]));
  const s = Q.vocSnd(base, {}, {});
  out.push(`vowel sequence f0 ${f0} vib 20 + INIT saw chord C3-E3-G3: ${await d(s, chord3, {e2: m})}`);
  out.push(`vowel sequence f0 ${f0} vib 20 + INIT saw C4 single: ${await d(s, [[0, 'on', 60, .8]], {e2: m})}`);
}
console.log(out.join('\n')); console.log('errs', errs.slice(0, 3));
await br.close();
