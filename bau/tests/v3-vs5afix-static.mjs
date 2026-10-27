// VS5a-fix: the continuous tone of QA D played WITHOUT any switch: where does the HP-5k meter (2-ms windows vs. the median of
// the steady tone) exceed +10 dB? (separates properties of the tone/clip loop from the switch)
import {launch, open5, sleep, toI16, hp, recStart, recStop} from './v3-qa-vs5a-h2.mjs';
const br = await launch(null); const H = await open5(br, {}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const LEN = 4.6, n = Math.round(48000 * LEN), xs = new Float32Array(n); let ph = 0;
const TT = [0.5, 0.762, 0.98, 1.27, 1.49, 1.77, 2.01, 2.24, 2.52, 2.75, 3.03, 3.23, 3.52, 3.74, 4.03, 4.27];
for (let i = 0; i < n; i++) { const t = i / 48000; let k = 0; for (let j = 0; j < TT.length; j++) if (t >= TT[j]) k = j; ph += 2 * Math.PI * [220, 247, 262, 294][k % 4] / 48000; let v = 0; for (let h = 1; h <= 5; h++) v += Math.sin(h * ph) / h; xs[i] = 0.2 * v * Math.min(1, t / 0.02, (LEN - t) / 0.02); }
const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(xs));
console.log('marks', JSON.stringify((await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id)) || []).slice(0, 80));
await recStart(p); await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(9000);
const clk = await p.evaluate(() => SYNQUENZER.vsClock());
const R = await recStop(p); await p.evaluate(() => SYNQUENZER.stop());
const y = Float32Array.from(R.y), sr = R.sr, h = hp(y, 5000, sr), W = Math.round(0.002 * sr), e = [];
for (let k = 0; k + 1 < h.length / W; k++) { let s = 0; for (let i = k * W; i < (k + 1) * W; i++) s += h[i] * h[i]; e.push(10 * Math.log10(s / W + 1e-14)); }
const med = e.slice(Math.round(0.3 * sr / W), Math.round(0.8 * sr / W)).sort((a, b) => a - b)[Math.round(0.25 * sr / W)];
const pk = []; for (let k = 1; k < e.length - 1; k++) if (e[k] - med > 10 && e[k] >= e[k - 1] && e[k] >= e[k + 1]) pk.push([((k * W + R.f0) / sr - clk.start), e[k] - med]);
console.log('HP-5k peaks > 10 dB over the steady tone, WITHOUT any switch (s after scene start → take time = mod 4 + 0.5?):');
console.log(pk.map(([t, v]) => t.toFixed(3) + ':' + v.toFixed(1)).join(' '));
await br.close();
