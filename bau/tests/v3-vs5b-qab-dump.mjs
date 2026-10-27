// QA VS5a B: sung phrase via fake mic → Stimme-FANG (MELODIE + take) → quantize sheet [Anwenden] with „Audio folgt“ → notes and audio land together;
// M-EINBRUCH / M-KLICK at the cuts (fake-mic take); quantize WHILE PLAYING → real output around the switch (no drop-out, no click)
import {launch, open5, sleep, writeWav, micOn, waitBeat, idle, mKlick, mEinbruch, deq, recStart, recStop, QOUT} from './v3-qa-vs5a-h2.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
import fs from 'fs';
fs.mkdirSync(QOUT, {recursive: true});
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const SR0 = 48000;
const F = [220, 247, 262, 294, 330, 294, 262, 247], OFF = [14, -22, 31, -9, 26, -35, 18, -4, 24, -28, 11, -16, 33, -7, 20, -30];
const notes = []; for (let k = 0; k < 64; k++) notes.push({t: 0.25 + k * 0.25 + OFF[k % 16] / 1000, d: 0.235, f0: F[k % 8], vowel: 'aeiou'[k % 5], cons: k % 4 === 0});
const v = voice(SR0, 16.5, notes, {seed: 5}).x;
const wav = QOUT + '/b-sung.wav'; writeWav(wav, v, SR0);
const br = await launch(wav);
const H = await open5(br, {touch: true, mobile: true}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); }); await sleep(300);
await micOn(p);
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.selectSlot(0, 1); SYNQUENZER.play(); });
await waitBeat(p, 20.3);
ok(await p.evaluate(() => SYNQUENZER.vsFang({})), 'Stimme-FANG accepted');
await idle(p);
const r = await p.evaluate(() => SYNQUENZER.vsResult());
await p.evaluate(() => SYNQUENZER.vsResultOk && SYNQUENZER.vsResultOk());
await p.evaluate(() => SYNQUENZER.stop()); await p.evaluate(() => SYNQUENZER.stimmeStop('test')); await sleep(400);
const I = await p.evaluate(() => SYNQUENZER.tkInfo()), sc = r.scene;
const mel = await p.evaluate(s => SYNQUENZER.getClip(5, s), sc), stc = await p.evaluate(([t, s]) => SYNQUENZER.getClip(t, s), [I.stimme, sc]);
ok(mel && stc && stc.audio && mel.take === stc.audio.take, 'MELODIE + STIMME share the take ' + JSON.stringify(stc && stc.audio) + ' notes ' + (mel && mel.notes.length));
const id = stc.audio.take, tk = (await p.evaluate(() => SYNQUENZER.takes()))[id], sr = tk.sr, spb = 0.5;
await p.waitForFunction(id => SYNQUENZER.wpDetect(id), id, {timeout: 20000});
// quantize sheet by touch: 1/8, Audio folgt on (default), [Anwenden]
const P0 = await p.evaluate(() => SYNQUENZER.project()), u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
await p.evaluate(s => SYNQUENZER.openQuant(5, s), sc); await sleep(300);
const fol = await p.evaluate(() => { const b = document.querySelector('#qSheet .qfol'); return b ? {on: b.classList.contains('on'), sw: b.scrollWidth, cw: b.clientWidth, h: b.getBoundingClientRect().height} : null; });
ok(fol && fol.on, '[Audio folgt] in the quantize sheet, on by default ' + JSON.stringify(fol));
await (await p.$('#qSheet .qchips button[data-v="1/8"]')).tap(); await sleep(150);
await (await p.$('#qSheet .qact .go')).tap(); await sleep(300);
await p.waitForFunction(id => SYNQUENZER.wpInfo(id).warp && SYNQUENZER.wpInfo(id).ready, id, {timeout: 20000}).catch(() => {});
const U = await p.evaluate(() => SYNQUENZER.undoInfo()), W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp;
ok(U.n === u0 + 1 && U.top.kind === 'group' && W && W.res === '1/8', 'one undo with clip + take ' + JSON.stringify(U.top) + ' warp ' + (W && W.res + ' ' + W.strength));
const mel2 = await p.evaluate(s => SYNQUENZER.getClip(5, s), sc);
console.log('MELODIE before', JSON.stringify(mel.notes.slice(0, 6)), 'q', JSON.stringify(mel.q), 'len', mel.len, '| STIMME clip', JSON.stringify(stc.audio), 'len', stc.len, '| warp t0', W.t0, 'grid', W.grid, W.res);
console.log('MELODIE after', JSON.stringify(mel2.notes.slice(0, 6)), 'q', JSON.stringify(mel2.q));
// notes vs audio after quantize: each note start (beats) should have a quantized mark at the same beat
const dstB = W.map.dst.slice(1, -1).map(t => (t - W.t0) / spb), srcB = W.map.src.slice(1, -1).map(t => (t - W.t0) / spb);
const rows = mel.notes.map(o => { const n = mel2.notes.find(z => z.o === o.o && z.n === o.n) || {t: NaN}; let b = null; const ot = o.o != null ? o.o : o.t; for (let j = 0; j < srcB.length; j++) if (!b || Math.abs(srcB[j] - ot) < Math.abs(b.s - ot)) b = {s: srcB[j], d: dstB[j]}; return {nb: o.o != null ? o.o : o.t, na: n.t, ms: b ? +(Math.abs(b.d - n.t) * spb * 1000).toFixed(1) : null, src: b && +b.s.toFixed(3), dst: b && +b.d.toFixed(3)}; });
console.log('note before → after | nearest mark src → dst | |note − audio| ms'); rows.forEach(x => console.log(' ', x.nb.toFixed(3), '→', x.na.toFixed(3), '|', x.src, '→', x.dst, '|', x.ms));
const bad = rows.filter(x => x.ms > 5);
ok(rows.length >= 6 && bad.length === 0, 'Audio folgt: notes and singing land together (≤ 5 ms) – ' + (rows.length - bad.length) + '/' + rows.length);
// cuts: M-EINBRUCH / M-KLICK in the rendered take vs raw
const raw = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), id)), y = Float32Array.from((await p.evaluate(id => SYNQUENZER.wpPlayed(id), id)).data);
const mv = W.map.src.slice(1, -1).map((s, k) => ({s, d: W.map.dst[k + 1]})).filter(o => Math.abs(o.d - o.s) > 1e-4 && o.d > 0.06 && o.d < raw.length / sr - 0.06);
const eb = mv.map(o => +(mEinbruch(y, o.d - 0.003, sr) - mEinbruch(raw, o.s - 0.003, sr)).toFixed(2));
console.log('M-EINBRUCH extra dip vs original at the same note (dB):', eb.join(' '));
ok(eb.every(e => e >= -3), 'M-EINBRUCH: no cut adds > 3 dB of dip: worst ' + Math.min(...eb));
fs.writeFileSync(QOUT + '/b-dump.json', JSON.stringify({sr, map: W.map, mode: W.mode, raw: Array.from(raw), y: Array.from(y)}));
const kk = mKlick(y, W.map.dst.slice(1, -1), sr), k0 = mKlick(raw, W.map.src.slice(1, -1), sr);
ok(kk.worst <= Math.max(6, k0.worst + 1), 'M-KLICK rendered ' + JSON.stringify(kk) + ' raw ' + JSON.stringify(k0));
// undo → deep-equal (notes + take)
await p.evaluate(() => SYNQUENZER.undo()); await sleep(300);
ok(deq(await p.evaluate(() => SYNQUENZER.project()), P0), '↶ → notes and take deep-equal');
// ---- quantize while playing: only the STIMME clip sounds (MELODIE removed), switch at a known moment
await p.evaluate(s => SYNQUENZER.setClip(5, s, null), sc);
await recStart(p);
await p.evaluate(s => SYNQUENZER.launchScene(s), sc); await sleep(2600);
const tSw = await p.evaluate(async id => { const t = window.__ctx.currentTime; await SYNQUENZER.wpQuantize(id, {grid: '1/16', strength: 1}); return t; }, id);
await sleep(2500);
const clk = await p.evaluate(() => SYNQUENZER.vsClock());
const R = await recStop(p); await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
const yo = Float32Array.from(R.y), osr = R.sr, f0 = R.f0;
const tReady = await p.evaluate(id => SYNQUENZER.wpInfo(id).last, id);
// level in 5-ms windows (1-ms hop) from tSw - 50 ms to tSw + 400 ms; compare with the median level of the 400 ms before
const lv = c => { const W5 = Math.round(0.005 * osr); let s = 0; for (let i = c; i < c + W5; i++) s += (yo[i] || 0) ** 2; return 10 * Math.log10(s / W5 + 1e-14); };
const i0 = Math.round(tSw * osr) - f0;
const ref = []; for (let d = -400; d < -10; d += 1) ref.push(lv(i0 + Math.round(d * osr / 1000))); ref.sort((a, b) => a - b);
const med = ref[ref.length >> 1], q10 = ref[Math.floor(ref.length * 0.05)];
let worst = 0, at = 0; for (let d = -10; d <= 400; d += 1) { const vv = lv(i0 + Math.round(d * osr / 1000)) - q10; if (vv < worst) { worst = vv; at = d; } }
console.log('switch at ctx', tSw.toFixed(3), 'render', JSON.stringify(tReady), '; level median', med.toFixed(1), 'dB, 5 % quantile', q10.toFixed(1), '; worst dip after the switch vs 5 % quantile', worst.toFixed(1), 'dB at +', at, 'ms');
ok(worst >= -6, 'quantize while playing: no drop-out at the switch (worst ' + worst.toFixed(1) + ' dB below the 5 % quantile of the 400 ms before)');
const ks = mKlick(yo.subarray(Math.max(0, i0 - Math.round(0.4 * osr)), i0 + Math.round(0.6 * osr)), [], osr);
const kref = mKlick(yo.subarray(Math.max(0, i0 - Math.round(1.4 * osr)), i0 - Math.round(0.4 * osr)), [], osr);
ok(ks.worst <= kref.worst + 3, 'quantize while playing: M-KLICK around the switch ' + JSON.stringify(ks) + ' vs before ' + JSON.stringify(kref));
fs.writeFileSync(QOUT + '/b-switch.json', JSON.stringify({osr, f0, tSw, y: Array.from(yo)}));
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
