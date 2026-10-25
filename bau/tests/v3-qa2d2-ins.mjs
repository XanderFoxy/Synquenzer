// QA V2d′ Einfügen ab T3 with CLIPS (7.2): during the take the state of T2 runs on (Synth 4 keeps its clip), a drum clip started
// in the take goes into the new section; end at T5 + 10 % (N7-R1 → 2 bars); live: from the next bar line (T6) the old T4 (REFRAIN)
// is heard in phase; playback afterwards; one undo; clips deep-equal
import { openT, waitSong, projSong, clipsJSON, mk, SETUP, playLog } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const {b, p, errs} = await openT({width: 390, height: 844}, false);
await p.evaluate(SETUP(false));
await p.evaluate(() => ensureAudio()); await p.waitForTimeout(300);
const s0 = await projSong(p), c0 = await clipsJSON(p);
const ref = (await playLog(p, 27.9)).filter(n => n.src !== 'click').map(n => [n.track, +n.beat.toFixed(2), n.clipNote]);
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); return Q.songRecFrom({from: 2, mode: 'insert', targets: {clips: true, chords: false, notes: false}, preroll: 1}); });
await waitSong(p, 6.5);
await p.evaluate(() => window.SYNQUENZER.launchClip(4, 0));     // Drums Sz1 from T3
await waitSong(p, 16.4);                                          // T5 + 10 %
await p.evaluate(() => window.SYNQUENZER.songRecEnd());
const le = await p.evaluate(() => window.SYNQUENZER.runtime().song.lastEnd);
await waitSong(p, 27.9);
const live = await p.evaluate(() => { const off0 = window.SYNQUENZER.runtime().song.off; return {off: off0, log: window.SYNQUENZER.noteLog(600).filter(n => n.src !== 'click').map(n => [n.track, +n.beat.toFixed(2), n.clipNote, n.src])}; });
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
const s1 = await p.evaluate(() => window.SYNQUENZER.song());
check('end: 2 bars inserted (bars 7 → 9, endBar 4)', le && le.endBar === 4 && s1.bars === 9, {le, bars: s1.bars});
check('clips deep-equal', (await clipsJSON(p)) === c0);
// live: the transport ran from song bar 2 (preroll) → song beat = transport beat + 4 (no loop / jump)
const sb = x => +(x + 4).toFixed(2);
const L = live.log.map(x => [x[0], sb(x[1]), x[2], x[3]]);
const has = (t, beat, n) => L.some(x => x[0] === t && Math.abs(x[1] - beat) < .03 && (n == null || x[2] === n));
check('during take T3–T4: Synth 4 (state of T2) and the new drums 36', has(3, 8, 64) && has(3, 12, 64) && has(4, 8, 36) && has(4, 12, 36), L.filter(x => x[1] >= 8 && x[1] < 16));
check('during take: no old T3 content (drums 38) in T3–T4', !L.some(x => x[0] === 4 && x[2] === 38 && x[1] >= 8 && x[1] < 16), L.filter(x => x[1] >= 8 && x[1] < 16));
// after the end (pressed at 16.4): from T6 (beat 20) the song plays new T6 = old T4: bass 41 (Sz3 phase 0), sequence 72, drums 38
const after = L.filter(x => x[1] >= 20 - .03 && x[1] < 28 - .03);
check('live after end: from T6 the old T4 (REFRAIN) in phase: bass 41 @20, 43 @24, seq 72 @20, drums 38 @20', has(0, 20, 41) && has(0, 24, 43) && has(2, 20, 72) && has(4, 20, 38), after);
check('live after end: T5 (16–20) = what? (old T3 Break expected from next bar line only → T5 still held or break)', true, L.filter(x => x[1] >= 16 && x[1] < 20));
// playback afterwards: new T5–9 = old T3–7 (all tracks, shifted by 8 beats)
const got = (await playLog(p, 35.9)).filter(n => n.src !== 'click').map(n => [n.track, +n.beat.toFixed(2), n.clipNote]);
const A = ref.filter(x => x[1] >= 8 - .01 && x[1] < 28 - .01).map(x => [x[0], +(x[1] + 8).toFixed(2), x[2]]).sort((a, c) => a[0] - c[0] || a[1] - c[1]);
const B = got.filter(x => x[1] >= 16 - .01 && x[1] < 36 - .01).sort((a, c) => a[0] - c[0] || a[1] - c[1]);
check('playback: new T5–9 = old T3–7 (track, beat ±0.02, clip note)', A.length > 8 && A.length === B.length && A.every((x, k) => x[0] === B[k][0] && Math.abs(x[1] - B[k][1]) < .02 && x[2] === B[k][2]), {nA: A.length, nB: B.length, A: A.slice(0, 14), B: B.slice(0, 14)});
const T34 = got.filter(x => x[1] >= 8 - .01 && x[1] < 16 - .01);
check('playback: new T3–4 = Synth 4 (64) + drums 36 only', T34.every(x => (x[0] === 3 && x[2] === 64) || (x[0] === 4 && x[2] === 36)) && T34.length >= 4, T34);
const u = await p.evaluate(() => window.SYNQUENZER.undoInfo()); await p.evaluate(() => window.SYNQUENZER.undo());
check('one undo → deep-equal', u.top && u.top.kind === 'song' && (await projSong(p)) === s0, u.top);
check('0 console errors', !errs.length, errs);
await b.close();
process.exit(done() ? 1 : 0);
