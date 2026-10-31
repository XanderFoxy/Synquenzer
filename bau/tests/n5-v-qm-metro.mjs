// QA musiker VV1: metronome on (as while composing) → is the metronome click in the video sound?
import { open, buildSong, OUTQ } from './n5-v-qm-lib.mjs';
import fs from 'fs';
const {b, p, errs} = await open({touch: true});
await buildSong(p, {take: false});
const run = async metro => p.evaluate(async metro => { SYNQUENZER.setMetronome(metro); const r = await SYNQUENZER.vvRender({range: {a: 0, b: 2}});
  const clicks = r.log.filter(e => e.src === 'click');
  // energy around 1100/1760 Hz (Goertzel) in the first 30 ms after each beat vs. same window with metro off later
  const x = VV.last, L = x.ch[0], sr = x.sr, spb = 60 / x.bpm; const gz = (f, a, n) => { const w = 2 * Math.PI * f / sr, c = 2 * Math.cos(w); let s1 = 0, s2 = 0; for (let k = a; k < a + n; k++) { const s = L[k] + c * s1 - s2; s2 = s1; s1 = s; } return Math.sqrt(s1 * s1 + s2 * s2 - c * s1 * s2) / n; };
  const e = []; for (let bt = 0; bt < 8; bt++) { const a = Math.round(bt * spb * sr), n = Math.round(.025 * sr); e.push(+(20 * Math.log10(gz(bt % 4 === 0 ? 1760 : 1100, a, n) + 1e-12)).toFixed(1)); }
  return {metro, clicksInLog: clicks.length, toneDbPerBeat: e}; }, metro);
console.log(JSON.stringify(await run(false)));
console.log(JSON.stringify(await run(true)));
// also: the sheet does not say anything about the metronome
await p.evaluate(() => SYNQUENZER.vvOpen()); await p.waitForTimeout(500);
console.log('sheet text:', JSON.stringify(await p.evaluate(() => document.getElementById('vvSheet').innerText.replace(/\s+/g, ' '))));
console.log('errors', errs);
await b.close();
