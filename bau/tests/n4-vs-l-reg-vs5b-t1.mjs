// VS5b T1: Dehnen in the app – N7V-28 (20 ms bitgleich, slice length ±1 ms), N7V-29 (shift + warning), C.5 Nr. 8 (0 %, A/B, undo),
// mode switch (one undo, default strength), render cache, save/load roundtrip with lyrics, audible difference, no console errors
import {launch, open5, sleep, toI16, deq, SR, clickTone, findBlock, rmsDbR, mKlick} from './n4-vs-l-reg-vs5b-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const H = await open5(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const U = () => p.evaluate(() => SYNQUENZER.undoInfo().n);
// ---------- N7V-28 ----------
const OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9];
const T = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), LEN = 4.6;
const x = clickTone(T, LEN);
const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 3}), toI16(x));
const id = r.id, ref = {t: r.track, s: 0};
const det = await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
const err = T.map(t => { let b = 1e9; for (const m of det) b = Math.min(b, Math.abs(m.t - t)); return b * 1000; });
ok(det.length === T.length + 1 && Math.max(...err) < 3, 'clicks over a tone found (+1 mark = tone start): ' + det.length + '/' + T.length + ', max err ' + Math.max(...err).toFixed(2) + ' ms');
const raw = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), id));
const u0 = await U();
const g = await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/8', strength: 0.7, mode: 'stretch'}), ref);
let I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
ok(g === '1/8' && I.warp.mode === 'stretch' && I.warp.strength === 0.7 && await U() === u0 + 1, 'quantized 1/8 · Dehnen · 70 % · one undo');
let Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id);
I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
const eN = Math.round(I.warp.map.dst[I.warp.map.dst.length - 2] * SR) - Math.round(I.warp.map.src[I.warp.map.src.length - 2] * SR);
ok(Y && !Y.raw && Y.n === raw.length + eN && I.last.mode === 'stretch' && I.last.how === 'worker', 'played = stretched version from the worker, tail only shifted (length ' + Y.n + ' = ' + raw.length + ' + ' + eN + '): ' + JSON.stringify(I.last));
let y = Float32Array.from(Y.data);
function n728(y, w, label) {
  const src = w.map.src.slice(1, -1), dst = w.map.dst.slice(1, -1), L20 = Math.round(0.02 * SR);
  let bit = 0; const pos = [];
  src.forEach((s, k) => {
    const S0 = Math.round(s * SR), D0 = Math.round(dst[k] * SR);
    let same = true; for (let j = 0; j < L20; j++) if (y[D0 + j] !== raw[S0 + j]) { same = false; break; }
    if (same) bit++;
    pos.push(findBlock(y, raw, S0, D0, L20));
  });
  ok(bit === src.length, 'N7V-28 ' + label + ': first 20 ms after each mark bit-identical ' + bit + '/' + src.length);
  let worst = 0; for (let k = 1; k < pos.length; k++) { const want = Math.round(dst[k] * SR) - Math.round(dst[k - 1] * SR); worst = Math.max(worst, Math.abs((pos[k] - pos[k - 1]) - want)); }
  ok(pos.every(v => v >= 0) && worst <= SR * 0.001, 'N7V-28 ' + label + ': length per slice ±1 ms (found independently): worst ' + (worst / SR * 1000).toFixed(3) + ' ms');
  const ratios = src.slice(1).map((s, k) => (dst[k + 1] - dst[k]) / (s - src[k]));
  return {ratios};
}
const R70 = n728(y, I.warp, '70 %');
console.log('  factors 70 %:', Math.min(...R70.ratios).toFixed(3), '…', Math.max(...R70.ratios).toFixed(3));
ok(!I.warn, 'no warning inside 0.5–2.0');
// 100 %
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/8', strength: 1}), ref);
I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id); y = Float32Array.from(Y.data);
n728(y, I.warp, '100 %');
const tg = I.warp.map.dst.slice(1, -1);
const ATT = tg.map(t => t);
const k1 = mKlick(y, ATT), k0 = mKlick(raw, T);
ok(k1.worst <= Math.max(6, k0.worst + 1), 'M-KLICK stretched ≤ +6 dB (or ≤ raw + 1): ' + JSON.stringify(k1) + ' raw ' + JSON.stringify(k0));
// level in the tone between clicks: no hole (2-period RMS ≥ −3 dB vs. raw tone level)
{ const P2 = Math.round(2 * SR / 196), ref0 = rmsDbR(raw, Math.round(0.35 * SR), Math.round(0.45 * SR)); let dip = 0, at = 0;
  for (let s = Math.round(0.6 * SR); s + P2 < Math.round(4.3 * SR); s += P2 >> 2) { const v = rmsDbR(y, s, s + P2) - ref0; if (v < dip) { dip = v; at = s / SR; } }
  ok(dip >= -3, 'tone level between clicks (M-EINBRUCH ≤ 3 dB): worst ' + dip.toFixed(2) + ' dB at ' + at.toFixed(3) + ' s'); }
