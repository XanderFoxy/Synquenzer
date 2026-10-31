import { launch, nCur, since, short } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
await p.evaluate(() => historyCheck());
for (const notes of [[61, 63, 66, 68, 70], [60, 62, 64, 65, 67], [62, 64, 66, 69, 71]]) {
  const n0 = await nCur(p);
  const r = await p.evaluate(notes => { const c = SYNQUENZER.getClip(0, 0); const live = S.tracks[0].clips[0]; const same = c === live; c.notes = notes.map((n, i) => ({p: n, s: i * 0.5, l: 0.5, v: 0.8})); SYNQUENZER.setClip(0, 0, c); return {same, notesNow: S.tracks[0].clips[0].notes.map(n => n.p)}; }, notes);
  await p.waitForTimeout(3000);
  const ev = (await since(p, n0)).filter(e => e.u !== 'ctx');
  const sh = await p.evaluate(() => ({sh: HIST.sh.tracks[0].clips[0].notes.map(n => n.p), s: S.tracks[0].clips[0].notes.map(n => n.p), shareS: HIST.sh.tracks[0].clips[0] === S.tracks[0].clips[0]}));
  console.log(JSON.stringify({notes, r, nData: ev.length, ev: ev.map(e => ({u: e.u, d: JSON.stringify(e.d).slice(0, 200)})), sh}));
}
// historyState after each
const st = await p.evaluate(async () => { const h = SYNQUENZER.history(); const out = []; for (let k = 0; k <= h.events; k++) { const s = await historyState(k); out.push(s.tracks[0].clips[0].notes.map(n => n.p).join(',')); } return out; });
console.log('historyState per k', st);
console.log('check', await p.evaluate(() => historyCheck({detail: true})), errs.slice(0, 3));
await b.close();
