// QA VS-L-05: 40 BPM (langsamstes Tempo), ● REC mit 🎤 auf leeren MELODIE-Platz, 16 Takte → Take ganz im Ringpuffer (late 0), Takt 1 und 16 hörbar
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, takeDb, NEW} from './n4-vs-l-qa-h.mjs';
const H = await start(NEW, 40), p = H.p;
const minBpm = await p.evaluate(() => { SYNQUENZER.setBpm(10); const b = SYNQUENZER.project().bpm; SYNQUENZER.setBpm(40); return b; });
const k = await prep(H, sing(melN(16), 40));
await p.evaluate(() => { SYNQUENZER.selectSlot(5, 3); SYNQUENZER.play(); });
await waitBeat(p, 1.5); await p.evaluate(() => SYNQUENZER.rec()); await fire(H, k, 4);
await waitBeat(p, 68.1); await p.evaluate(() => SYNQUENZER.rec());
await waitBeat(p, 70); await idle(p);
const r = await stInfo(p, 3), sp = 1.5;
const d1 = await takeDb(p, r.audio.take, r.audio.in + 0.1, r.audio.in + 6), d16 = await takeDb(p, r.audio.take, r.audio.in + 15 * 4 * sp, r.audio.in + 16 * 4 * sp);
console.log('kleinstes Tempo', minBpm, '| STIMME', JSON.stringify({len: r.len, sec: (r.audio.out - r.audio.in).toFixed(3), takeSec: r.takeSec, late: r.last.late, pre: r.last.pre, d1, d16}), 'MELODIE', JSON.stringify(r.mel), 'Ringpuffer', JSON.stringify(await p.evaluate(() => SYNQUENZER.stimme().ring && {sec: SYNQUENZER.stimme().ring.sec})));
console.log('Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await H.close();
