// QA V2d′ own clip longer than its scene clip ([Ganzer Block], 4 bars over a 2-bar scene clip): after a CLIPS take that ends inside
// the block, the old part must go on IN PHASE (song-delta 7.2 „Bandmaschine“, N7S-27 „ab T5 spielt der alte Inhalt phasengleich weiter“)
import { openT, waitSong, note, projSong, clipsJSON, mk, SETUP, playLog } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const {b, p, errs} = await openT({width: 390, height: 844}, false);
await p.evaluate(SETUP(true));
await p.evaluate(() => ensureAudio()); await p.waitForTimeout(300);
const id = await p.evaluate(() => window.SYNQUENZER.makeOwn(0, 8, true));          // Bass T8–11 → one 4-bar own clip
let s = await p.evaluate(() => window.SYNQUENZER.song());
check('[Ganzer Block] → one 4-bar own clip on the bass from T8', id && s.own[id] && s.own[id].len === 4 && s.lanes[0].some(e => e.bar === 7 && e.own === id), {id, len: s.own[id] && s.own[id].len, lane: s.lanes[0]});
// make bar 3 of the own clip (song T10) different: overdub a note into T10 (NOTEN on Synth 1 = the bass)
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); return Q.songRecRange(9, 9, 'overdub', {clips: false, chords: false, notes: true}, {preroll: 1, track: 0}); });
await waitSong(p, 37); await note(p, 57, 150);
await waitSong(p, 40.3);
await p.evaluate(() => { const Q = window.SYNQUENZER; if (Q.runtime().song.rec) Q.songRecEnd(); Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
s = await p.evaluate(() => window.SYNQUENZER.song());
const oc = s.own[id];
check('overdub went into the 4-bar own clip (bar 3 of it, t ≈ 9)', oc && oc.notes.some(n => n.t >= 8.9 && n.t < 9.5), {notes: oc && oc.notes, own: Object.keys(s.own), lane: s.lanes[0]});
const before = (await playLog(p, 43.9, 0)).map(n => [+n.beat.toFixed(2), n.src, n.clipNote]);
check('before: T10 (36–40) plays the own clip with the overdubbed note', before.some(x => x[0] >= 36.8 && x[0] < 37.5), before.filter(x => x[0] >= 28));
// CLIPS take: Überschreiben ab T8, start Bass Sz1 at T8, end at T10 + 10 % → bar line 10 (endBar 9)
await p.evaluate(() => window.SYNQUENZER.songRecFrom({from: 7, mode: 'over', targets: {clips: true, chords: false, notes: false}, preroll: 1}));
await waitSong(p, 26.5); await p.evaluate(() => window.SYNQUENZER.launchClip(0, 0));
await waitSong(p, 36.4); await p.evaluate(() => window.SYNQUENZER.songRecEnd());
const le = await p.evaluate(() => window.SYNQUENZER.runtime().song.lastEnd);
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
s = await p.evaluate(() => window.SYNQUENZER.song());
check('take end bar line 10 (endBar 9)', le && le.endBar === 9, le);
const cont = s.lanes[0].find(e => e.bar === 9);
check('continuation at T10 keeps the own clip IN PHASE (ph 8 of its 16 beats)', cont && cont.own === id && cont.ph === 8, {cont, lane: s.lanes[0]});
const after = (await playLog(p, 43.9, 0)).map(n => [+n.beat.toFixed(2), n.src, n.clipNote]);
const b10 = before.filter(x => x[0] >= 36 - .01 && x[0] < 44 - .01), a10 = after.filter(x => x[0] >= 36 - .01 && x[0] < 44 - .01);
check('after: T10–11 sound exactly as before the take (old part in phase)', JSON.stringify(b10) === JSON.stringify(a10), {before: b10, after: a10});
check('0 console errors', !errs.length, errs);
await b.close();
process.exit(done() ? 1 : 0);
