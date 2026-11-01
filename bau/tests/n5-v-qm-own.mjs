// QA musiker VV1: own clips in the song (makeOwn, then edited) — video sound = live; Song picture frames them; Matrix shows them
import { open, buildSong, liveCap, notesOf, diffNotes } from './n5-v-qm-lib.mjs';
import { lufs, pcmOf } from './n5-v-lufs.mjs';
const {b, p, errs} = await open({touch: true});
await buildSong(p, {take: false});
const mk = await p.evaluate(async () => { const A = SYNQUENZER; const r1 = A.makeOwn(1, 6, false); const c = A.ownClip(1, 6);
  // edit the own clip: transpose its notes up an octave (as a musician would vary the chorus)
  const id = (S.song.lanes[1].find(e => e.bar === 6) || {}).own; if (id && S.song.own[id]) { for (const n of S.song.own[id].notes) n.n += 12; songChanged(); }
  await new Promise(r => setTimeout(r, 300)); return {r1: !!r1, id, lane: S.song.lanes[1], notes: id ? S.song.own[id].notes.length : 0}; });
console.log('own', JSON.stringify(mk));
const lv = await liveCap(p, null, 3000);
const of = await p.evaluate(async () => SYNQUENZER.vvRender({})); const pc = await p.evaluate(() => SYNQUENZER.vvPcm());
const nl = notesOf(lv.log).filter(x => x[0] === 1), no = notesOf(of.log).filter(x => x[0] === 1), d = diffNotes(nl, no);
const a = pcmOf(lv.b64), o = pcmOf(pc.b64);
console.log(JSON.stringify({liveLUFS: +lufs(a.L, a.R, lv.sr).toFixed(2), offLUFS: +lufs(o.L, o.R, pc.sr).toFixed(2), t1Live: nl.length, t1Off: no.length, onlyLive: d.onlyA.slice(0, 5), onlyOff: d.onlyB.slice(0, 5), srcs: [...new Set(of.log.filter(e => e.track === 1).map(e => e.src))]}));
const t = (6 * 4 + 1) * 60 / 112;
console.log('stateAt bar 7', JSON.stringify(await p.evaluate(t => { const st = SYNQUENZER.vvStateAt(t); return {slot1: st.slots[1], own1: st.own[1]}; }, t)));
console.log('errors', errs);
await b.close();
