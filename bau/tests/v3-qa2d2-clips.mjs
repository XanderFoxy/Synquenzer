// QA V2d′ Bereich Ersetzen / Overdub with CLIPS (7.2 „wie Überschreiben, auf den Bereich begrenzt“): punch-out at the range end, the
// old part goes on in phase after it; Vorlauf with n = 1 → count-in (7.4)
import { openT, waitSong, projSong, clipsJSON, mk, SETUP, playLog } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const {b, p, errs} = await openT({width: 390, height: 844}, false);
await p.evaluate(() => ensureAudio()); await p.waitForTimeout(300);
for (const mode of ['replace', 'overdub']) {
  await p.evaluate(SETUP(true));
  const c0 = await clipsJSON(p);
  await p.evaluate(m => window.SYNQUENZER.songRecRange(3, 4, m, {clips: true, chords: false, notes: false}, {preroll: 1}), mode);
  await waitSong(p, 10.5); await p.evaluate(() => window.SYNQUENZER.launchClip(1, 3));
  await waitSong(p, 20.6);
  const rec = await p.evaluate(() => window.SYNQUENZER.runtime().song.rec);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(250);
  const s = await p.evaluate(() => window.SYNQUENZER.song());
  check(mode + ' CLIPS: punched out at T6 by itself', !rec);
  check(mode + ' CLIPS: Fläche lane T4–5 = Sz4, from T6 the old clip in phase (ph 12)', JSON.stringify(s.lanes[1].slice(0, 3)) === JSON.stringify([{bar: 2, slot: 1, re: 1}, {bar: 3, slot: 3}, {bar: 5, slot: 1, ph: 12}]), s.lanes[1]);
  const L = (await playLog(p, 23.5, 1)).map(n => [+n.beat.toFixed(2), n.clipNote]);
  check(mode + ' CLIPS: heard T4–5 = 67, T6 = 65 (old, in phase)', L.some(x => Math.abs(x[0] - 12) < .02 && x[1] === 67) && L.some(x => Math.abs(x[0] - 16) < .02 && x[1] === 67) && L.some(x => Math.abs(x[0] - 20) < .02 && x[1] === 65) && !L.some(x => x[0] > 11.9 && x[0] < 19.9 && x[1] !== 67), L);
  check(mode + ' CLIPS: scene clips deep-equal', (await clipsJSON(p)) === c0);
}
// count-in at n = 1
await p.evaluate(SETUP(false));
await p.evaluate(() => window.SYNQUENZER.songRecFrom({from: 0, mode: 'over', targets: {clips: false, chords: true, notes: false}, preroll: 1}));
const ci = await p.evaluate(() => ({countIn: R.countIn, ciBars: R.ciBars, sched: R.schedBeat, rec: window.SYNQUENZER.runtime().song.rec}));
check('Vorlauf at n = 1 → count-in of 1 bar', ci.rec && ci.countIn && ci.ciBars === 1, ci);
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songRecEnd(); Q.songPlay(false); Q.stop(); });
check('0 console errors', !errs.length, errs);
await b.close(); process.exit(done() ? 1 : 0);
