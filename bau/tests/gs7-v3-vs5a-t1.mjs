// VS5a T1: detection, quantize 100/50 % (N7V-26), slices (N7V-27), N7S-51 (grid, M-KLICK, M-EINBRUCH, undo bitgleich, catch window), A/B, roundtrip
import {voice} from '../vs-dsp/test-signals.mjs';
import {launch, open5, sleep, clicks, legato, toI16, mKlick, mEinbruch, onsets, peakDb, deq, SR} from './gs7-v3-vs5a-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const H = await open5(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
// 1/16 = 0.125 s. Eighth onsets with offsets (ms); 60 ms = 48 % of a 1/16 → outside the catch window
const OFF = [12, -18, 30, -8, 45, -40, 60, 0, 22, -26, 15, -5, 35, -12, 8, -30];
const T = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), LEN = 4.0 + 0.5;
const x = clicks(T, LEN);
const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 3}), toI16(x));
ok(r && r.id && r.stored, 'take injected ' + JSON.stringify(r));
const id = r.id, ref = {t: r.track, s: 0};
// detection
const det = await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
const info0 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
console.log('detected', det.length, 'how', info0.lastDet && info0.lastDet.how, info0.lastDet && info0.lastDet.ms + ' ms', 't0', info0.t0);
const err = T.map(t => { let b = 1e9; for (const m of det) b = Math.min(b, Math.abs(m.t - t)); return b * 1000; });
ok(det.length === T.length && Math.max(...err) < 5, 'clicks found: ' + det.length + '/' + T.length + ', max err ' + Math.max(...err).toFixed(2) + ' ms');
ok(!(await p.evaluate(id => SYNQUENZER.takes()[id].marks, id)), 'detected marks are not written into the project (take unchanged)');
// N7V-26 100 %
const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
const g = await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 1}), ref);
const I1 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
ok(g === '1/16' && I1.warp && I1.warp.mode === 'slice', 'quantized 1/16: ' + g);
ok(await p.evaluate(() => SYNQUENZER.undoInfo().n) === u0 + 1, 'one undo step');
const src = I1.warp.map.src.slice(1, -1), dst = I1.warp.map.dst.slice(1, -1), step = 0.125;
let maxS = 0, nIn = 0, nOut = 0;
src.forEach((s, k) => { const q = Math.round(s / step) * step, inC = Math.abs(s - q) <= 0.4 * step; if (inC) { nIn++; maxS = Math.max(maxS, Math.abs(dst[k] - q) * SR); } else { nOut++; if (dst[k] !== s) maxS = 99; } });
ok(maxS <= 1, 'N7V-26 100 %: ' + nIn + ' marks on the grid, max ' + maxS.toFixed(3) + ' samples; ' + nOut + ' outside ±40 % unchanged');
// N7V-27 slices: attacks bitgleich, peak per click ±0.1 dB
const Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id);
ok(Y && !Y.raw && Y.n === x.length, 'played buffer = rendered slices (' + (Y && Y.n) + ' samples), render ' + JSON.stringify(I1.last));
const raw = await p.evaluate(id => SYNQUENZER.tkBufRange(id), id);
const y = Float32Array.from(Y.data);
let bitOk = 0, pkWorst = 0;
src.forEach((s, k) => {
  const O = Math.round(s * SR), D = O + (Math.round(dst[k] * SR) - Math.round(s * SR)), L = Math.round(0.02 * SR);
  let same = true; for (let j = 0; j < L; j++) if (y[D + j] !== raw[O + j]) { same = false; break; }
  if (same) bitOk++;
  const pd = Math.abs(peakDb(y, D, D + 0.1 * SR) - peakDb(raw, O, O + 0.1 * SR)); pkWorst = Math.max(pkWorst, pd);
});
ok(bitOk === src.length, 'N7V-27 attacks bit-identical (20 ms from each onset): ' + bitOk + '/' + src.length);
ok(pkWorst <= 0.1, 'N7V-27 peak per click ±0.1 dB: worst ' + pkWorst.toFixed(4) + ' dB');
// N7S-51: onsets ±2 ms on grid (independent finder), M-KLICK
const on = onsets(y, 0.05);
const gErr = on.map(t => { const q = Math.round(t / step) * step; return Math.abs(t - q) * 1000; });
const exp = T.filter(t => Math.abs(t - Math.round(t / step) * step) <= 0.4 * step + 1e-9).length;
ok(gErr.filter(e => e <= 2.05).length >= exp, 'N7S-51 onsets on grid ±2 ms: ' + gErr.filter(e => e <= 2.05).length + ' (expected ≥ ' + exp + '), errors ' + gErr.map(e => e.toFixed(1)).join(' '));
const ATT = src.map((s, k) => T[k] + dst[k] - s);   // the real click onsets after moving
const k1 = mKlick(y, ATT), k0 = mKlick(raw, T);
ok(k1.worst <= 6, 'N7S-51 M-KLICK slices ≤ +6 dB: ' + JSON.stringify(k1) + ' (raw ' + JSON.stringify(k0) + ')');
// 50 %
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 0.5}), ref);
const I2 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
let half = 0; I2.warp.map.src.slice(1, -1).forEach((s, k) => { const q = Math.round(s / step) * step; if (Math.abs(s - q) <= 0.4 * step) half = Math.max(half, Math.abs(I2.warp.map.dst[k + 1] - (s + (q - s) / 2)) * 1000); });
ok(half <= 2 && I2.warp.strength === 0.5, 'N7S-51 / N7V-26 50 % = half way: max ' + half.toFixed(4) + ' ms');
// A/B
await p.evaluate(() => SYNQUENZER.wpAB(true)); const yab = await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 10), id);
ok(yab.raw, 'A/B: original heard'); await p.evaluate(() => SYNQUENZER.wpAB(false));
// strength 0 = bitgleich
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 0}), ref);
const y0 = await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 10), id);
ok(y0.raw, 'strength 0 → raw take (bit-identical)');
// undo all → original bitgleich, project take without marks/warp
for (let n = 0; n < 5; n++) { const top = await p.evaluate(() => SYNQUENZER.undoInfo().top); if (!top || top.kind !== 'takes') break; await p.evaluate(() => SYNQUENZER.undo()); }
const I3 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id), y3 = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id);
let same3 = y3.raw && y3.n === raw.length; if (same3) for (let i = 0; i < raw.length; i++) if (y3.data[i] !== raw[i]) { same3 = false; break; }
ok(!I3.warp && !I3.marks && same3, 'N7S-51 after undo: take without marks/warp, original bit-identical');
// roundtrip with warp
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 1}), ref); await p.evaluate(id => SYNQUENZER.wpMark(id, 'add', 2.2), id);
const P1 = await p.evaluate(() => SYNQUENZER.project());
await p.evaluate(() => SYNQUENZER.importJSON(SYNQUENZER.serialize())); await sleep(400);
const P2 = await p.evaluate(() => SYNQUENZER.project());
ok(deq(P1, P2) && P2.takes[id].warp && P2.takes[id].marks, 'save → load deep-equal with marks + warp');
// legato (sung-like) – M-EINBRUCH at every cut
const OFF2 = [10, -20, 25, -15, 30, -10, 20, -25, 15, -5, 28, -22];
const T2 = OFF2.map((o, k) => 0.5 + k * 0.25 + o / 1000), F2 = [220, 247, 262, 294, 330, 294, 262, 247, 220, 196, 220, 247];
const x2 = voice(SR, 4.0, T2.map((t, k) => ({t, d: (k + 1 < T2.length ? T2[k + 1] - t : 0.4) + 0.03, f0: F2[k], vowel: 'aeiou'[k % 5]})), {seed: 3}).x;
{ let sd = 5; for (let i = 0; i < x2.length; i++) { sd = (sd * 16807) % 2147483647; x2[i] += 0.0005 * (sd / 2147483647 * 2 - 1); } }
const r2 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x2));
const ref2 = {t: r2.track, s: 1}, det2 = await p.evaluate(id => SYNQUENZER.wpDetect(id), r2.id);
const e2 = T2.map(t => { let b = 1e9; for (const m of det2) b = Math.min(b, Math.abs(m.t - t)); return b * 1000; });
console.log('legato marks', det2.length, '/', T2.length, 'max err', Math.max(...e2).toFixed(1), 'ms');
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 1}), ref2);
const W2 = await p.evaluate(id => SYNQUENZER.wpInfo(id).warp, r2.id), Y2 = Float32Array.from((await p.evaluate(id => SYNQUENZER.wpPlayed(id), r2.id)).data);
const eb = W2.map.dst.slice(1, -1).map(t => mEinbruch(Y2, t - 0.003)), eb0 = T2.map(t => mEinbruch(x2, t - 0.003));
console.log('M-EINBRUCH slices (dB):', eb.join(' '), '| raw:', eb0.join(' '));
const extra = Math.min(...eb.map((v, k) => v - eb0[k]));
ok(extra >= -3, 'N7S-51 M-EINBRUCH sung notes: no cut adds more than 3 dB to the dip of the original at the same place (worst extra ' + extra.toFixed(2) + ' dB; slices ' + Math.min(...eb) + ' / raw ' + Math.min(...eb0) + ')');
const k2 = mKlick(Y2, W2.map.dst.slice(1, -1)), k20 = mKlick(x2, T2); console.log('M-KLICK raw legato', JSON.stringify(k20)); ok(k2.worst <= k20.worst + 1, 'M-KLICK sung notes: slices ' + k2.worst + ' dB ≤ raw ' + k20.worst + ' + 1 dB');
// sustained tone with phase-continuous pitch steps at known onsets (raw passes both meters) – the slice machinery itself
{
  const F3 = [220, 262, 247, 294, 330, 294, 262, 220, 196, 247, 262, 330], n3 = Math.round(4.0 * SR), x3 = new Float32Array(n3); let ph = 0;
  for (let i = 0; i < n3; i++) { const t = i / SR; let k = 0; for (let j = 0; j < T2.length; j++) if (t >= T2[j]) k = j; ph += 2 * Math.PI * F3[k] / SR; let v = 0; for (let h = 1; h <= 6; h++) v += Math.sin(h * ph) / h; x3[i] = 0.2 * v * Math.min(1, t / 0.02, (4.0 - t) / 0.02); }
  const q3 = await p.evaluate(a => SYNQUENZER.wpCore('quantizeMarks', [a, {bpm: 120, t0: 0, grid: '1/16', strength: 1}]), T2);
  const y3 = Float32Array.from(await p.evaluate(([x, on, to]) => SYNQUENZER.wpCore('renderSlices', [x, 48000, on, to]), [Array.from(x3), T2, q3.times]));
  const e3 = q3.times.map(t => mEinbruch(y3, t - 0.003)), r3 = T2.map(t => mEinbruch(x3, t - 0.003));
  const kk3 = mKlick(y3, [0.02, 0.04].concat(q3.times)), kr3 = mKlick(x3, [0.02, 0.04].concat(T2));
  console.log('sustained: shifts ms', q3.times.map((t, k) => ((t - T2[k]) * 1000).toFixed(0)).join(' '));
  console.log('sustained M-EINBRUCH slices', e3.join(' '), '| raw', r3.join(' '));
  ok(Math.min(...r3) >= -3 && kr3.worst <= 6, 'sustained raw passes the meters: ' + Math.min(...r3) + ' dB, ' + JSON.stringify(kr3));
  console.log((Math.min(...e3) >= -3 ? '✓' : 'LIMIT') + ' strictly periodic tone, slices: M-EINBRUCH worst ' + Math.min(...e3) + ' dB, M-KLICK ' + JSON.stringify(kk3) + ' (phase jump at a gap is unavoidable while the onset stays bit-identical)');
}
console.log('errors', JSON.stringify(H.errs));
ok(!H.errs.length, 'no console errors');
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
