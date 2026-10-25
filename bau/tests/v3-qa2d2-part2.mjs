// QA 7.2: part key during a CLIPS take — what is HEARD during the take must be what the song plays afterwards (Sequenz: STROPHE
// says „aus“ for T3–6; the old song starts the Sequenz at T4)
import { openT, waitSong, mk, SETUP, playLog } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const {b, p, errs} = await openT({width: 390, height: 844}, false);
await p.evaluate(SETUP(false));
await p.evaluate(() => ensureAudio()); await p.waitForTimeout(300);
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); return Q.songRecFrom({from: 2, mode: 'over', targets: {clips: true, chords: false, notes: false}, preroll: 1}); });
await waitSong(p, 5.2);
await p.evaluate(() => window.SYNQUENZER.partTap(0));
await waitSong(p, 24.6);
const take = await p.evaluate(() => { const off = window.SYNQUENZER.runtime().song.off; return window.SYNQUENZER.noteLog(800).filter(n => n.src !== 'click' && n.src !== 'melody').map(n => [n.track, +(n.beat - off).toFixed(2), n.clipNote]); });
await p.evaluate(() => window.SYNQUENZER.songRecEnd());
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
const s = await p.evaluate(() => window.SYNQUENZER.song());
const play = (await playLog(p, 24.6)).filter(n => n.src !== 'click' && n.src !== 'melody').map(n => [n.track, +n.beat.toFixed(2), n.clipNote]);
const win = (L, t) => L.filter(x => x[0] === t && x[1] >= 8 - .01 && x[1] < 24 - .01).map(x => x[1] + ':' + x[2]).join(' ');
for (const t of [0, 1, 2, 3, 4]) check(`track ${t}: T3–6 heard in the take = played back after it`, win(take, t) === win(play, t), {take: win(take, t), play: win(play, t), lane: s.lanes[t]});
check('0 console errors', !errs.length, errs);
await b.close(); process.exit(done() ? 1 : 0);
