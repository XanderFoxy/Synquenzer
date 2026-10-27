// VS5b T5 (from VS5a T5): Dehnen on a sung take from the fake microphone; real fake microphone (sung WAV) → ● REC take → marks in the worker → quantize → heard; no network while editing marks
import {launch, open5, sleep, writeWav, micOn, waitBeat, idle, OUT, SR} from './gs7-v3-vs5a-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
// sung phrase: 8 syllables per 2 s (eighths at 120 bpm with human offsets), 16 s loop
const notes = []; const F = [220, 247, 262, 294, 330, 294, 262, 247];
for (let k = 0; k < 64; k++) { const t = 0.25 + k * 0.25 + ((k * 37) % 7 - 3) * 0.006; notes.push({t, d: 0.2, f0: F[k % 8], vowel: 'aeiou'[k % 5], cons: k % 3 === 0}); }
const v = voice(SR, 16.5, notes, {seed: 4}).x;
const wav = OUT + '/sung.wav'; writeWav(wav, v, SR);
const br = await launch(wav);
const H = await open5(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); });
await sleep(300);
await micOn(p);
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: 2}); SYNQUENZER.selectSlot(0, 2); });
await p.evaluate(() => SYNQUENZER.play());
await waitBeat(p, 3.5); await p.evaluate(() => SYNQUENZER.rec());
await waitBeat(p, 12.8); await idle(p);
await p.evaluate(() => SYNQUENZER.stop());
const I = await p.evaluate(() => SYNQUENZER.tkInfo()), st = I.stimme;
const c = st >= 0 ? await p.evaluate(t => SYNQUENZER.getClip(t, 2), st) : null;
ok(c && c.audio, 'take recorded from the fake mic: ' + JSON.stringify(c && c.audio));
const n0 = H.reqs.length;
const det = await p.evaluate(id => SYNQUENZER.wpDetect(id), c.audio.take);
const seg = det.filter(m => m.t >= c.audio.in && m.t <= c.audio.out);
ok(seg.length >= 12 && seg.length <= 20, 'marks found in the sung take (2 bars, 16 syllables): ' + seg.length + ' · ' + JSON.stringify((await p.evaluate(id => SYNQUENZER.wpInfo(id).lastDet, c.audio.take))));
const g = await p.evaluate(st => SYNQUENZER.wpQuantize({t: st, s: 2}, {grid: '1/8', strength: 0.7, mode: 'stretch'}), st);
const W = await p.evaluate(id => SYNQUENZER.wpInfo(id).warp, c.audio.take);
const sp = 0.5, step = 0.25 * 2 * sp;   // 1/8 = half a beat
let mx = 0, nIn = 0; W.map.src.slice(1, -1).forEach((s, k) => { const b = (s - W.t0) / step, q = Math.round(b) * step + W.t0; if (Math.abs(b - Math.round(b)) <= 0.4) { nIn++; mx = Math.max(mx, Math.abs(W.map.dst[k + 1] - (s + 0.7 * (q - s)))); } });
ok(g === '1/8' && mx * SR <= 1, 'quantized 70 % of the way to 1/8 on the clip grid (t0 ' + W.t0.toFixed(4) + ' s): ' + nIn + ' marks, max ' + (mx * SR).toFixed(2) + ' samples');
const Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 10), c.audio.take);
ok(Y && !Y.raw, 'playback uses the quantized version');
const raw = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), c.audio.take)), yy = Float32Array.from((await p.evaluate(id => SYNQUENZER.wpPlayed(id), c.audio.take)).data);
const LI = await p.evaluate(id => SYNQUENZER.wpInfo(id), c.audio.take);
console.log('lens', raw.length, yy.length, JSON.stringify(LI.warn), 'src', LI.warp.map.src.slice(0, 8).join(' '), 'dst', LI.warp.map.dst.slice(0, 8).join(' '));
const TSR = (await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), c.audio.take)).sr; console.log('take sr', TSR);
let bit = 0; const sx = LI.warp.map.src.slice(1, -1), dx = LI.warp.map.dst.slice(1, -1);
sx.forEach((s, k) => { const S0 = Math.round(s * TSR), D0 = Math.round(dx[k] * TSR); let same = true; for (let j = 0; j < 0.02 * TSR; j++) if (yy[D0 + j] !== raw[S0 + j]) { same = false; break; } if (same) bit++; else console.log('  not bit-identical at mark', k, s, dx[k]); });
ok(LI.last.mode === 'stretch' && bit === sx.length, 'sung take, Dehnen 70 %: first 20 ms after each mark bit-identical ' + bit + '/' + sx.length + ' · render ' + JSON.stringify(LI.last));
const fin = yy.every(Number.isFinite); let pk = 0, pr = 0; for (const v of yy) pk = Math.max(pk, Math.abs(v)); for (const v of raw) pr = Math.max(pr, Math.abs(v));
ok(fin && pk <= pr * 1.01, 'output finite, peak ' + pk.toFixed(3) + ' ≤ raw ' + pr.toFixed(3));
await p.evaluate(id => SYNQUENZER.wpLyrics(id, 'la la la la la la la la'), c.audio.take);
ok((await p.evaluate(id => SYNQUENZER.wpLyr(id), c.audio.take)).labels.slice(0, 8).every(x => x === 'la'), 'songtext on the sung take');
const nw = H.reqs.slice(n0).filter(r => !/^(blob|data|file):/.test(r.u));
ok(!nw.length, 'no network requests while finding marks / quantizing (' + nw.length + '; local: ' + H.reqs.slice(n0).map(r => r.u.slice(0, 5)).join(',') + ')');
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs));
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
