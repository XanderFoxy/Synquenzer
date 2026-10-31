// S0 Nachstellen: „Strophe ersetzen ersetzt die falsche“ – gegen die Basis laufen lassen: S012_APP=/home/user/Synquenzer/bau/werkzeug/vs-base-B.html node repro-s0.mjs
import {launch, open, sleep, deq} from './h.mjs';
const br = await launch(); const H = await open(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.setBpm(240); SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
const setup = () => p.evaluate(() => {
  const D = SYNQUENZER, nt = D.NT();
  D.setPart(0, {name: 'Strophe', slots: Array.from({length: nt}, (_, t) => D.getClip(t, 0) ? {s: 0} : -1)});
  D.setPart(1, {name: 'Refrain', slots: Array.from({length: nt}, (_, t) => D.getClip(t, 1) ? {s: 1} : -1)});
  D.setSong(null); D.placePart('P1', 0, 'insert'); D.placePart('P2', 99, 'insert'); D.placePart('P1', 99, 'insert');
  return D.songMarks();
});
console.log('marks', JSON.stringify(await setup()));
const before = await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts()}));
// play scene 2 (other clips), FANG TEIL, name chip „Strophe“ → ⟳ Strophe ersetzen; Xander meant the 2nd Strophe (Takt 5)
await p.evaluate(() => { SYNQUENZER.launchScene(1); SYNQUENZER.play(); });
await p.waitForFunction(() => audBeat() > 9, null, {timeout: 20000});
await p.evaluate(() => { SYNQUENZER.launchScene(0); setTimeout(() => SYNQUENZER.stopTrackNow(1), 50); });
await p.waitForFunction(() => audBeat() > 18, null, {timeout: 20000});
await p.evaluate(() => SYNQUENZER.fangTeil({}));
console.log('fang', JSON.stringify((await p.evaluate(() => SYNQUENZER.fangPart())) && 1));
console.log('name', await p.evaluate(() => SYNQUENZER.fangName('Strophe', 'replace')));
const r = await p.evaluate(() => SYNQUENZER.fangAccept('part'));
const after = await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts(), marks: SYNQUENZER.songMarks()}));
console.log('accept', JSON.stringify(r), 'marks after', JSON.stringify(after.marks));
const m1b = before.song.lanes.map(l => l.filter(e => e.bar < 1)), m1a = after.song.lanes.map(l => l.filter(e => e.bar < 1));
console.log('1. Strophe (Takt 1) unverändert?', deq(m1b, m1a), ' Vorlage Strophe unverändert?', deq(before.parts[0].lanes, after.parts[0].lanes));
console.log(H.errs); await br.close();
