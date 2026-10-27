// dumps the injected N7V-28 take (raw), sr and the editor's warp maps for node-side iteration
import fs from 'fs';
import {launch, open5, toI16, clickTone} from './v3-vs5b-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
const br = await launch(null);
const H = await open5(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setBpm(120); });
const sr = await p.evaluate(() => window.__ctx.sampleRate);
const f0 = +(process.argv[2]) || 220;
const OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9, 15, -12, 28, -20, 7, -33, 24, -4, 19, -25, 11, -14, 30];
let x;
if (process.argv[2] === 'legato') { const O2 = [22, -31, 14, 40, -18, 27, -42, 11, 35, -25, 19, -12, 44, -36, 9, 30], F = [196, 220, 247, 262, 294, 262, 247, 220], notes = [];
  for (let k = 0; k < 28; k++) notes.push({t: 0.5 + k * 0.25 + O2[k % 16] / 1000, d: 0.3, f0: F[k % 8], vowel: 'aeiou'[k % 5], cons: false});
  x = voice(sr, 8.2, notes, {seed: 3}).x; } else x = clickTone(OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), 8.2, {f0});
const r = await p.evaluate(([pcm, sr]) => SYNQUENZER.tkInject({pcm, sr, scene: 7, len: 4}), [toI16(x), sr]);
await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
const raw = Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), r.id));
const maps = {};
for (const [g, st] of [['1/8', 0.7], ['1/8', 1], ['1/16', 0.7], ['1/16', 1]]) {
  await p.evaluate(([r, g, st]) => SYNQUENZER.wpQuantize({t: r.track, s: 7}, {grid: g, strength: st, mode: 'stretch'}), [r, g, st]);
  const Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), r.id);
  maps[g + ' ' + st] = {map: (await p.evaluate(id => SYNQUENZER.wpInfo(id), r.id)).warp.map, played: Array.from(Y.data)};
}
fs.writeFileSync('vs5b/dump-' + process.argv[2] + '.json', JSON.stringify({sr, raw, maps}));
await br.close();