// ---------- mode switch (one undo, default strength), audible difference, render cache ----------
const yStretch = y, u1 = await U();
await p.evaluate(r => SYNQUENZER.wpMode(r, 'slice'), ref);
I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
ok(I.warp.mode === 'slice' && I.warp.strength === 1 && await U() === u1 + 1, 'mode → Scheiben: one undo, strength stays 100 % (user value, not the Dehnen default)');
Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id); const ySl = Float32Array.from(Y.data);
let dE = 0, eE = 0; for (let i = 0; i < Math.min(ySl.length, yStretch.length); i++) { const d = ySl[i] - yStretch[i]; dE += d * d; eE += ySl[i] * ySl[i]; }
ok(10 * Math.log10(dE / eE) > -40, 'audible: Scheiben vs. Dehnen differ by ' + (10 * Math.log10(dE / eE)).toFixed(1) + ' dB (difference energy)');
await p.evaluate(() => SYNQUENZER.undo()); I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
ok(I.warp.mode === 'stretch', '↶ → Dehnen again');
// default strength: from 100 (Scheiben default) a fresh quantize with 1.0 slice then mode stretch → 70 %
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/8', strength: 1, mode: 'slice'}), ref);
await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
await p.evaluate(r => SYNQUENZER.wpMode(r, 'stretch'), ref);
I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
ok(I.warp.mode === 'stretch' && I.warp.strength === 0.7, 'Scheiben 100 % (default) → Dehnen: strength becomes the Dehnen default 70 %');
// ---------- C.5 Nr. 8 ----------
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/8', strength: 0}), ref);
Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id);
ok(Y.raw, 'Dehnen, strength 0 % → original bit-identical (raw take)');
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/8', strength: 0.7}), ref);
await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
await p.evaluate(() => SYNQUENZER.wpAB(true)); Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
ok(Y.raw, 'A/B → original'); await p.evaluate(() => SYNQUENZER.wpAB(false));
const P0 = JSON.parse(JSON.stringify(await p.evaluate(() => SYNQUENZER.project())));
// undo everything back to before the first quantize → bit-identical original
while (await U() > u0) await p.evaluate(() => SYNQUENZER.undo());
I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id); Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 10), id);
ok(!I.warp && Y.raw, 'after ↶ the original is bit-identical (no map, raw take)');
let n = 0; while (n++ < 40 && (await p.evaluate(() => SYNQUENZER.undoInfo().redo)) > 0) await p.evaluate(() => SYNQUENZER.redo());
ok(deq(await p.evaluate(() => SYNQUENZER.project()), P0), '↷ all → project deep-equal to before');
// render cache: in the editor, Dehnen → Scheiben → Dehnen renders only twice
await p.evaluate(r => SYNQUENZER.wpOpen(r), ref); await sleep(200);
await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
const rc0 = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).renders;
await p.evaluate(r => SYNQUENZER.wpMode(r, 'slice'), ref); await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
await p.evaluate(r => SYNQUENZER.wpMode(r, 'stretch'), ref);
const instant = await p.evaluate(id => SYNQUENZER.wpInfo(id).ready, id);
const rc1 = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).renders;
ok(instant && rc1 === rc0 + 1, 'render cache: back to Dehnen is ready at once (renders ' + rc0 + ' → ' + rc1 + ')');
await p.evaluate(() => SYNQUENZER.wpClose());
ok(!(await p.evaluate(id => SYNQUENZER.wpInfo(id).old, id)), 'closing the editor drops the previous version (memory)');
// ---------- N7V-29: factor > 2 → only shifted + warning ----------
const T2 = [0.55, 0.67, 0.95, 1.27, 1.52, 1.74];   // 1/8 = 0.25 s: 0.55→0.5, 0.67→0.75 (factor 2.08), …
const x2 = clickTone(T2, 2.6, {toneFrom: 0.2});
const r2 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x2));
const det2 = await p.evaluate(id => SYNQUENZER.wpDetect(id), r2.id);
// keep exactly the 6 click marks (others: tone start, decays) – deleting by hand like in the editor
for (let k = det2.length - 1; k >= 0; k--) if (!T2.some(t => Math.abs(t - det2[k].t) < 0.005)) await p.evaluate(([id, k]) => SYNQUENZER.wpMark(id, 'del', k), [r2.id, k]);
const mk2 = (await p.evaluate(id => SYNQUENZER.wpInfo(id), r2.id)).marks;
ok(mk2.length === T2.length, 'warning take: ' + det2.length + ' found, ' + mk2.length + ' click marks kept');
await p.evaluate(r => SYNQUENZER.wpQuantize({t: r.track, s: 1}, {grid: '1/8', strength: 1, mode: 'stretch', t0: 0}), r2);
const raw2 = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), r2.id));
const Y2 = await p.evaluate(id => SYNQUENZER.wpPlayed(id), r2.id), y2 = Float32Array.from(Y2.data);
const I2 = await p.evaluate(id => SYNQUENZER.wpInfo(id), r2.id);
const W2 = I2.warp.map, fac = W2.src.slice(1, -1).map((s, k, a) => k ? (W2.dst[k + 1] - W2.dst[k]) / (s - a[k - 1]) : null).slice(1);
console.log('  factors:', fac.map(f => f.toFixed(2)).join(' '), 'warn', JSON.stringify(I2.warn));
const bad = fac.map((f, k) => (f < 0.5 || f > 2 ? k : -1)).filter(k => k >= 0);
ok(bad.length >= 1 && I2.warn && I2.warn.length >= bad.length, 'N7V-29 factor outside 0.5–2.0: warning (' + (I2.warn && I2.warn.length) + ' for ' + bad.length + ' segment(s))');
{ const k = bad[0], s0 = W2.src[k + 1], d0 = W2.dst[k + 1], s1 = W2.src[k + 2], LS = Math.round(0.004 * SR), S0 = Math.round(s0 * SR) - LS, D0 = Math.round(d0 * SR) - LS, Ln = Math.round(s1 * SR) - Math.round(s0 * SR);   // app: segments start WP_LEAD before the mark
  let same = true; for (let j = 0; j < Ln; j++) if (y2[D0 + j] !== raw2[S0 + j]) { same = false; break; }
  ok(same, 'N7V-29 the out-of-range segment is only shifted (whole segment bit-identical, ' + (Ln / SR * 1000).toFixed(0) + ' ms)');
  const g0 = D0 + Ln + 1, g1 = Math.round(W2.dst[k + 2] * SR) - Math.round(0.006 * SR), lt = rmsDbR(raw2, S0 + Math.round(0.04 * SR), S0 + Ln), lg = rmsDbR(y2, g0, g1);
  ok(lg - lt > -3, 'gap after the shifted segment is filled (loop), level ' + (lg - lt).toFixed(2) + ' dB vs. the tone'); }
