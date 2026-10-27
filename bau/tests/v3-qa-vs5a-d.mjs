// QA VS5a D: repeated switches while playing (quantize 1/8 ↔ Aus ↔ 1/16 …) on a continuous harmonic tone; each switch analysed in the real output
import fs from 'fs';
import {launch, open5, sleep, toI16, hp, recStart, recStop, QOUT} from './v3-qa-vs5a-h2.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const H = await open5(br, {}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const LEN = 4.6, n = Math.round(48000 * LEN), xs = new Float32Array(n); let ph = 0;
const TT = [0.5, 0.762, 0.98, 1.27, 1.49, 1.77, 2.01, 2.24, 2.52, 2.75, 3.03, 3.23, 3.52, 3.74, 4.03, 4.27];
for (let i = 0; i < n; i++) { const t = i / 48000; let k = 0; for (let j = 0; j < TT.length; j++) if (t >= TT[j]) k = j; ph += 2 * Math.PI * [220, 247, 262, 294][k % 4] / 48000; let v = 0; for (let h = 1; h <= 5; h++) v += Math.sin(h * ph) / h; xs[i] = 0.2 * v * Math.min(1, t / 0.02, (LEN - t) / 0.02); }
const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(xs));
const id = r.id;
await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
await recStart(p);
await p.evaluate(() => { window.__rs = []; const o = tkVoxResync; window.tkVoxResync = f => { window.__rs.push(window.__ctx.currentTime); return o(f); }; });
await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(900);
const G = ['1/8', 'off', '1/16', '1/8', 'off', '1/16T', '1/4', 'off', '1/8', '1/16', 'off', '1/8T'], sw = [];
for (let k = 0; k < G.length; k++) {
  const t = await p.evaluate(async ([id, g]) => { const t = window.__ctx.currentTime; await SYNQUENZER.wpQuantize(id, {grid: g, strength: 1}); return t; }, [id, G[k]]);
  sw.push(t); await sleep(700 + 137 * k % 300);
}
const RS = await p.evaluate(() => window.__rs);
const R = await recStop(p); await p.evaluate(() => SYNQUENZER.stop());
const y = Float32Array.from(R.y), sr = R.sr, f0 = R.f0;
// click meter: HP 5 kHz, 2-ms windows, vs the median of the steady tone (first 0.5 s of the recording after the start)
const h = hp(y, 5000, sr), W = Math.round(0.002 * sr), e = [];
for (let k = 0; k + 1 < h.length / W; k++) { let s = 0; for (let i = k * W; i < (k + 1) * W; i++) s += h[i] * h[i]; e.push(10 * Math.log10(s / W + 1e-14)); }
const med = e.slice(Math.round(0.3 * sr / W), Math.round(0.8 * sr / W)).sort((a, b) => a - b)[Math.round(0.25 * sr / W)];
const lv = c => { const W5 = Math.round(0.005 * sr); let s = 0; for (let i = c; i < c + W5; i++) s += (y[i] || 0) ** 2; return 10 * Math.log10(s / W5 + 1e-14); };
let bad = 0;
sw.forEach((t, k) => {
  const i0 = Math.round(t * sr) - f0; let pk = -99, pa = 0;
  for (let d = 0; d < Math.round(0.3 * sr / W); d++) { const j = Math.floor(i0 / W) + d; if (e[j] - med > pk) { pk = e[j] - med; pa = d * 2; } }
  const base = []; for (let d = -300; d < -10; d++) base.push(lv(i0 + Math.round(d * sr / 1000))); base.sort((a, b) => a - b);
  let dip = 99, da = 0; for (let d = 0; d < 300; d++) { const v = lv(i0 + Math.round(d * sr / 1000)) - base[Math.floor(base.length * 0.02)]; if (v < dip) { dip = v; da = d; } }
  const isBad = pk > 10 || dip < -3; if (isBad) bad++;
  console.log((isBad ? '✗' : ' '), 'switch', k + 1, '→', G[k], 'HP-5k peak', pk.toFixed(1), 'dB over the tone at +' + pa, 'ms; dip', dip.toFixed(1), 'dB at +' + da, 'ms');
});
console.log('resync calls (ctx s):', RS.map(t => t.toFixed(3)).join(' '));
let bad2 = 0;
RS.forEach((t, k) => {
  const i0 = Math.round((t + 0.006) * sr) - f0; let pk = -99, pa = 0;
  for (let d = -2; d <= 6; d++) { const j = Math.floor(i0 / W) + d; if (e[j] - med > pk) { pk = e[j] - med; pa = d * 2; } }
  let dip = 99; const b = lv(i0 - Math.round(0.03 * sr)); for (let d = -5; d <= 15; d++) dip = Math.min(dip, lv(i0 + Math.round(d * sr / 1000)) - b);
  let mj = 0, mi = 0; for (let i = i0 - 300; i < i0 + 600; i++) { const dd = Math.abs(y[i] - y[i - 1]); if (dd > mj) { mj = dd; mi = i; } }
  const bd = pk > 10 || dip < -3; if (bd) bad2++;
  if (mj > 0.06) console.log('    samples around the step (every 4th, from -2 ms):', Array.from(y.subarray(mi - 96, mi + 96)).filter((v, i) => i % 4 === 0).map(v => v.toFixed(2)).join(' '));
  console.log((bd ? '✗' : ' '), 'resync', k + 1, 'at', t.toFixed(3), ': HP-5k peak', pk.toFixed(1), 'dB at', pa, 'ms; level change', dip.toFixed(1), 'dB; max sample step', mj.toFixed(4), 'at', ((mi - i0) / sr * 1000).toFixed(1), 'ms');
});
ok(bad2 === 0, 'at the resync moments themselves: no click > 10 dB and no dip > 3 dB (' + bad2 + ' bad of ' + RS.length + ')');
fs.writeFileSync(QOUT + '/d-switch.json', JSON.stringify({sr, f0, sw, y: Array.from(y)}));
ok(bad === 0, 'no click (> 10 dB HP-5k over the steady tone) and no dip (> 3 dB) at any of ' + sw.length + ' switches while playing: ' + bad + ' bad');
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
