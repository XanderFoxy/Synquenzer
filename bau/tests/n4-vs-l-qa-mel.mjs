// QA VS-L-03 (realistisch): Demo-Szene mit 4-Takt-MELODIE-Clip, MELODIE gewählt, ● kurz vor dem Taktstrich, 16 Takte singen, ● kurz danach.
// Prüft: STIMME 16 Takte, alle gesungenen Takte im Clip, Lage des Gesangs im Clip nach Neustart der Szene. node n4-vs-l-qa-mel.mjs [pb] [pa] [file]
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, sungBarHeard, NEW, sleep} from './n4-vs-l-qa-h.mjs';
const pb = +(process.argv[2] || 0.5), pa = +(process.argv[3] || 0.5), file = process.argv[4] || NEW, bars = 16;
const H = await start(file, 120, {demo: true}), p = H.p, spb = 0.5;
await p.evaluate(() => SYNQUENZER.setClip(5, 0, {len: 4, notes: [{t: 0, d: 1, n: 60, v: .8}, {t: 8, d: 1, n: 64, v: .8}]}));
const k = await prep(H, sing(melN(bars), 120, 7));
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.play(); });
const B = 16;
await waitBeat(p, B - pb - 0.05); await fire(H, k, B);
await waitBeat(p, B - pb); await p.evaluate(() => SYNQUENZER.rec()); await sleep(80);
const rs = await p.evaluate(() => { const r = SYNQUENZER.runtime().rec; return {state: r.state, startBeat: r.startBeat}; });
await waitBeat(p, B + 4 * bars + pa); await p.evaluate(() => SYNQUENZER.rec());
await waitBeat(p, B + 4 * bars + pa + 3); await idle(p);
const r = await stInfo(p, 0);
console.log('● bei', B - pb, JSON.stringify(rs));
console.log('STIMME:', JSON.stringify({len: r.len, audio: r.audio && {in: r.audio.in, out: r.audio.out, at: r.audio.at}, takeSec: r.takeSec, cstart: r.cstart, mel: r.mel}));
const rows = []; for (let j = 0; j < bars; j++) { const h = await sungBarHeard(p, r, r.cstart, B + 4 * j, B + 4 * j + 4, spb); rows.push([j + 1, h.played, h.db]); }
console.log('gesungene Takte [Takt, Anteil, dBFS]:', JSON.stringify(rows));
// Neustart: Szene am Taktstrich starten → an welchem Clip-Schlag beginnt der Gesang? (gesungen auf dem Taktstrich B)
await p.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.launchScene(0); SYNQUENZER.play(); }); await sleep(800);
const r2 = await stInfo(p, 0);
const onClip = r.audio.at + (B - rs.startBeat);        // Clip-Schlag, an dem der Gesang (Einsatz auf dem Taktstrich B) nach dem Neustart erklingt
console.log(`nach Neustart: cstart ${r2.cstart}; Gesang (auf Taktstrich gesungen) erklingt bei Clip-Schlag ${onClip.toFixed(3)} → Versatz ${(onClip % 1).toFixed(3)} Schlag = ${((onClip % 1) * spb * 1000).toFixed(0)} ms`);
await p.evaluate(() => SYNQUENZER.stop());
console.log('Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await H.close();
