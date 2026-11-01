// QA musiker VV2-02: Video entries through the song edits Xander does in the Marken-Blatt / Bereich-Leiste (×2, swap, copy,
// delete, Ersetzen, Auf alle übertragen, Als Teil, Leeren, drag & drop insert), each with undo → deep-equal, redo → same
import { open, buildSong } from './n5-v-qm-lib.mjs';
import fs from 'fs';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-q2-out/';
const {b, p, errs} = await open({touch: true});
await buildSong(p);
const res = {};
// make Strophe and Refrain real parts (Als Teil), then two Refrains
res.prep = await p.evaluate(() => {
  const Q = SYNQUENZER;
  const r1 = Q.songRange('asPart', 2, 5, {name: 'Strophe'}), r2 = Q.songRange('asPart', 6, 9, {name: 'Refrain'});
  const ref = S.song.marks.find(m => m.a === 6);
  const rep = Q.markAction(ref.id, 'rep', 2);
  return {r1: !!r1, r2: !!r2, rep, bars: S.song.bars, marks: S.song.marks.map(m => [m.id, m.a, m.len, m.part || null, markLabel(m)])};
});
const snap = () => p.evaluate(() => JSON.stringify(S.song));
const info = () => p.evaluate(() => ({video: S.song.video ? JSON.parse(JSON.stringify(S.song.video)) : null, bars: S.song.bars, marks: S.song.marks.slice().sort((a, b) => a.a - b.a).map(m => markLabel(m) + '@' + (m.a + 1) + '–' + (m.a + m.len))}));
const step = async (name, fn) => {
  const before = await snap(), i0 = await info();
  const r = await p.evaluate(fn);
  const after = await snap(), i1 = await info();
  await p.evaluate(() => SYNQUENZER.undo()); const und = await snap();
  await p.evaluate(() => SYNQUENZER.redo()); const red = await snap();
  const o = {name, r, before: i0, after: i1, undoEq: und === before, redoEq: red === after};
  res[name] = o; console.log(JSON.stringify(o));
  return o;
};
// directions as Xander sets them: 1st Refrain → Matrix, 2nd Refrain → Spur SYN 2, Strophe → Song
await p.evaluate(() => { const ms = S.song.marks.filter(m => markLabel(m).startsWith('Refrain')).sort((a, b) => a.a - b.a), st = S.song.marks.find(m => markLabel(m).startsWith('Strophe'));
  SYNQUENZER.vvDirSet(ms[0].a, ms[0].a + ms[0].len, 'matrix'); SYNQUENZER.vvDirSet(ms[1].a, ms[1].a + ms[1].len, 'spur', 1); SYNQUENZER.vvDirSet(st.a, st.a + st.len, 'song'); });
res.start = await info(); console.log('start', JSON.stringify(res.start), JSON.stringify(res.prep));
await step('Strophe ×2', () => SYNQUENZER.markAction(S.song.marks.find(m => markLabel(m).startsWith('Strophe')).id, 'rep', 2));
await p.evaluate(() => SYNQUENZER.undo());
await step('Refrain1 swapL', () => SYNQUENZER.markAction(S.song.marks.filter(m => markLabel(m).startsWith('Refrain')).sort((a, b) => a.a - b.a)[0].id, 'swapL'));
await p.evaluate(() => SYNQUENZER.undo());
await step('Refrain1 copy to end', () => SYNQUENZER.markAction(S.song.marks.filter(m => markLabel(m).startsWith('Refrain')).sort((a, b) => a.a - b.a)[0].id, 'copy', S.song.bars));
await p.evaluate(() => SYNQUENZER.undo());
await step('Strophe delete', () => SYNQUENZER.markAction(S.song.marks.find(m => markLabel(m).startsWith('Strophe')).id, 'delete'));
await p.evaluate(() => SYNQUENZER.undo());
await step('Auf alle Refrain übertragen (from 2nd)', () => { const ms = S.song.marks.filter(m => markLabel(m).startsWith('Refrain')).sort((a, b) => a.a - b.a);
  // a small change in the 2nd Refrain first (as when composing), then apply it to all
  return SYNQUENZER.markAction(ms[1].id, 'applyAll'); });
await p.evaluate(() => SYNQUENZER.undo());
await step('Refrain2 Ersetzen durch Strophe', () => { const ms = S.song.marks.filter(m => markLabel(m).startsWith('Refrain')).sort((a, b) => a.a - b.a), st = S.song.marks.find(m => markLabel(m).startsWith('Strophe'));
  return SYNQUENZER.markAction(ms[1].id, 'replaceBy', st.part); });
await p.evaluate(() => SYNQUENZER.undo());
await step('Leeren bars 7-8', () => SYNQUENZER.songRange('clear', 6, 7));
await p.evaluate(() => SYNQUENZER.undo());
await step('placePart Strophe insert at bar 1 (drag & drop path)', () => SYNQUENZER.placePart(S.song.marks.find(m => markLabel(m).startsWith('Strophe')).part, 0, 'insert'));
await p.evaluate(() => SYNQUENZER.undo());
await step('Takte löschen 8-9 (inside 1st Refrain)', () => SYNQUENZER.songRange('delete', 7, 8));
await p.evaluate(() => SYNQUENZER.undo());
res.end = await info();
res.errs = errs;
fs.writeFileSync(OUT + 'edit.json', JSON.stringify(res, null, 1));
console.log('end', JSON.stringify(res.end), 'errs', JSON.stringify(errs));
await b.close();
