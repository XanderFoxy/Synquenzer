// QA VS4 G: steady tone / held note: level of the cleaned take vs raw (Wiener noise profile from the quietest frames)
import {launch, open, sleep} from './v3-qa-vs4-h.mjs';
const br = await launch(null), H = await open(br), p = H.p;
for (const [lab, f, sec, nz] of [['sine 440 Hz 4.2 s, no noise', 440, 4.2, 0], ['sine 220 Hz 8 s + noise SNR 40', 220, 8, 0.003]]) {
  const sr = 48000, n = Math.round(sr * sec), pcm = new Array(n); let s = 9;
  for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; pcm[i] = Math.round((0.3 * Math.sin(2 * Math.PI * f * i / sr) + (s / 2147483647 - 0.5) * nz * 3.46) * 32767); }
  const r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 5, len: 4}), pcm);
  const out = [];
  for (const a of [60, 100]) {
    await p.evaluate(([id, a]) => SYNQUENZER.clSet(id, a), [r.id, a]); await p.evaluate(id => SYNQUENZER.clWait(id), r.id);
    const m = await p.evaluate(id => { const x = SYNQUENZER.tkBufRange(id), y = SYNQUENZER.clPlayRange(id); let a = 0, b = 0; for (let i = 4800; i < x.length - 4800; i++) { a += x[i] * x[i]; b += y[i] * y[i]; } return +(10 * Math.log10(b / a)).toFixed(1); }, r.id);
    out.push(`${a} %: ${m} dB`);
  }
  console.log(lab + ': cleaned vs raw level ' + out.join(', '));
}
console.log('errs', JSON.stringify(H.errs));
await br.close();
