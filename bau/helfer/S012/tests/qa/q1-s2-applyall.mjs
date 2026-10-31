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
  await H.ctx.close();
}
await br.close(); process.exit(ok.done() ? 1 : 0);
