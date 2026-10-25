// QA: own clip (from a NOTEN take, 2-bar Durchlauf) after its scene clip got shorter (1 bar); a CLIPS take ending inside the
// own clip's Durchlauf must continue it in phase
import { openT, waitSong, note, mk, SETUP, playLog } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const {b, p, errs} = await openT({width: 390, height: 844}, false);
await p.evaluate(() => ensureAudio()); await p.waitForTimeout(300);
await p.evaluate(SETUP(true));
// NOTEN Overdub on the bass in T9 (2nd bar of the 2-bar Sz3 Durchlauf T8–9) → own clip of 2 bars
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); return Q.songRecRange(8, 8, 'overdub', {clips: false, chords: false, notes: true}, {preroll: 1, track: 0}); });
await waitSong(p, 33); await note(p, 57, 150);
await waitSong(p, 36.3);
await p.evaluate(() => { const Q = window.SYNQUENZER; if (Q.runtime().song.rec) Q.songRecEnd(); Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
let s = await p.evaluate(() => window.SYNQUENZER.song());
const id = Object.keys(s.own)[0];
check('own clip of the T8–9 Durchlauf (2 bars) with the new note at t≈5', id && s.own[id].len === 2 && s.own[id].notes.some(n => n.t > 4.8 && n.t < 5.5), {own: s.own, lane: s.lanes[0]});
// the user shortens the scene clip Bass Sz3 to 1 bar (the own clip must not care: it is a copy)
await p.evaluate(() => { const Q = window.SYNQUENZER; const c = Q.getClip(0, 2); c.len = 1; c.notes = c.notes.filter(n => n.t < 4); Q.setClip(0, 2, c); });
const before = (await playLog(p, 39.9, 0)).map(n => [+n.beat.toFixed(2), n.src, n.clipNote]);
check('before: T9 plays the own clip 2nd bar incl. the new note', before.some(x => x[0] > 32.8 && x[0] < 33.5 && x[1] === 'own'), before.filter(x => x[0] >= 28));
// CLIPS take ab T8: Bass Sz1 at T8, end at T9 + 70 % (time rule → E1? n0=1,n1=2 both logical, f .7 → E1 = bar line 10)… use T9 + 30 % → bar line 9
await p.evaluate(() => window.SYNQUENZER.songRecFrom({from: 7, mode: 'over', targets: {clips: true, chords: false, notes: false}, preroll: 1}));
await waitSong(p, 26.5); await p.evaluate(() => window.SYNQUENZER.launchClip(0, 0));
await waitSong(p, 33.2); await p.evaluate(() => window.SYNQUENZER.songRecEnd());
const le = await p.evaluate(() => window.SYNQUENZER.runtime().song.lastEnd);
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
s = await p.evaluate(() => window.SYNQUENZER.song());
const after = (await playLog(p, 39.9, 0)).map(n => [+n.beat.toFixed(2), n.src, n.clipNote]);
const b9 = before.filter(x => x[0] >= 32 - .01 && x[0] < 36 - .01), a9 = after.filter(x => x[0] >= 32 - .01 && x[0] < 36 - .01);
check('take ends at bar line 9 (endBar 8)', le && le.endBar === 8, le);
check('after: T10–11 still the scene clip (reference), like before', JSON.stringify(before.filter(x => x[0] >= 36 - .01)) === JSON.stringify(after.filter(x => x[0] >= 36 - .01)), {before: before.filter(x => x[0] >= 36 - .01), after: after.filter(x => x[0] >= 36 - .01)});
check('after: T9 sounds as before (own clip 2nd bar, in phase)', JSON.stringify(b9) === JSON.stringify(a9), {lane: s.lanes[0], before: b9, after: a9});
check('0 console errors', !errs.length, errs);
await b.close(); process.exit(done() ? 1 : 0);
