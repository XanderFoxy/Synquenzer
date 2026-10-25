// QA V2d′-05: one take with CLIPS + AKKORDE + NOTEN (Synth 2, own clip) in each mode = exactly one undo step; undo → deep-equal,
// redo → the take's result deep-equal; memory() reports the own clip while it plays
import { openT, waitSong, note, projSong, clipsJSON, mk, SETUP } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const {b, p, errs} = await openT({width: 390, height: 844}, false);
await p.evaluate(() => ensureAudio()); await p.waitForTimeout(300);
for (const mode of ['over', 'insert', 'replace', 'overdub']) {
  await p.evaluate(SETUP(true));
  await p.evaluate(() => window.SYNQUENZER.selectTrack(1));
  const s0 = await projSong(p), c0 = await clipsJSON(p), n0 = await p.evaluate(() => window.SYNQUENZER.undoInfo().n);
  const tg = {clips: true, chords: true, notes: true};
  await p.evaluate(([mode, tg]) => { const Q = window.SYNQUENZER; return mode === 'replace' || mode === 'overdub' ? Q.songRecRange(3, 4, mode, tg, {preroll: 1}) : Q.songRecFrom({from: 3, mode, targets: tg, preroll: 1}); }, [mode, tg]);
  await waitSong(p, 10.5); await p.evaluate(() => window.SYNQUENZER.launchClip(2, 2));                // Sequenz Sz3 from T4
  await waitSong(p, 12.3); await note(p, 81, 120);                                                     // NOTEN in T4
  await waitSong(p, 15.9);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setKbMode('transpose'); Q.keyOn(62, .8, 'c1'); Q.keyOn(65, .8, 'c2'); Q.keyOn(69, .8, 'c3'); });
  await p.waitForTimeout(200);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.keyOff(62, 'c1'); Q.keyOff(65, 'c2'); Q.keyOff(69, 'c3'); Q.setKbMode('play'); });
  const mem = await p.evaluate(() => { const m = window.SYNQUENZER.memory(); return m && m.bars ? m.bars.slice(-2).map(x => x.own) : null; });
  await waitSong(p, 20.4);
  await p.evaluate(() => { if (window.SYNQUENZER.runtime().song.rec) window.SYNQUENZER.songRecEnd(); });
  await p.waitForTimeout(150);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(250);
  const s1 = await projSong(p), u = await p.evaluate(() => window.SYNQUENZER.undoInfo());
  const so = JSON.parse(s1);
  check(mode + ': recorded something in all three targets (lane, chord, own clip)', so.lanes[2].some(e => e.slot === 2) && so.carrier.some(c => c.target && c.target.name === 'Dm') && Object.keys(so.own || {}).length >= 1, {lane2: so.lanes[2], car: so.carrier.map(c => [c.beat, c.target && c.target.name]), own: Object.keys(so.own || {})});
  check(mode + ': exactly one new undo step (song)', u.n === n0 + 1 && u.top.kind === 'song', u);
  check(mode + ': clips deep-equal', (await clipsJSON(p)) === c0);
  await p.evaluate(() => window.SYNQUENZER.undo());
  check(mode + ': undo → deep-equal', (await projSong(p)) === s0);
  await p.evaluate(() => window.SYNQUENZER.redo());
  check(mode + ': redo → the take result deep-equal', (await projSong(p)) === s1);
  if (mode === 'over') check('memory() names the own clip of Synth 2 while it plays', mem && mem.some(o => o && o[1]), mem);
}
check('0 console errors', !errs.length, errs);
await b.close();
process.exit(done() ? 1 : 0);
