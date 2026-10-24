// VS2-fix: „Gesang in den letzten 8 s (und keine Taste danach)“: Kabel-Weg, singen → „stimme“; dann Tasten → „fang“, FANG fängt die Tasten.
import {open, sleep, voice, playAtBeat, waitBeat} from './v3-qa-vs2acc-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const H = await open({vp: 'P1'}), p = H.p;
await p.evaluate(() => { window.__q.label = 'Headset Microphone'; SYNQUENZER.setMetronome(true); });
await p.tap('#segMic');
await p.waitForFunction(() => window.__q.bus, null, {timeout: 5000});
await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 20000});
const {calib} = await import('./v3-qa-vs2acc-h.mjs'); await calib(p);
await p.evaluate(() => SYNQUENZER.stimmeSheet(false)); await sleep(200);
await p.tap('#bPlay'); await sleep(50);
const SB = await p.evaluate(() => SYNQUENZER.vsClock().spb);
const MEL = [[4, 1, 60], [5, 1, 62], [6, 2, 64], [8, 1, 65], [9, 1, 64], [10, 2, 62]];
await playAtBeat(p, voice(MEL.map(([b, d, m]) => ({on: 0.05 + (b - 4) * SB, dur: d * SB, m})), {seed: 3}), 4, 0.05);
await waitBeat(p, 12.5);
const m1 = await p.evaluate(() => SYNQUENZER.vsInfo().fangMode);
ok(m1 === 'stimme', 'nach dem Singen: ' + m1);
await p.evaluate(() => { SYNQUENZER.selectSlot(2, 0); });
for (let k = 0; k < 4; k++) { await waitBeat(p, 13 + k); await p.evaluate(n => SYNQUENZER.tap(n, 250), [72, 74, 76, 77][k]); }
await waitBeat(p, 17.3);
const m2 = await p.evaluate(() => ({m: SYNQUENZER.vsInfo().fangMode, tx: document.getElementById('bFang').textContent, vr: SYNQUENZER.vsInfo().voiceRecent}));
ok(m2.m === 'fang', 'Tasten nach dem Gesang: ' + JSON.stringify(m2));
await p.evaluate(() => document.getElementById('bFang').click()); await sleep(1500);
const c = await p.evaluate(() => { const P = SYNQUENZER.project(), out = []; P.tracks.forEach((t, i) => (t.clips || []).forEach((c, s) => { if (c && c.notes.map(n => n.n).join(',') === '72,74,76,77') out.push(i + ':' + s + ' ' + t.kind); })); return {hit: out, undo: SYNQUENZER.undoInfo().top && SYNQUENZER.undoInfo().top.label}; });
ok(c.hit.length === 1 && c.undo !== 'Stimme', 'FANG fängt die Tasten: ' + JSON.stringify(c));
ok(!H.errs.length, 'keine Fehler ' + JSON.stringify(H.errs));
console.log(fail ? 'FAIL ' + fail : 'ALLE OK');
await H.br.close();
