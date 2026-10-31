// QA musiker VV1: yellow selection inside a part with a chord before it; live transposition before the video; video vs live notes
import { open, buildSong, liveCap, notesOf, diffNotes, OUTQ } from './n5-v-qm-lib.mjs';
import { lufs, pcmOf } from './n5-v-lufs.mjs';
const {b, p, errs} = await open({touch: true});
await buildSong(p, {take: false});
const off = async range => { const r = await p.evaluate(async range => SYNQUENZER.vvRender(range ? {range} : {}), range || null); const pc = await p.evaluate(() => SYNQUENZER.vvPcm()); return {r, pc}; };
const cmp = async (tag, range, sel) => {
  const lv = await liveCap(p, range, 3000);
  if (sel) await p.evaluate(r => SYNQUENZER.songSelect(r.a, r.b - 1), range);
  const rg = sel ? await p.evaluate(() => vvRange(true)) : range;
  const of = await off(rg);
  if (sel) await p.evaluate(() => SYNQUENZER.songSelect(null));
  const nl = notesOf(lv.log), no = notesOf(of.r.log), d = diffNotes(nl, no);
  const a = pcmOf(lv.b64), o = pcmOf(of.pc.b64);
  const out = {tag, range: rg, liveLUFS: +lufs(a.L, a.R, lv.sr).toFixed(2), offLUFS: +lufs(o.L, o.R, of.pc.sr).toFixed(2), notesLive: nl.length, notesOff: no.length, nOnlyLive: d.onlyA.length, nOnlyOff: d.onlyB.length, onlyLive: d.onlyA.slice(0, 8), onlyOff: d.onlyB.slice(0, 8)};
  console.log(JSON.stringify(out)); return out;
};
await cmp('sel bars 8-10 (Am set at bar 7)', {a: 7, b: 10}, true);
await cmp('sel bars 12 (F at bar 11)', {a: 11, b: 12}, true);
// live transposition before (kb transpose mode, key D)
await p.evaluate(() => { SYNQUENZER.setKbMode('transpose'); SYNQUENZER.keyOn(62); SYNQUENZER.keyOff(62); SYNQUENZER.setKbMode('play'); });
await p.waitForTimeout(300);
console.log('carrier now', await p.evaluate(() => JSON.stringify(T.current())));
await cmp('whole song after a live transposition', null, false);
await cmp('sel bars 3-6 after a live transposition', {a: 2, b: 6}, true);
console.log('errors', errs);
await b.close();
