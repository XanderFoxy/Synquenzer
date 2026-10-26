// T4b: N7V-17 with real fake mic: "dazwischen aufnehmen" ab Takt 3 (2 Takte) and "überschreiben" Takt 3–4
import {launch, open, micOn, waitBeat, idle, sleep, writeWav, tone, concat, pitch, rmsDb, deq, DIR} from './v3-qa-vs3-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const SR = 48000, wav = DIR + '/t4b.wav';
writeWav(wav, concat(tone(392, 3, SR), tone(523, 3, SR)), SR);
const br = await launch(wav);
const H = await open(br), p = H.p;
await micOn(p);
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
await p.evaluate(() => SYNQUENZER.setSong({bars: 6, lanes: [[{bar: 0, slot: 0}, {bar: 3, slot: 1}, {bar: 5, slot: 2}], [{bar: 0, slot: 0}, {bar: 4, slot: 1}], [], [], [{bar: 0, slot: 0}, {bar: 2, slot: 1}], []], carrier: [], mel: {}}));
const T = {clips: false, chords: false, mel: true};
const before = await p.evaluate(() => SYNQUENZER.project().song), u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
await p.evaluate(T => SYNQUENZER.songRecFrom({from: 2, mode: 'insert', targets: T, preroll: true}), T);
await p.waitForFunction(() => SYNQUENZER.vsClock().playing, null, {timeout: 5000});
await waitBeat(p, 4 + 8 + 0.3);
const endB = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
await p.evaluate(b => SYNQUENZER.songRecEnd({beat: b}), endB); await idle(p); await p.evaluate(() => SYNQUENZER.stop());
const S = await p.evaluate(() => SYNQUENZER.project().song);
const sh = before.lanes.every((l, t) => l.filter(e => e.bar >= 2).every(e => S.lanes[t].some(x => x.bar === e.bar + 2 && x.slot === e.slot)) && l.filter(e => e.bar < 2).every(e => S.lanes[t].some(x => x.bar === e.bar && x.slot === e.slot)));
ok(S.bars === 8 && sh, 'insert 2 bars at bar 3: song 6 → ' + S.bars + ', later lane entries +2: ' + JSON.stringify(S.lanes.slice(0, 5).map(l => l.map(e => e.bar + ':' + e.slot))));
const v = S.vox || []; ok(v.length === 1 && v[0].bar === 2 && v[0].len === 2, 'new take at bar 3–4: ' + JSON.stringify(v.map(x => [x.bar, x.len])));
if (v[0]) { const m = (await p.evaluate(() => SYNQUENZER.takes()))[v[0].take], pc = await p.evaluate(id => SYNQUENZER.tkPcmRange(id), v[0].take); const k = Math.round((v[0].in + 1) * m.sr); const f = pitch(pc.slice(k, k + 4096), m.sr); ok(Math.abs(f - 392) < 8 || Math.abs(f - 523) < 10, 'take holds mic tone (' + f.toFixed(0) + ' Hz, ' + rmsDb(pc.slice(k, k + 4096)).toFixed(1) + ' dB)'); }
const ui = await p.evaluate(() => SYNQUENZER.undoInfo());
ok(ui.n === u0 + 1, 'one undo step: ' + JSON.stringify(ui.top));
await p.evaluate(() => SYNQUENZER.undo());
ok(deq(await p.evaluate(() => SYNQUENZER.project().song), before), 'undo → song deep-equal');
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? fail + ' FAIL' : 'all ok');
