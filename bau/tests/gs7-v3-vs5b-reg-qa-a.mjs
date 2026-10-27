// QA VS5a A: fake-mic beatbox take (● REC) → editor via touch → 1/16 100 % (N7V-26, N7V-27, N7S-51) measured in the rendered buffer AND in the real output; 50 %; undo/redo bit-exact
import fs from 'fs';
import {launch, open5, sleep, writeWav, micOn, waitBeat, idle, mKlick, deq, beatbox, onsets20, recStart, recStop, QOUT} from './gs7-v3-qa-vs5a-h2.mjs';
fs.mkdirSync(QOUT, {recursive: true});
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const SR0 = 48000, OFF = [12, -18, 30, -8, 45, -40, 60, 0, 22, -26, 15, -5, 35, -12, 8, -30], PAT = 'btkt bbkt btkt bkkt'.replace(/ /g, '');
const ev = []; for (let rep = 0; rep < 5; rep++) OFF.forEach((o, k) => ev.push({t: 0.25 + rep * 4 + k * 0.25 + o / 1000, s: PAT[k]}));
const wav = QOUT + '/a-beatbox.wav'; writeWav(wav, beatbox(ev, 20.5, SR0), SR0);
const br = await launch(wav);
const H = await open5(br, {touch: true, mobile: true}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); }); await sleep(300);
await micOn(p);
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: 2}); SYNQUENZER.selectSlot(0, 2); });
await p.evaluate(() => SYNQUENZER.play());
await waitBeat(p, 3.5); await p.evaluate(() => SYNQUENZER.rec());
await waitBeat(p, 12.8); await idle(p);
await p.evaluate(() => SYNQUENZER.stop());
await p.evaluate(() => SYNQUENZER.stimmeStop('test')); await sleep(300);
const I = await p.evaluate(() => SYNQUENZER.tkInfo()), st = I.stimme;
const c = await p.evaluate(t => SYNQUENZER.getClip(t, 2), st);
ok(c && c.audio, 'beatbox take recorded from the fake mic ' + JSON.stringify(c && c.audio));
const id = c.audio.take, tk = (await p.evaluate(() => SYNQUENZER.takes()))[id], sr = tk.sr;
const raw = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), id));
const rawOn = onsets20(raw, sr);
console.log('take sr', sr, 'len', (raw.length / sr).toFixed(3), 's; raw onsets', rawOn.length);
// open the editor from the takes sheet by touch
await p.evaluate(st => { SYNQUENZER.selectSlot(st, 2); return SYNQUENZER.tkSheet({t: st, s: 2}); }, st); await sleep(300);
await (await p.$('.tksheet button[data-a="wp"]')).tap(); await sleep(500);
await p.waitForFunction(id => SYNQUENZER.wpInfo(id).det, id, {timeout: 20000});
const det = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).det;
// mark vs real onset (only onsets inside the played piece)
const inP = t => t >= c.audio.in - 0.01 && t <= Math.min(c.audio.out, raw.length / sr - 0.12);
const pairs = rawOn.filter(inP).map(t => { let b = null; for (const m of det) if (!b || Math.abs(m.t - t) < Math.abs(b.t - t)) b = m; return {on: t, mk: b ? b.t : NaN}; });
const dm = pairs.map(q => (q.on - q.mk) * 1000);
console.log('marks', det.length, '; onset − mark (ms):', dm.map(v => v.toFixed(1)).join(' '));
ok(pairs.length >= 14 && dm.every(v => Math.abs(v) < 30), 'every played event has a mark within ±30 ms (' + pairs.length + ')');
// chip 1/16 by touch
const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
await (await p.$('#wpSheet .wpmode button[data-m="slice"]')).tap(); await sleep(150);   // VS5b: Editor startet mit Dehnen 70 % – für die VS5a-Prüfung Scheiben wählen (→ 100 %)
await (await p.$('#wpSheet .wpchips button[data-v="1/16"]')).tap(); await sleep(300);
await p.waitForFunction(id => SYNQUENZER.wpInfo(id).warp && SYNQUENZER.wpInfo(id).ready, id, {timeout: 20000});
const W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp;
ok(await p.evaluate(() => SYNQUENZER.undoInfo().n) === u0 + 1, 'chip 1/16 = one undo step');
const sp = 0.5, step = 0.25 * sp, t0 = W.t0;
const gq = t => t0 + Math.round((t - t0) / step) * step, inC = t => Math.abs(t - gq(t)) <= 0.4 * step + 1e-9;
let n26 = 0, e26 = 0, stay = 0;
W.map.src.slice(1, -1).forEach((s, k) => { const d = W.map.dst[k + 1]; if (inC(s)) { n26++; e26 = Math.max(e26, Math.abs(d - gq(s)) * sr); } else if (Math.abs(d - s) < 1e-6) stay++; else e26 = 999; });
ok(e26 <= 1, 'N7V-26 100 %: ' + n26 + ' marks on the grid, max ' + e26.toFixed(2) + ' samples; ' + stay + ' outside ±40 % unchanged');
const Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id), y = Float32Array.from(Y.data);
ok(!Y.raw && Y.n === raw.length, 'played = rendered slices');
// N7V-27: attack bit-identity (20 ms from the real onset), peak ±0.1 dB
const L20 = Math.round(0.02 * sr); let bit = 0, nb = 0, pkW = 0;
const shiftAt = t => { let b = 0, bd = 1e9; W.map.src.forEach((s, k) => { if (k && k < W.map.src.length - 1 && Math.abs(s - t) < bd) { bd = Math.abs(s - t); b = k; } }); return W.map.dst[b] - W.map.src[b]; };
const outOn = onsets20(y, sr);
const rows = [];
for (const q of pairs) {
  const sh = shiftAt(q.mk), O = Math.round(q.on * sr), D = O + Math.round(sh * sr) ; nb++;
  let same = true; for (let j = 0; j < L20; j++) if (y[D + j] !== raw[O + j]) { same = false; break; }
  if (same) bit++;
  let p0 = 0, p1 = 0; for (let j = 0; j < 0.1 * sr; j++) { p0 = Math.max(p0, Math.abs(raw[O + j] || 0)); p1 = Math.max(p1, Math.abs(y[D + j] || 0)); }
  pkW = Math.max(pkW, Math.abs(20 * Math.log10(p1 / p0)));
  const ro = q.on + sh, inside = inC(q.mk);
  let dmax = 0; for (let j = 0; j < Math.round(0.003 * sr); j++) dmax = Math.max(dmax, Math.abs(y[D + j] - raw[O + j]));
  let zc = 0; for (let j = 1; j < 0.01 * sr; j++) if ((raw[O + j] >= 0) !== (raw[O + j - 1] >= 0)) zc++;
  rows.push({ro, err: (ro - gq(ro)) * 1000, inside, kind: zc < 4 ? 'b' : zc < 60 ? 'k' : 't', same, dev3ms: +(20 * Math.log10(dmax / p0 + 1e-9)).toFixed(1), pk: +(20 * Math.log10(p1 / p0)).toFixed(3), on: +q.on.toFixed(4), mk: +q.mk.toFixed(4)});
}
console.log(JSON.stringify(rows.map(r => [r.kind, r.on, r.mk, +r.err.toFixed(2), r.same, r.dev3ms, r.pk, r.inside])));
ok(bit === nb, 'N7V-27 attacks bit-identical (20 ms from each real onset): ' + bit + '/' + nb);
ok(pkW <= 0.1, 'N7V-27 peak per event ±0.1 dB: worst ' + pkW.toFixed(3) + ' dB');
const errs = rows.filter(r => r.inside).map(r => r.err);
{ // alternative: the very first sample of the event (walk back from the 10 % point while the 0.2-ms window max stays > 0.003, max 6 ms)
  const first = (yy, t) => { let j = Math.round(t * sr); const lim = j - Math.round(0.006 * sr); while (j > lim) { let m = 0; for (let i = j - 10; i < j; i++) m = Math.max(m, Math.abs(yy[i])); if (m <= 0.003) break; j--; } return j / sr; };
  const e1 = rows.filter(r => r.inside).map(r => { const t = first(y, r.ro); return ((t - gq(t)) * 1000); });
  console.log('N7S-51 with the earliest-sample onset (ms):', e1.map(v => v.toFixed(2)).join(' '), '→ > 2.0 ms:', e1.filter(v => Math.abs(v) > 2.0).length + '/' + e1.length);
}
console.log('N7S-51 onset − grid line (ms, rendered, events inside ±40 %):', errs.map(v => v.toFixed(2)).join(' '));
ok(errs.length && errs.every(e => Math.abs(e) <= 2.0), 'N7S-51 onsets ±2 ms on the grid (beatbox kick/snare/hat): worst ' + Math.max(...errs.map(Math.abs)).toFixed(2) + ' ms');
// also with the independent finder on the rendered buffer
const outIn = outOn.filter(t => t >= c.audio.in - 0.01 && t <= c.audio.out).map(t => (t - gq(t)) * 1000);
console.log('rendered onsets (finder) − grid (ms):', outIn.map(v => v.toFixed(2)).join(' '));
// M-KLICK on rendered
const kk = mKlick(y, W.map.dst.slice(1, -1).map(t => t - 0.003)), k0 = mKlick(raw, W.map.src.slice(1, -1).map(t => t - 0.003));
ok(kk.worst <= Math.max(6, k0.worst + 1), 'M-KLICK rendered ' + JSON.stringify(kk) + ' (raw ' + JSON.stringify(k0) + ')');
// ---- the real output: play scene 3 and record (frame-exact worklet)
await p.evaluate(() => SYNQUENZER.closeAll && SYNQUENZER.closeAll());
await recStart(p);
await p.evaluate(() => SYNQUENZER.launchScene(2)); await sleep(5200);
const clk = await p.evaluate(() => SYNQUENZER.vsClock());
const R = await recStop(p); await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
const yo = Float32Array.from(R.y), oo = onsets20(yo, R.sr).map(t => t + R.f0 / R.sr);
const beats = oo.map(t => (t - clk.start) / clk.spb);
const gerr = beats.map(b => (b - Math.round(b / 0.25) * 0.25) * clk.spb * 1000);
console.log('output onsets', oo.length, 'grid error incl. latency (ms):', gerr.map(v => v.toFixed(1)).join(' '));
// intervals: output vs rendered (same events, first loop)
const rendIn = onsets20(y, sr).filter(t => t >= c.audio.in - 0.003 && t < c.audio.out);
const di = [], n = Math.min(rendIn.length, oo.length) - 1;
for (let k = 1; k <= n; k++) di.push(((oo[k] - oo[0]) - (rendIn[k] - rendIn[0])) * 1000);
console.log('output vs rendered interval deviation (ms):', di.map(v => v.toFixed(2)).join(' '));
ok(di.length >= 10 && di.every(v => Math.abs(v) < 0.5), 'the output plays the quantized version (interval deviation ≤ 0.5 ms over ' + di.length + ')');
const ko = mKlick(yo, oo.map(t => t - R.f0 / R.sr - 0.003));
ok(ko.worst <= k0.worst + 1, 'M-KLICK of the real output ' + JSON.stringify(ko) + ' vs raw ' + JSON.stringify(k0));
// 50 %
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: '1/16', strength: 0.5}), id);
const W5 = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp, y5 = Float32Array.from((await p.evaluate(id => SYNQUENZER.wpPlayed(id), id)).data);
const on5 = onsets20(y5, sr); let h5 = 0, nh = 0;
for (const q of pairs) { if (!inC(q.mk)) continue; const want = q.on + (gq(q.mk) - q.mk) / 2; let b = 1e9; for (const t of on5) b = Math.min(b, Math.abs(t - want)); h5 = Math.max(h5, b * 1000); nh++; }
ok(W5.strength === 0.5 && h5 <= 2, 'N7S-51 50 % = half way (±2 ms, real onsets): worst ' + h5.toFixed(2) + ' ms over ' + nh);
// undo ×2 → raw bit-identical, redo → previous render bit-identical
await p.evaluate(() => SYNQUENZER.undo()); await sleep(200);
const yr = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id); let same = !yr.raw && yr.n === y.length; if (same) for (let i = 0; i < y.length; i++) if (yr.data[i] !== y[i]) { same = false; break; }
ok(same, 'undo of 50 % → the 100 % render again, bit-identical');
await p.evaluate(() => SYNQUENZER.undo()); await sleep(200);
const y0 = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id); let s0 = y0.raw && y0.n === raw.length; if (s0) for (let i = 0; i < raw.length; i++) if (y0.data[i] !== raw[i]) { s0 = false; break; }
const I0 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
ok(s0 && !I0.warp && !I0.marks, 'undo of 1/16 → original bit-identical, take without marks/warp');
await p.evaluate(() => SYNQUENZER.redo()); await sleep(200);
const y1 = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id); let s1 = !y1.raw; if (s1) for (let i = 0; i < y.length; i++) if (y1.data[i] !== y[i]) { s1 = false; break; }
ok(s1, 'redo → the 1/16 render bit-identical');
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