const toasts = await p.evaluate(() => [...document.querySelectorAll('.toast, #toast, .tst')].map(e => e.textContent).join(' | '));
ok(/nur verschoben/.test(toasts), 'toast warns: ' + toasts.slice(0, 120));
await p.evaluate(r => SYNQUENZER.wpOpen({t: r.track, s: 1}), r2); await sleep(300);
const info = await p.evaluate(() => document.querySelector('#wpSheet .wpinfo').textContent);
ok(/nur verschoben/.test(info), 'editor info line warns: ' + info);
await p.evaluate(() => SYNQUENZER.wpClose());
// ---------- lyrics data + save/load roundtrip ----------
const u3 = await U();
ok(await p.evaluate(id => SYNQUENZER.wpLyrics(id, '  Lie-be ist  ein Feu-er '), r2.id) && await U() === u3 + 1, 'lyrics set: one undo');
const L6 = await p.evaluate(id => SYNQUENZER.wpLyr(id), r2.id);
ok(L6.labels.join(' ') === 'Lie be ist ein Feu er' && !L6.extra.length, 'N7V-30 6 marks: one syllable per mark ' + JSON.stringify(L6));
ok(await p.evaluate(id => SYNQUENZER.wpLyrics(id), r2.id) === 'Lie-be ist ein Feu-er', 'stored normalized');
const J = await p.evaluate(() => JSON.stringify(SYNQUENZER.project()));
await p.evaluate(() => SYNQUENZER.importJSON(SYNQUENZER.serialize()));
await sleep(400);
const J2 = await p.evaluate(() => JSON.stringify(SYNQUENZER.project()));
ok(deq(JSON.parse(J), JSON.parse(J2)), 'save → load deep-equal (lyrics, mode stretch, map)');
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
const nw = H.reqs.filter(r => !/^(blob|data|file):/.test(r.u)); ok(!nw.length, 'no network requests (' + nw.length + ')');
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
