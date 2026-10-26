// QA MK3 live path: gestures on the panel reach the running worklet (pitch / level measured at the engine node)
import {launch, open, box, tap, drag, lcd, panel, undoN, mkg, leds, J, pickPop} from './v3-qa-mk3-lib.mjs';
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const b = await launch();
const {ctx, page, errs} = await open('L1');
await page.evaluate(async () => { ensureAudio(); await new Promise(q => setTimeout(q, 1500)); SYNQUENZER.keyOn(60); await new Promise(q => setTimeout(q, 200)); SYNQUENZER.keyOff(60); await new Promise(q => setTimeout(q, 300));
  const E = AU.synth[0]; const an = AU.ctx.createAnalyser(); an.fftSize = 32768; an.smoothingTimeConstant = 0; E.node.connect(an); window.__an = an; });
// peak frequency of the live output while a key is held
const pitch = (note) => page.evaluate(async n => { inputDown(n, 'qa', .9); await new Promise(q => setTimeout(q, 1000)); const an = window.__an, F = new Float32Array(an.frequencyBinCount); an.getFloatFrequencyData(F);
  const sr = AU.ctx.sampleRate, bin = sr / an.fftSize; let k0 = 1; for (let k = 2; k < F.length - 1; k++) if (F[k] > F[k0]) k0 = k; const a = F[k0 - 1], c = F[k0 + 1], m = F[k0], d = .5 * (a - c) / (a - 2 * m + c);
  let e = 0; const T = new Float32Array(an.fftSize); an.getFloatTimeDomainData(T); for (const x of T) e += x * x; inputUp('qa'); await new Promise(q => setTimeout(q, 300)); return {f: (k0 + d) * bin, db: 10 * Math.log10(e / T.length + 1e-30)}; }, note);
const ct = (f, n) => 1200 * Math.log2(f / (440 * 2 ** ((n - 69) / 12)));
await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.o1.w', 3); SYNQUENZER.mkSet(0, 't.1.o1.w', 3); MKUI.render(); });
const p0 = await pitch(64); ok('Live: Gleichstufig E4 ±3 ct', Math.abs(ct(p0.f, 64)) < 3, ct(p0.f, 64).toFixed(1) + ' ct, ' + p0.db.toFixed(1) + ' dB');
// STIMMUNG via panel list: Pelog (E = step 4 with key C: -130 ct)
await page.evaluate(() => MKUI.setWahl(2, 9)); await page.waitForTimeout(100); await tap(page, 'k0'); await pickPop(page, /^Pelog/); await page.waitForTimeout(300);
const p1 = await pitch(64); ok('Live: STIMMUNG Pelog per Liste → E4 −130 ct (±5)', Math.abs(ct(p1.f, 64) + 130) < 5, ct(p1.f, 64).toFixed(1) + ' ct');
// GRUNDTON drag to D (2): E = step 2 → -80 ct
await page.waitForTimeout(800); await page.evaluate(() => { SYNQUENZER.mkSet(0, 'skey', 0); MKUI.render(); });
await drag(page, 'k1', 40, 8); const sk = (await mkg(page)).skey; const W = [0, 0, -80, 0, -130, 40, 0, -30, 0, -115, 0, -150];
const p2 = await pitch(64); const want2 = W[((64 - sk) % 12 + 12) % 12]; ok('Live: GRUNDTON gezogen (skey ' + sk + ') → E4 bei W-43', Math.abs(ct(p2.f, 64) - want2) < 5 && sk > 0, ct(p2.f, 64).toFixed(1) + ' ct, Soll ' + want2);
// Eigene + EIGENE knob for E (key C)
await page.evaluate(() => { SYNQUENZER.mkSet(0, 'skey', 0); MKUI.render(); }); await tap(page, 'k0'); await pickPop(page, /^Eigene/); await page.waitForTimeout(800);
await tap(page, 'm2'); await page.waitForTimeout(300); await drag(page, 'u4', 60, 10); const us = (await mkg(page)).usc;
const p3 = await pitch(64); ok('Live: EIGENE Regler E → usc[4] wirkt im Klang', us && us[4] !== 0 && Math.abs(ct(p3.f, 64) - us[4]) < 5, 'usc[4] ' + (us && us[4]) + ', gemessen ' + ct(p3.f, 64).toFixed(1) + ' ct');
await tap(page, 'back');
// mode via panel: Schicht with T2 two octaves up (trans +24) -> the spectrum has both; Split 72 -> E4 only T1
await page.evaluate(() => { SYNQUENZER.mkSet(0, 'scale', 0); SYNQUENZER.mkSet(0, 't.1.trans', 24); MKUI.setWahl(1, 0); });
await page.waitForTimeout(800); await tap(page, 'k1'); await pickPop(page, /^Schicht/); await page.waitForTimeout(300);
const lv = (n) => page.evaluate(async n => { inputDown(n, 'qb', .9); await new Promise(q => setTimeout(q, 800)); const an = window.__an, F = new Float32Array(an.frequencyBinCount); an.getFloatFrequencyData(F);
  const sr = AU.ctx.sampleRate, bin = sr / an.fftSize, f0 = 440 * 2 ** ((n - 69) / 12), at = f => { const k = Math.round(f / bin); return Math.max(F[k - 2], F[k - 1], F[k], F[k + 1], F[k + 2]); }; const r = {t1: at(f0), t2: at(f0 * 4)}; inputUp('qb'); await new Promise(q => setTimeout(q, 300)); return r; }, n);
const s1 = await lv(64);
ok('Live: SCHICHT per Panel → T1 (E4) und T2 (E6) klingen', s1.t1 > -80 && s1.t2 > -80, J(s1));
await page.waitForTimeout(800); await tap(page, 'k1'); await pickPop(page, /^Split/); await page.waitForTimeout(300);
await page.evaluate(() => { MKUI.P.shift = 1; MKUI.render(); }); await page.waitForTimeout(100);
// SPLIT 60: E4 (64) -> T2 only
const s2 = await lv(64), s3 = await lv(55);
ok('Live: SPLIT (C4): E4 nur T2, G3 nur T1', s2.t2 - s2.t1 > 40 && s3.t1 - s3.t2 > 40, J({E4: s2, G3: s3}));
// STIMMEN knob drag (EB2) changes tv live: Schicht 1+3 with a 3-note chord: T1 mono only the last
console.log('errs', errs);
await ctx.close(); await b.close();
console.log(fails ? fails + ' FEHLER' : 'alles bestanden');
