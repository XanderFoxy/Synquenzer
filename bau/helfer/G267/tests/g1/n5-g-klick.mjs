// G1-03 Hilfe: M-KLICK der gerechneten Fassung (Dehnen/Scheiben, Stärken) – wo und wie stark
import {launch, openG, sleep, toI16, mKlick, hp, SR} from './n5-g-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
const OFF = [0, 60, -60, 45, -50, 60, -60, 0, 55, -45, 60, -60, 30, -30];
const notes = OFF.map((o, k) => ({t: 0.5 + k * 0.25 + o / 1000, d: 0.11, f0: [220, 247, 262, 294][k % 4], vowel: 'aeiou'[k % 5], cons: k % 2 === 1}));
const x = voice(SR, 4, notes, {seed: 3}).x;
const NOISE = process.argv[2] === 'noise'; if (NOISE) { let sd = 5; for (let i = 0; i < x.length; i++) { sd = (sd * 16807) % 2147483647; x[i] += 0.0005 * (sd / 2147483647 * 2 - 1); } }
const hpAt = (y, t) => { const h = hp(y, 5000), W = 96, i0 = Math.round(t * SR); let s = 0; for (let i = i0; i < i0 + W; i++) s += h[i] * h[i]; return (10 * Math.log10(s / W + 1e-20)).toFixed(1); };
const br = await launch(null); const H = await openG(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x)); const id = r1.id;
await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
const ex = notes.map(n => n.t);
{ const r = mKlick(x, ex); console.log('orig', JSON.stringify(r), 'abs', hpAt(x, r.at)); }
for (const [mode, st] of [['stretch', 0.7], ['stretch', 1], ['stretch', 0.5], ['slice', 1]]) {
  await p.evaluate(([id, mode, st]) => SYNQUENZER.wpQuantize(id, {grid: '1/8', strength: st, mode}), [id, mode, st]);
  const q = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id), w = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id));
  const y = Float32Array.from(q.data), dst = w.warp.map.dst.slice(1, -1);
  // exceptions: the heard onsets = targets of the true onsets
  const exq = notes.map(n => { const s = w.warp.map.src, d = w.warp.map.dst; let k = 0; while (k < s.length - 2 && s[k + 1] < n.t) k++; return d[k] + (n.t - s[k]) * (d[k + 1] - d[k]) / (s[k + 1] - s[k]); });
  const r = mKlick(y, exq);
  console.log(mode, st, JSON.stringify(r), 'abs HP dBFS at worst', hpAt(y, r.at), 'warn', JSON.stringify(w.warn), 'marks', dst.length, 'src', w.warp.map.src.slice(1,-1).map(v=>v.toFixed(3)).join(','));
}
await br.close();
