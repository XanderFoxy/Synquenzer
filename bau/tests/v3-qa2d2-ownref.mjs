// QA: an own clip (NOTEN take in T9 → own Durchlauf T8–9, reference again from T10) must stay limited to its Durchlauf after a
// later CLIPS take on the same track somewhere ELSE in the song (ab T3, ends at T5) — EN7-04 / N7-R9 „gilt nur an dieser Stelle“
import { openT, waitSong, note, clipsJSON, mk, SETUP, playLog } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const {b, p, errs} = await openT({width: 390, height: 844}, false);
await p.evaluate(() => ensureAudio()); await p.waitForTimeout(300);
await p.evaluate(SETUP(true));
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); return Q.songRecRange(8, 8, 'overdub', {clips: false, chords: false, notes: true}, {preroll: 1, track: 0}); });
await waitSong(p, 33); await note(p, 57, 150);
await waitSong(p, 36.3);
await p.evaluate(() => { const Q = window.SYNQUENZER; if (Q.runtime().song.rec) Q.songRecEnd(); Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
let s = await p.evaluate(() => window.SYNQUENZER.song());
const lane0 = JSON.stringify(s.lanes[0]);
check('own Durchlauf T8–9, reference back at T10 ({bar:9, slot:2})', s.lanes[0].some(e => e.bar === 7 && e.own) && s.lanes[0].some(e => e.bar === 9 && e.slot === 2 && !e.own), s.lanes[0]);
const before = (await playLog(p, 43.9, 0)).map(n => [+n.beat.toFixed(2), n.src, n.clipNote]);
// CLIPS take elsewhere: ab T3, Bass Sz3 at T3, end at T5 + 10 % (bar line 5)
await p.evaluate(() => window.SYNQUENZER.songRecFrom({from: 2, mode: 'over', targets: {clips: true, chords: false, notes: false}, preroll: 1}));
await waitSong(p, 6.5); await p.evaluate(() => window.SYNQUENZER.launchClip(0, 2));
await waitSong(p, 16.4); await p.evaluate(() => window.SYNQUENZER.songRecEnd());
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
s = await p.evaluate(() => window.SYNQUENZER.song());
check('after the CLIPS take T3–4: the reference entry {bar:9, slot:2} is still there', s.lanes[0].some(e => e.bar === 9 && e.slot === 2 && !e.own), {before: lane0, after: s.lanes[0]});
const after = (await playLog(p, 43.9, 0)).map(n => [+n.beat.toFixed(2), n.src, n.clipNote]);
const f = L => L.filter(x => x[0] >= 28 - .01);
check('after: T8–11 sound exactly as before (own only in T8–9, scene clip in T10–11)', JSON.stringify(f(before)) === JSON.stringify(f(after)), {before: f(before), after: f(after)});
check('0 console errors', !errs.length, errs);
await b.close(); process.exit(done() ? 1 : 0);
