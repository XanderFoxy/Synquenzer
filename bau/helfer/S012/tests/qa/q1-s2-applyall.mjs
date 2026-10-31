// S2 part (with song melody) used again: "Auf alle übertragen" / S0 replace → melody doubled?
import {launch, open, sleep, deq, tally} from '../h.mjs';
import {songABA} from '../lib.mjs';
const ok = tally(); const br = await launch();
{
  const H = await open(br), p = H.p;
  await songABA(p);
  await p.evaluate(() => { const D = SYNQUENZER, s = D.project().song; s.mel[3] = {len: s.bars, key: {root: 0, scale: 'ionian'}, notes: [{t: 0.5, d: .5, n: 72, v: .8}, {t: 4.5, d: .5, n: 79, v: .8}]}; D.setSong(s); });
  const r = await p.evaluate(() => SYNQUENZER.sumMark('M1', 'Vers'));
  await p.evaluate(() => SYNQUENZER.placePart('P3', 99, 'insert'));
  const before = await p.evaluate(() => ({mel: S.song.mel[3].notes.map(n => n.t), marks: SYNQUENZER.songMarks()}));
  console.log('after sum+place', JSON.stringify(before));
  // Auf alle übertragen from the copy at T7
  const m7 = before.marks.find(m => m.a === 6);
  await p.evaluate(id => SYNQUENZER.markAction(id, 'applyAll'), m7.id);
  const after = await p.evaluate(() => ({mel: S.song.mel[3].notes.map(n => n.t), part: S.parts[2].mel}));
  console.log('after applyAll', JSON.stringify(after));
  ok(after.mel.length === before.mel.length, 'Auf alle übertragen auf S2-Teil: Melodie-Noten gleich viele ' + before.mel.length + ' → ' + after.mel.length);
  const dup = after.mel.filter((t, i) => after.mel.indexOf(t) !== i);
  ok(!dup.length, 'keine doppelten Melodie-Noten ' + JSON.stringify(dup));
  // audible: the song from bar 0, melody events in T1–2
  await p.evaluate(() => { SYNQUENZER.clearLog(); SYNQUENZER.songPlay(0); });
  await p.waitForFunction(() => R.songPlay && R.playing);
  const b0 = await p.evaluate(() => R.songPlay.off);
  await p.waitForFunction(b0 => audBeat() > b0 + 8.5, b0, {timeout: 20000});
  const ev = await p.evaluate(b0 => SYNQUENZER.noteLog(4096).filter(e => e.src === 'melody' && e.beat < b0 + 8).map(e => [e.out, +(e.beat - b0).toFixed(3)]), b0);
  await p.evaluate(() => SYNQUENZER.stop());
  ok(ev.length === 2, 'hörbar: T1–2 spielt 2 Melodie-Noten (nicht doppelt) ' + JSON.stringify(ev));
  await H.ctx.close();
}
// S1 part with Part.mel placed twice, then „Auf alle übertragen“
{
  const H = await open(br), p = H.p;
  await p.evaluate(() => { const D = SYNQUENZER, nt = D.NT(); D.setBpm(240);
    D.setPart(0, {name: 'Strophe', slots: Array.from({length: nt}, (_, t) => D.getClip(t, 0) ? {s: 0} : -1)});
    S.parts[0].mel = {3: [{t: 1, d: .5, n: 72, v: .8}]}; D.setSong(null); D.placePart('P1', 0, 'insert'); D.placePart('P1', 99, 'insert'); });
  const n0 = await p.evaluate(() => S.song.mel[3].notes.length);
  await p.evaluate(() => SYNQUENZER.markAction(SYNQUENZER.songMarks()[0].id, 'applyAll'));
  const n1 = await p.evaluate(() => S.song.mel[3].notes.map(n => n.t));
  ok(n1.length === n0, 'S1-Teil (Part.mel) zweimal im Song, Auf alle übertragen: Noten ' + n0 + ' → ' + JSON.stringify(n1));
  await H.ctx.close();
}
await br.close(); process.exit(ok.done() ? 1 : 0);
