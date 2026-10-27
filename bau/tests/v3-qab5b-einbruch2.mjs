// QA VS5b FP-DSP: spec M-EINBRUCH at Dehnen seams on legato sung material (voice(), notes overlap, no gaps), Dehnen − original
import {launch, open5, sleep, toI16} from './v3-vs5b-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
const br = await launch(null);
const H = await open5(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setBpm(120); });
const sr = await p.evaluate(() => window.__ctx.sampleRate);
const OFF = [22, -31, 14, 40, -18, 27, -42, 11, 35, -25, 19, -12, 44, -36, 9, 30];
const F = [196, 220, 247, 262, 294, 262, 247, 220], notes = [];
for (let k = 0; k < 28; k++) notes.push({t: 0.5 + k * 0.25 + OFF[k % 16] / 1000, d: 0.3, f0: F[k % 8], vowel: 'aeiou'[k % 5], cons: false});
const x = voice(sr, 8.2, notes, {seed: 3}).x;
const r = await p.evaluate(([pcm, sr]) => SYNQUENZER.tkInject({pcm, sr, scene: 7, len: 4}), [toI16(x), sr]);
await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
const raw = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), r.id));
function mE(y, p) { const W = Math.round(0.005 * sr), lv = c => { c = Math.round(c); let s = 0; for (let i = c; i < c + W; i++) s += y[i] * y[i]; return 10 * Math.log10(s / W + 1e-14); };
  const P = Math.round(p * sr), ref = []; for (let d = -50; d <= -10; d++) ref.push(lv(P + d * sr / 1000)); const rr = ref.reduce((a, b) => a + b) / ref.length; let w = 0; for (let d = -50; d <= 45; d++) { const v = lv(P + d * sr / 1000) - rr; if (v < w) w = v; } return +w.toFixed(2); }
for (const [g, st] of [['1/8', 0.7], ['1/8', 1], ['1/16', 0.7]]) {
  await p.evaluate(([r, g, st]) => SYNQUENZER.wpQuantize({t: r.track, s: 7}, {grid: g, strength: st, mode: 'stretch'}), [r, g, st]);
  const y = Float32Array.from((await p.evaluate(id => SYNQUENZER.wpPlayed(id), r.id)).data);
  const W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), r.id)).warp.map, dst = W.dst.slice(1, -1), src = W.src.slice(1, -1);
  const rows = []; dst.forEach((d, k) => { if (k === 0 || d < 0.7 || Math.abs(d - src[k]) < 1e-4) return; const a = mE(y, d - 0.0065), b = mE(raw, src[k] - 0.0065); rows.push([a, b]); });
  const worse = rows.filter(([a, b]) => a < -3 && a < b - 3);
  console.log(`${g} ${st * 100}%: moved seams ${rows.length}, M-EINBRUCH worst Dehnen ${Math.min(...rows.map(v => v[0]))} dB vs original ${Math.min(...rows.map(v => v[1]))} dB; seams > 3 dB and ≥ 3 dB worse than the original: ${worse.length} ${JSON.stringify(worse.slice(0, 8))}`);
}
await br.close();
