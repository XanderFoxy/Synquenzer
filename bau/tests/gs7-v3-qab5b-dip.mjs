// QA VS5b: 5-ms level dips inside the rendered Dehnen / Scheiben versions (tone between clicks), positions vs. marks
import {launch, open5, sleep, toI16, clickTone} from './gs7-v3-vs5b-h.mjs';
const br = await launch(null);
const H = await open5(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setBpm(120); });
const sr = await p.evaluate(() => window.__ctx.sampleRate);
const OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9, 15, -12, 28, -20, 7, -33, 24, -4, 19, -25, 11, -14, 30];
const x = clickTone(OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), 8.2);
const r = await p.evaluate(([pcm, sr]) => SYNQUENZER.tkInject({pcm, sr, scene: 7, len: 4}), [toI16(x), sr]);
await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
const raw = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), r.id));
function dipsOf(y, att, a, b) { const W = Math.round(0.005 * sr), out = []; const lv = []; for (let i = Math.round(a * sr); i + W < Math.round(b * sr); i += Math.round(sr / 2000)) { const t = i / sr; if (att.some(q => t > q - 0.006 && t < q + 0.045)) continue; let s = 0; for (let j = i; j < i + W; j++) s += y[j] * y[j]; lv.push([t, 10 * Math.log10(s / W + 1e-20)]); }
  const so = lv.map(v => v[1]).sort((x, y) => x - y), med = so[so.length >> 1]; return lv.filter(v => v[1] - med < -3).map(v => v[0].toFixed(4) + ':' + (v[1] - med).toFixed(1)); }
const T0 = await p.evaluate(id => SYNQUENZER.wpInfo(id), r.id);
console.log('raw dips', JSON.stringify(dipsOf(raw, (T0.det || T0.marks).map(m => m.t), 0.5, 7.6)).slice(0, 300));
for (const [g, st, md] of [['1/16', 1, 'stretch'], ['1/16', 1, 'slice'], ['1/8', 0.7, 'stretch'], ['1/16', 0.7, 'stretch']]) {
  await p.evaluate(([r, g, st, md]) => SYNQUENZER.wpQuantize({t: r.track, s: 7}, {grid: g, strength: st, mode: md}), [r, g, st, md]);
  const Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), r.id), y = Float32Array.from(Y.data);
  const W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), r.id)).warp.map, dst = W.dst.slice(1, -1), src = W.src.slice(1, -1);
  const d = dipsOf(y, dst, 0.5, 7.6);
  console.log(g, st, md, 'dips > 3 dB below median (t:dB):', d.length, JSON.stringify(d.slice(0, 16)));
  // describe the position of the worst dip relative to the next mark and the slice factor
  if (d.length) { const w = d.map(s => s.split(':').map(Number)).sort((a, b) => a[1] - b[1])[0]; const k = dst.findIndex(t => t > w[0]); console.log('   worst', w, 'next mark dst', dst[k] && dst[k].toFixed(4), 'Δ', ((dst[k] - w[0]) * 1000).toFixed(1), 'ms; slice factor', k > 0 ? ((dst[k] - dst[k - 1]) / (src[k] - src[k - 1])).toFixed(3) : '-'); }
}
await br.close();
