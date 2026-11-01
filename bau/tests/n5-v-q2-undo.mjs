// QA musiker VV2-02: what differs after undo / redo of a song edit (with and without song.video entries)
import { open, buildSong } from './n5-v-qm-lib.mjs';
const WITH = process.argv[2] !== 'ohne';
const {b, p, errs} = await open({touch: true});
await buildSong(p);
await p.evaluate(() => { const Q = SYNQUENZER; Q.songRange('asPart', 2, 5, {name: 'Strophe'}); Q.songRange('asPart', 6, 9, {name: 'Refrain'}); Q.markAction(S.song.marks.find(m => m.a === 6).id, 'rep', 2); });
if (WITH) await p.evaluate(() => { const ms = S.song.marks.filter(m => markLabel(m).startsWith('Refrain')).sort((a, b) => a.a - b.a), st = S.song.marks.find(m => markLabel(m).startsWith('Strophe'));
  SYNQUENZER.vvDirSet(ms[0].a, ms[0].a + ms[0].len, 'matrix'); SYNQUENZER.vvDirSet(ms[1].a, ms[1].a + ms[1].len, 'spur', 1); SYNQUENZER.vvDirSet(st.a, st.a + st.len, 'song'); });
const diff = (a, b, path = '') => { if (JSON.stringify(a) === JSON.stringify(b)) return []; if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return [path + ': ' + JSON.stringify(a) + ' → ' + JSON.stringify(b)]; const o = []; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o.push(...diff(a[k], b[k], path + '.' + k)); return o.length ? o : [path + ': key order ' + Object.keys(a).join(',') + ' | ' + Object.keys(b).join(',')]; };
const cases = {
  'Strophe ×2': () => SYNQUENZER.markAction(S.song.marks.find(m => markLabel(m).startsWith('Strophe')).id, 'rep', 2),
  'Refrain1 swapL': () => SYNQUENZER.markAction(S.song.marks.filter(m => markLabel(m).startsWith('Refrain')).sort((a, b) => a.a - b.a)[0].id, 'swapL'),
  'Strophe delete': () => SYNQUENZER.markAction(S.song.marks.find(m => markLabel(m).startsWith('Strophe')).id, 'delete'),
  'Leeren 7': () => SYNQUENZER.songRange('clear', 6, 7),
};
for (const [n, fn] of Object.entries(cases)) {
  const before = await p.evaluate(() => JSON.parse(JSON.stringify(S.song)));
  await p.evaluate(fn); const after = await p.evaluate(() => JSON.parse(JSON.stringify(S.song)));
  await p.evaluate(() => SYNQUENZER.undo()); const und = await p.evaluate(() => JSON.parse(JSON.stringify(S.song)));
  await p.evaluate(() => SYNQUENZER.redo()); const red = await p.evaluate(() => JSON.parse(JSON.stringify(S.song)));
  console.log(WITH ? 'MIT video' : 'OHNE video', n, '| undo:', JSON.stringify(diff(before, und)).slice(0, 600), '| redo:', JSON.stringify(diff(after, red)).slice(0, 600));
  await p.evaluate(() => SYNQUENZER.undo());
}
console.log('errs', errs);
await b.close();
