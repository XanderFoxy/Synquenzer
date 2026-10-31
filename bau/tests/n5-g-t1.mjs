// G1-01 / G1-03 (+ Ursachen vorher/nachher): gesungene Silben ±60 ms neben dem 1/8-Raster → Quantisieren wie Xander (Editor-Tipp,
// Regler, Audio folgt, Song) → Ausgang mitgeschnitten, Einsätze gemessen (Kreuzkorrelation je Silbe am Ausgang).
// G_APP=<datei> misst eine andere Fassung (z. B. vs-base-B.html = vorher). Ausgabe: Zeilen ✓/✗ und Zahlen.
import {launch, openG, sleep, toI16, recStart, recStop, sylOnsets, heardShifts, mKlick, SR, deq, APPG} from './n5-g-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
const BASE = /vs-base-B/.test(APPG);
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const OFF = [0, 60, -60, 45, -50, 60, -60, 0, 55, -45, 60, -60, 30, -30];
const notes = OFF.map((o, k) => ({t: 0.5 + k * 0.25 + o / 1000, d: 0.11, f0: [220, 247, 262, 294][k % 4], vowel: 'aeiou'[k % 5], cons: k % 2 === 1}));
const x = voice(SR, 4, notes, {seed: 3}).x, rawOn = sylOnsets(x, SR);
const br = await launch(null);
const H = await openG(br), p = H.p;
console.log('App', await p.evaluate(() => SYNQUENZER.version));
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
await p.evaluate(() => SYNQUENZER.play()); await sleep(300); await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x));
const id = r1.id, R = {t: r1.track, s: 1};
async function heard(how = 'scene') {
  await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
  await recStart(p);
  if (how === 'scene') await p.evaluate(() => { SYNQUENZER.launchScene(1); SYNQUENZER.play(); }); else await p.evaluate(() => SYNQUENZER.songPlay(0));
  await sleep(4300); await p.evaluate(() => SYNQUENZER.stop());
  const r = await recStop(p), y = Float32Array.from(r.y), on = sylOnsets(y, r.sr);
  const hs = heardShifts(x, rawOn, y, r.sr, on[0]);
  return {grid: hs.map((h, k) => OFF[k] + h.ms), rho: Math.min(...hs.map(h => h.rho)), y, sr: r.sr, on};
}
const fmt = a => a.map(v => v.toFixed(1)).join(' ');
const maxErr = (g, f) => Math.max(...g.map((v, k) => Math.abs(v - f(k))));
const h0 = await heard();
console.log('  Original, gehört gegen das Raster (ms):', fmt(h0.grid));
ok(maxErr(h0.grid, k => OFF[k]) <= 3, 'Messung: Original gehört wie gesungen (±3 ms): max ' + maxErr(h0.grid, k => OFF[k]).toFixed(1) + ' ms, ρ ≥ ' + h0.rho.toFixed(2));
// 1) wie Xander: Marken-Editor öffnen, Chip 1/8 tippen (Standard)
await p.evaluate(R => SYNQUENZER.wpOpen(R), R); await sleep(400); await p.evaluate(id => SYNQUENZER.wpDetect(id), id); await sleep(200);
await p.click('#wpSheet .wpchips button[data-v="1/8"]'); await sleep(900);
const I1 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id), W1 = I1.warp;
const before = I1; // for undo
const h1 = await heard();
console.log('  Editor [1/8] → ' + W1.mode + ' ' + Math.round(W1.strength * 100) + ' %; gehört (ms):', fmt(h1.grid));
ok(W1.strength === 1 && maxErr(h1.grid, () => 0) <= 5, 'G1-01 Editor-Tipp 1/8 (Standard ' + Math.round(W1.strength * 100) + ' %): alle 14 Einsätze ±5 ms auf dem Raster – max ' + maxErr(h1.grid, () => 0).toFixed(1) + ' ms');
// 2) Stärke 50 % (Regler im Editor, loslassen)
await p.evaluate(() => { const i = document.querySelectorAll('#wpSheet .qrow input[type=range]')[0]; i.value = 50; i.dispatchEvent(new Event('input')); i.dispatchEvent(new Event('change')); }); await sleep(900);
const W2 = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp, h2 = await heard();
console.log('  Stärke 50 % → gehört (ms):', fmt(h2.grid));
ok(W2.strength === 0.5 && maxErr(h2.grid, k => OFF[k] / 2) <= 5, 'G1-01 Stärke 50 %: halber Abstand ±5 ms – max ' + maxErr(h2.grid, k => OFF[k] / 2).toFixed(1) + ' ms');
// 3) Scheiben 100 %
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: '1/8', strength: 1, mode: 'slice'}), id); await sleep(300);
const h3 = await heard();
ok(maxErr(h3.grid, () => 0) <= 5, 'G1-01 Scheiben 100 %: ±5 ms – max ' + maxErr(h3.grid, () => 0).toFixed(1) + ' ms');
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: '1/8', strength: 0.5, mode: 'slice'}), id); await sleep(300);
const h3b = await heard();
ok(maxErr(h3b.grid, k => OFF[k] / 2) <= 5, 'G1-01 Scheiben 50 %: halber Abstand ±5 ms – max ' + maxErr(h3b.grid, k => OFF[k] / 2).toFixed(1) + ' ms');
// 4) Song (dieselbe Fassung im Song)
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: '1/8', strength: 1, mode: 'stretch'}), id); await sleep(300);
await p.evaluate(() => SYNQUENZER.songFromChain([{scene: 1, bars: 2}]));
const h4 = await heard('song');
ok(maxErr(h4.grid, () => 0) <= 5, 'G1-01 im Song (Dehnen 100 %): ±5 ms – max ' + maxErr(h4.grid, () => 0).toFixed(1) + ' ms');
// 5) Undo-Kette bis vor das erste Quantisieren: Marken/Karte deep-equal, Klang bitgleich (Roh-Take)
await p.evaluate(() => SYNQUENZER.wpClose());
const qInfo = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
const pre0 = await p.evaluate(() => SYNQUENZER.undoInfo ? SYNQUENZER.undoInfo() : null);
let n = 0; for (; n < 12; n++) { const w = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp; if (!w) break; await p.evaluate(() => SYNQUENZER.undo()); await sleep(150); }
const U = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
const pl = await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 192000), id), raw = await p.evaluate(() => null);
const rawB = await p.evaluate(id => SYNQUENZER.tkBufRange(id, 0, 192000), id);
ok(!U.warp && !U.marks && pl.raw && pl.data.length === rawB.length && pl.data.every((v, i) => v === rawB[i]), 'G1-03 ↶ (' + n + ' Schritte, ohne Song-Schritt) → keine Karte, keine gespeicherten Marken, Klang = Roh-Take bitgleich (' + pl.data.length + ' Samples)');
// ↷ bis zur Editor-Quantisierung: Marken + Karte deep-equal zum Zustand nach dem Tipp
await p.evaluate(() => SYNQUENZER.redo()); await sleep(400);
const Rd = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
ok(deq(Rd.warp, W1) && deq(Rd.marks, I1.marks), 'G1-03 ↷ → Marken und Karte deep-equal zum Zustand nach dem Tipp');
// Klang nach ↷ = Render der Karte (gehört wie in 1)
const h5 = await heard('scene');
ok(maxErr(h5.grid, () => 0) <= 5, 'G1-03 nach ↷ gehört wieder auf dem Raster: max ' + maxErr(h5.grid, () => 0).toFixed(1) + ' ms');
// Knacken an den Schnitten: gerenderte Fassung (48 kHz) M-KLICK gegen das Original, Ausnahmen nur an den Einsätzen
const PL = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id), Y = Float32Array.from(PL.data);
const dst = Rd.warp.map.dst.slice(1, -1), src = Rd.warp.map.src.slice(1, -1);
const kq = mKlick(Y, dst.map(t => t - 0.004)), ko = mKlick(x, src.map(t => t - 0.004));
ok(kq.worst <= ko.worst + 1, 'G1-03 kein Knacken an den Schnitten (Dehnen 100 %): M-KLICK ' + kq.worst + ' dB (Original ' + ko.worst + ' dB)');
const ksl = await (async () => { await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: '1/8', strength: 1, mode: 'slice'}), id); const q = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id); const w = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp; return mKlick(Float32Array.from(q.data), w.map.dst.slice(1, -1).map(t => t - 0.004)); })();
ok(ksl.worst <= ko.worst + 1, 'G1-03 kein Knacken (Scheiben 100 %): M-KLICK ' + ksl.worst + ' dB (Original ' + ko.worst + ' dB)');
// Ausgang mitgeschnitten (Dehnen): M-KLICK gegen Original-Ausgang
const kh = mKlick(h5.y, h5.on), k0 = mKlick(h0.y, h0.on);
ok(kh.worst <= k0.worst + 1.5, 'G1-03 Ausgang (Dehnen, mitgeschnitten): M-KLICK ' + kh.worst + ' dB gegen Original-Ausgang ' + k0.worst + ' dB');
// 6) Ursache Fangfenster: Audio folgt mit 1/16 (das Raster, das der MELODIE-Clip nach dem Einsingen meist hat)
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: 'off'}), id);
const mel = OFF.map((o, k) => ({t: +((0.5 + k * 0.25 + o / 1000) * 2).toFixed(4), d: 0.2, n: 60 + (k % 4), v: 0.8}));
await p.evaluate(([id, mel]) => SYNQUENZER.setClip(5, 1, {len: 2, notes: mel, take: id}), [id, mel]);
await p.evaluate(() => SYNQUENZER.quantizeClip(5, 1, {grid: '1/16'})); await sleep(700);
const W6 = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp;
await p.evaluate(() => SYNQUENZER.setClip(5, 1, null)); await p.evaluate(() => SYNQUENZER.songDelete());
const h6 = await heard();
const stay = h6.grid.filter(v => Math.abs(v) > 5).length;
console.log('  Audio folgt 1/16 → ' + (W6 && W6.mode) + ' ' + (W6 && W6.strength) + '; gehört (ms):', fmt(h6.grid));
ok(maxErr(h6.grid, () => 0) <= 5, 'Ursache Fangfenster: Audio folgt 1/16, Einsätze 45–60 ms neben der Linie → ' + (14 - stay) + '/14 auf dem Raster ±5 ms (max ' + maxErr(h6.grid, () => 0).toFixed(1) + ' ms)');
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
