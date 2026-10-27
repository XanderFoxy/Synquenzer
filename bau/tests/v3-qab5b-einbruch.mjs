// QA VS5b FP-DSP: spec M-EINBRUCH (5-ms windows, ±50 ms, ≤ 3 dB below the mean before) at every Dehnen seam (N7V-28 material:
// clicks over a sustained tone), compared with the same measure on the original at the source positions
import {launch, open5, sleep, toI16, clickTone} from './v3-vs5b-h.mjs';
// spec M-EINBRUCH (same as the harness helper, with integer sample indices so it also works at 44.1 kHz)
function mEinbruch(y, p, sr) {
  const W = Math.round(0.005 * sr), lv = c => { c = Math.round(c); let s = 0; for (let i = c; i < c + W; i++) s += y[i] * y[i]; return 10 * Math.log10(s / W + 1e-14); };
  const P = Math.round(p * sr), ref = []; for (let d = -50; d <= -10; d++) ref.push(lv(P + d * sr / 1000));
  const r = ref.reduce((a, b) => a + b) / ref.length; let worst = 0;
  for (let d = -50; d <= 45; d++) { const v = lv(P + d * sr / 1000) - r; if (v < worst) worst = v; }
  return +worst.toFixed(2);
}
const br = await launch(null);
const H = await open5(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setBpm(120); });
const sr = await p.evaluate(() => window.__ctx.sampleRate);
const f0 = +(process.argv[2] || 196);
const OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9, 15, -12, 28, -20, 7, -33, 24, -4, 19, -25, 11, -14, 30];
const x = clickTone(OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), 8.2, {f0});
const r = await p.evaluate(([pcm, sr]) => SYNQUENZER.tkInject({pcm, sr, scene: 7, len: 4}), [toI16(x), sr]);
await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
const raw = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), r.id));
for (const [g, st, md] of [['1/8', 0.7, 'stretch'], ['1/8', 1, 'stretch'], ['1/16', 0.7, 'stretch'], ['1/16', 1, 'stretch'], ['1/16', 1, 'slice']]) {
  await p.evaluate(([r, g, st, md]) => SYNQUENZER.wpQuantize({t: r.track, s: 7}, {grid: g, strength: st, mode: md}), [r, g, st, md]);
  const Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), r.id), y = Float32Array.from(Y.data);
  const W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), r.id)).warp.map, dst = W.dst.slice(1, -1), src = W.src.slice(1, -1);
  const seamY = [], seamR = [];
  dst.forEach((d, k) => { if (k === 0 || d < 0.7) return; seamY.push(mEinbruch(y, d - 0.0065, sr)); seamR.push(mEinbruch(raw, src[k] - 0.0065, sr)); });
  const bad = seamY.filter(v => v < -3).length;
  if (process.argv[3] === 'prof' && g === '1/8' && st === 0.7) {
    const W5 = Math.round(0.005 * sr), lv = (yy, c) => { c = Math.round(c); let q = 0; for (let i = c; i < c + W5; i++) q += yy[i] * yy[i]; return 10 * Math.log10(q / W5 + 1e-14); };
    const ord = seamY.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]).slice(0, 3);
    for (const [v, i] of ord) { const k = dst.findIndex(d => d >= 0.7) + i; const d0 = dst[k], s0 = src[k], fac = (dst[k] - dst[k - 1]) / (src[k] - src[k - 1]);
      const P = d0 * sr, Q = s0 * sr; const pr = [], po = []; for (let ms = -50; ms <= 45; ms += 5) { pr.push(ms + ':' + (lv(y, P + ms * sr / 1000) - lv(raw, Q + ms * sr / 1000)).toFixed(1)); }
      console.log('   seam at mark dst ' + d0.toFixed(4) + ' (factor prev slice ' + fac.toFixed(3) + ', M-EINBRUCH ' + v + '): level Dehnen − original per 5-ms window, ms rel. to the mark: ' + pr.join(' ')); }
  }
  console.log(`${g} ${st * 100}% ${md}: seams ${seamY.length}, M-EINBRUCH worst ${Math.min(...seamY)} dB (original at the same marks ${Math.min(...seamR)} dB), seams > 3 dB: ${bad}  [${seamY.join(' ')}]`);
}
await br.close();
