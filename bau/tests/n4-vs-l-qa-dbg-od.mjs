// QA VS-L Debug: Overdub auf Demo-MELODIE-Clip, Aus – Verlauf des Aufnahme-Zustands
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, NEW, sleep} from './n4-vs-l-qa-h.mjs';
const mel = process.argv[2] === 'an' ? true : false, file = process.argv[3] || NEW;
const H = await start(file, 120, {mel, demo: true}), p = H.p;
const k = await prep(H, sing(melN(8), 120));
console.log('Demo: Spuren', JSON.stringify(await p.evaluate(() => SYNQUENZER.project().tracks.map(t => [t.name, t.clips.map(c => c ? (c.audio ? 'A' + c.len : c.len) : 0).join(',')]))), 'Song', await p.evaluate(() => !!SYNQUENZER.project().song));
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.play(); });
const R = () => p.evaluate(() => { const r = SYNQUENZER.runtime(); return {b: +((SYNQUENZER.vsClock().now - SYNQUENZER.vsClock().outLat - SYNQUENZER.vsClock().start) / SYNQUENZER.vsClock().spb).toFixed(2), rec: r.rec.state, sb: r.rec.startBeat && +r.rec.startBeat.toFixed(3), slots: r.slots, cst: r.cstart, q: r.queued.map(x => x && x.slot)}; });
await waitBeat(p, 7.9); await fire(H, k, 8); await waitBeat(p, 8.0); await p.evaluate(() => SYNQUENZER.rec());
for (const b of [8.3, 12.5, 20.5, 28.5, 36.5, 39.9]) { await waitBeat(p, b); console.log(JSON.stringify(await R())); }
await waitBeat(p, 40.1); await p.evaluate(() => SYNQUENZER.rec()); console.log('● Ende', JSON.stringify(await R()));
await waitBeat(p, 43); await idle(p); await sleep(800);
const r = await stInfo(p, 0); console.log('STIMME', JSON.stringify({len: r.len, a: r.audio && [r.audio.in, r.audio.out, r.audio.at], cst: r.cstart}), 'MEL', JSON.stringify(r.mel), 'toasts', JSON.stringify(await p.evaluate(() => window.__toasts)));
await H.close();
