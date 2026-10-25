import { openT, waitSong, note, mk, SETUP, playLog } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const {b, p, errs} = await openT({width: 390, height: 844}, false);
await p.evaluate(() => ensureAudio()); await p.waitForTimeout(300);
await p.evaluate(SETUP(true));
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); return Q.songRecRange(8, 8, 'overdub', {clips: false, chords: false, notes: true}, {preroll: 1, track: 0}); });
await waitSong(p, 33); await note(p, 57, 150);
await waitSong(p, 36.3);
await p.evaluate(() => { const Q = window.SYNQUENZER; if (Q.runtime().song.rec) Q.songRecEnd(); Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
let s = await p.evaluate(() => window.SYNQUENZER.song());
console.log('lane0 after NOTEN take', JSON.stringify(s.lanes[0]), 'bars', s.bars);
// direct unit call of songCommitLanes with a recorded launch at bar 2 and endBar 4 on track 0 (pure function on S.song)
const unit = await p.evaluate(() => {
  const saved = JSON.stringify(S.song.lanes);
  const evs = Array.from({length: 16}, () => []); evs[0] = [{bar: 2, slot: 2}];
  songCommitLanes(evs, 4);
  const r = JSON.stringify(S.song.lanes[0]);
  S.song.lanes = JSON.parse(saved);
  return r;
});
console.log('unit songCommitLanes result', unit);
check('unit: {bar:9,slot:2} survives', JSON.parse(unit).some(e => e.bar === 9 && e.slot === 2 && !e.own), unit);
const before = (await playLog(p, 43.9, 0)).map(n => [+n.beat.toFixed(2), n.src, n.clipNote]);
// independent take kind: CLIPS range 'replace' T3–T4 (bars 2..3)
const ok = await p.evaluate(() => window.SYNQUENZER.songRecRange(2, 3, 'replace', {clips: true, chords: false, notes: false}, {preroll: 1}));
console.log('range take started', ok);
await waitSong(p, 6.5); await p.evaluate(() => window.SYNQUENZER.launchClip(0, 2));
await waitSong(p, 18.5);
await p.evaluate(() => { const Q = window.SYNQUENZER; if (Q.runtime().song.rec) Q.songRecEnd(); Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(300);
s = await p.evaluate(() => window.SYNQUENZER.song());
console.log('lane0 after CLIPS range take', JSON.stringify(s.lanes[0]));
check('range take: {bar:9,slot:2} survives', s.lanes[0].some(e => e.bar === 9 && e.slot === 2 && !e.own));
const after = (await playLog(p, 43.9, 0)).map(n => [+n.beat.toFixed(2), n.src, n.clipNote]);
const f = L => L.filter(x => x[0] >= 36 - .01);
console.log('T10-11 before', JSON.stringify(f(before))); console.log('T10-11 after ', JSON.stringify(f(after)));
check('T10–11 unchanged', JSON.stringify(f(before)) === JSON.stringify(f(after)));
// does a later edit of scene clip 0/2 still reach T10?
await p.evaluate(() => { const Q = window.SYNQUENZER; const K = {root: 9, scale: 'aeolian'}; Q.setClip(0, 2, {len: 2, key: K, notes: [{t: 0, d: .5, n: 48, v: .8}, {t: 4, d: .5, n: 43, v: .8}, {t: 6, d: .5, n: 43, v: .8}]}); });
const ed = (await playLog(p, 43.9, 0)).map(n => [+n.beat.toFixed(2), n.src, n.clipNote]);
console.log('T10-11 after scene clip edit', JSON.stringify(f(ed)));
check('scene clip edit reaches T10', f(ed).some(x => x[0] === 36 && x[2] === 48));
check('0 console errors', !errs.length, errs);
await b.close(); process.exit(done() ? 1 : 0);
