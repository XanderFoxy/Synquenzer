// D1: while the clip plays, the step grid's playhead of the selected pad shows the lane's own step (12 steps, rückwärts)
import {app, report} from './touch-lib.mjs';
const A = await app({width: 390, height: 844}), {p} = A, res = [];
await p.mouse.click(200, 300); await p.waitForTimeout(200);
await p.evaluate(() => { const S = window.SYNQUENZER; S.setBpm(60); S.setClip(4, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: .1, n: 42, v: .8}], lanes: {42: {len: 12, dir: 'rev'}}}); S.openRoll(4, 0); });
await p.waitForTimeout(400); await p.evaluate(() => { ED.dVoice = DRUM_VOICES.findIndex(v => v.gm === 42); safeRebuild(buildDrumEd); S_ = 0; }); await p.waitForTimeout(200);
await p.evaluate(() => { window.SYNQUENZER.launchClip(4, 0); window.SYNQUENZER.play(); });
const samples = [];
for (let k = 0; k < 24; k++) { await p.waitForTimeout(130); samples.push(await p.evaluate(() => { const bAud = t2b(AU.ctx.currentTime - (AU.outLat || 0)); const g = Math.floor((bAud - audCstart(DRUM_T, bAud)) / .25 + 1e-6); return [ED.lastStep, 11 - (((g % 12) + 12) % 12), g]; })); }
await p.evaluate(() => window.SYNQUENZER.stop());
const ok = samples.filter(s => s[2] >= 0 && Math.abs(s[0] - s[1]) <= 1 || (s[0] === 11 && s[1] === 0) || (s[0] === 0 && s[1] === 11)).length;
const bracket = await p.evaluate(() => { const c = document.querySelectorAll('.se-cell'); return {e: [...c].findIndex(x => x.classList.contains('d1e')), dim: [...c].filter(x => x.classList.contains('d1o')).length}; });
res.push({id: 'D1-P Laufpunkt', pass: ok >= samples.length - 3, info: `Laufpunkt = Spur-Schritt (rückwärts, 12): ${ok}/${samples.length} Proben ±1 (${samples.slice(0, 8).map(s => s[0] + '/' + s[1]).join(' ')} …)`});
res.push({id: 'D1-P Klammer', pass: bracket.e === 11 && bracket.dim === 4, info: `Klammer auf Schritt ${bracket.e + 1}, ${bracket.dim} Schritte gedimmt`});
res.push({id: 'D1-P Fehler', pass: A.errs.length === 0, info: JSON.stringify(A.errs.slice(0, 2))});
await A.b.close(); report('D1-Laufpunkt', res);
