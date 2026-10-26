// MK-P-03 (E1/E2 levels): a synth track as the source of E1 and E2 (as in MK7), the level at the worklet input (mkLv peaks) for
// the E1/E2 level 64, 100 and 127; MK-P-10: not stored (soundHash, project JSON unchanged), factor exactly 1 at 100.
import {launch, open} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'L1'); const fail = [], R = {};
const ok = (id, c, info) => { if (!c) fail.push(id + ': ' + info); };
await page.evaluate(() => { ensureAudio(); const Q = SYNQUENZER; Q.mkIn(0, 'e1', 1); Q.mkIn(0, 'e2', 1); });
await page.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000}); await page.waitForTimeout(500);
R.ledVorher = await page.evaluate(() => !!(AU.synth[0] && AU.synth[0].mkLedOn)); await page.evaluate(() => { const E = AU.synth[0]; E.mkLedOn = false; E.mkLed(true); });   // the panel was built before the audio start (MK7 einOn)
const h0 = await page.evaluate(() => [SQStore.soundHash(S.tracks[0].sound), JSON.stringify(S.tracks.map(t => t.mkIn || null))]);
const meas = (v1, v2) => page.evaluate(async ([v1, v2]) => {
  MKUI.setv(MKUI.KN.trim1, v1); MKUI.setv(MKUI.KN.trim2, v2); await new Promise(r => setTimeout(r, 200)); const H = auditionStart(1, 45, .9); await new Promise(r => setTimeout(r, 60));
  const E = AU.synth[0], pk = [[], []]; let n = E.mkLvN; const t0 = performance.now();
  await new Promise(res => { const f = () => { if (E.mkLvN !== n) { n = E.mkLvN; pk[0].push(E.mkLv.i[0]); pk[1].push(E.mkLv.i[1]); } if (performance.now() - t0 < 500) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }); H.release(nowT()); await new Promise(r => setTimeout(r, 400));
  const rat = pk[0].map((x, k) => [x, pk[1][k]]).filter(([x, y]) => x > 1e-5 && y > 1e-5).map(([x, y]) => 20 * Math.log10(x / y));
  const avg = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  const A = AU.tracks[0].mkL; return {e1: avg(pk[0]), e2: avg(pk[1]), n: pk[0].length, dE1E2: rat.length ? +avg(rat).toFixed(2) : null, nR: rat.length, g: A && A.t ? A.t.map(g => g.gain.value) : null};
}, [v1, v2]);
for (const [a, c] of [[100, 100], [64, 127], [127, 64], [0, 100], [100, 100]]) R[a + '/' + c] = await meas(a, c);
const db = (x, y) => 20 * Math.log10(x / y);
const d1 = R['127/64'].dE1E2, d2 = -R['64/127'].dE1E2;   // the same window: E1 and E2 carry the same source
R.dB = {e1_127_vs_64: +d1.toFixed(2), e2_127_vs_64: +d2.toFixed(2), e1_0: R['0/100'].e1, e1_minus_e2_bei_100: R['100/100'].dE1E2};
ok('MK-P-03', d1 >= 6 && d2 >= 6, 'E1/E2 64 → 127 ' + d1.toFixed(2) + ' / ' + d2.toFixed(2) + ' dB');
ok('MK-P-03', R['0/100'].e1 < 1e-6 && R['0/100'].e2 > 1e-4, 'E1 0 = stumm ' + R['0/100'].e1 + ' / E2 ' + R['0/100'].e2);
ok('MK-P-03', Math.abs(R['100/100'].dE1E2) < .01, 'bei 100/100 gleich ' + R['100/100'].dE1E2);
ok('MK-P-10', R['100/100'].g && R['100/100'].g.every(g => g === 1), 'Faktor bei 100 genau 1 ' + JSON.stringify(R['100/100'].g));
const h1 = await page.evaluate(() => [SQStore.soundHash(S.tracks[0].sound), JSON.stringify(S.tracks.map(t => t.mkIn || null))]);
ok('MK-P-10', h0[0] === h1[0] && h0[1] === h1[1], 'E1/E2-Pegel nicht gespeichert ' + JSON.stringify([h0, h1]));
const saved = await page.evaluate(() => { try { const t = serializeProject(); return /mkInTrim|trim1|"e1":(64|127)/.test(t); } catch (e) { return 'err ' + e; } });
ok('MK-P-10', saved === false, 'Projekt enthält keinen Pegel ' + saved);
ok('konsole', !page.errs.length, page.errs.join(' | '));
console.log(JSON.stringify(R, null, 1)); console.log('FEHLER', fail.length, JSON.stringify(fail, null, 1));
await b.close();
