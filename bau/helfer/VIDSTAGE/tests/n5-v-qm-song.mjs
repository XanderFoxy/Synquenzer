// QA musiker VV1: Xander's song (chords, melody, FM, MS 2000 arp, STIMME take): offline video sound vs live, per track
import { open, buildSong, liveCap, notesOf, diffNotes, OUTQ } from './n5-v-qm-lib.mjs';
import { lufs, pcmOf } from './n5-v-lufs.mjs';
import fs from 'fs';
const {b, p, errs} = await open({touch: true});
const res = {};
res.setup = await buildSong(p);
const off = async range => { const r = await p.evaluate(async range => SYNQUENZER.vvRender(range ? {range} : {}), range || null); const pc = await p.evaluate(() => SYNQUENZER.vvPcm()); return {r, pc}; };
const lv = await liveCap(p, null), of = await off(null);
const a = pcmOf(lv.b64), o = pcmOf(of.pc.b64);
const nl = notesOf(lv.log), no = notesOf(of.r.log), d = diffNotes(nl, no);
const bySrc = l => { const m = {}; for (const x of l) { const k = x[0] + ':' + x[1]; m[k] = (m[k] || 0) + 1; } return m; };
res.song = {liveLUFS: +lufs(a.L, a.R, lv.sr).toFixed(2), offLUFS: +lufs(o.L, o.R, of.pc.sr).toFixed(2), notesLive: nl.length, notesOff: no.length, srcLive: bySrc(nl), srcOff: bySrc(no), onlyLive: d.onlyA.slice(0, 12), onlyOff: d.onlyB.slice(0, 12), nOnlyLive: d.onlyA.length, nOnlyOff: d.onlyB.length, dur: of.r.dur, tail: of.r.tail, songSec: of.r.songSec};
// each track solo
const trk = await p.evaluate(() => S.tracks.map((t, i) => ({i, name: t.name, eng: t.sound ? t.sound.engine : t.kind})));
for (const t of trk) {
  await p.evaluate(i => { window.__mute = S.tracks.map(x => !!x.mute); S.tracks.forEach((x, k) => { x.mute = k !== i; }); }, t.i);
  const l2 = await liveCap(p, null, 3000), o2 = await off(null);
  await p.evaluate(() => { S.tracks.forEach((x, k) => { x.mute = window.__mute[k]; }); });
  const A2 = pcmOf(l2.b64), O2 = pcmOf(o2.pc.b64), la = lufs(A2.L, A2.R, l2.sr), lo = lufs(O2.L, O2.R, o2.pc.sr);
  const n1 = notesOf(l2.log).filter(x => x[0] === t.i), n2 = notesOf(o2.r.log).filter(x => x[0] === t.i), dd = diffNotes(n1, n2);
  res['solo ' + t.i + ' ' + t.name + ' (' + t.eng + ')'] = {liveLUFS: +la.toFixed(2), offLUFS: +lo.toFixed(2), dLU: +(lo - la).toFixed(2), notesLive: n1.length, notesOff: n2.length, onlyLive: dd.onlyA.slice(0, 6), onlyOff: dd.onlyB.slice(0, 6)};
}
console.log(JSON.stringify(res, null, 1)); console.log('errors', errs);
fs.writeFileSync(OUTQ + 'song-' + (process.argv[2] || '1') + '.json', JSON.stringify(res, null, 1));
await b.close();
