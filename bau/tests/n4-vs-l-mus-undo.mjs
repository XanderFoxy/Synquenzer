// Musiker: Overdub wird länger (4 → 16 Takte) während ▶ läuft, dann sofort ↶ (Touch) weil der Take nicht gefällt – läuft der alte
// 4-Takt-STIMME-Clip wieder an seiner alten Stelle (Phase wie vorher, im Takt mit dem MELODIE-Clip derselben Aufnahme)?
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, NEW, sleep, tapSel, undoN} from './n4-vs-l-mus-h.mjs';
const file = process.argv[2] || NEW, BPM = 112;
const H = await start(file, BPM, {demo: true, touch: true}), p = H.p;
const k1 = await prep(H, sing(melN(4), BPM)), k2 = await prep(H, sing(melN(16, 2), BPM, 5));
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.play(); });
await waitBeat(p, 1.0); await tapSel(H, '#bRec'); await fire(H, k1, 4);
await waitBeat(p, 19.5); await tapSel(H, '#bRec'); await waitBeat(p, 23); await idle(p); await sleep(300);
await tapSel(H, '.vsres button[data-a="ok"]'); await sleep(300);
const ph = () => p.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme, R = SYNQUENZER.runtime(); const c = SYNQUENZER.getClip(st, 0), m = SYNQUENZER.getClip(5, 0); return {stLen: c && c.len, stPhase: R.cstart[st], stSlot: R.slots[st], melLen: m && m.len, melPhase: R.cstart[5], melSlot: R.slots[5]}; });
const A = await ph();
console.log('nach Take 1 (4 Takte ab Schlag 4):', JSON.stringify(A));
await waitBeat(p, 39.3); await fire(H, k2, 40);
await waitBeat(p, 40.0); await tapSel(H, '#bRec');
await waitBeat(p, 104.1); await tapSel(H, '#bRec'); await waitBeat(p, 106); await idle(p); await sleep(300);
const B = await ph(); console.log('nach Overdub (16 Takte ab Schlag 40):', JSON.stringify(B), 'Undo', await undoN(p));
if (await p.evaluate(() => !!document.querySelector('.vsres'))) { await tapSel(H, '.vsres button[data-a="ok"]'); await sleep(300); }
await tapSel(H, '#bUndo'); await sleep(800);
const C = await ph(); const bNow = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
console.log(`nach ↶ (bei Schlag ${bNow.toFixed(1)}, läuft weiter):`, JSON.stringify(C));
// welcher Clip-Schlag des alten 4-Takt-Takes klingt bei Schlag T, verglichen mit vorher (Phase 4) und mit dem MELODIE-Clip
const T = Math.ceil(bNow / 4) * 4 + 8;
const cbSt = ((T - C.stPhase) % 16 + 16) % 16, cbMel = ((T - C.melPhase) % 16 + 16) % 16, cbOld = ((T - A.stPhase) % 16 + 16) % 16;
console.log(`bei Schlag ${T}: STIMME spielt Clip-Schlag ${cbSt}, MELODIE Clip-Schlag ${cbMel}, vor dem Overdub hätte STIMME Clip-Schlag ${cbOld} gespielt → ${cbSt === cbMel ? 'im Takt' : 'VERSETZT um ' + ((cbSt - cbMel + 16) % 16) + ' Schläge'}`);
await waitBeat(p, T + 0.5);
const src = await p.evaluate(() => { const c = SYNQUENZER.vsClock(), b = t => +((t - c.start) / c.spb).toFixed(2); return SYNQUENZER.tkInfo().src.map(r => [r.take.slice(0, 4), b(r.start), b(r.end), +r.off.toFixed(3)]); });
console.log('geplante STIMME-Stücke [Take, ab Schlag, bis Schlag, Take-Sekunde]:', JSON.stringify(src));
console.log('Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await H.close();
