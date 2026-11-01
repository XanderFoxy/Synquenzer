// QA musiker VV2: „Im Video zeigen“ on STIMME, then Spur entfernen (STIMME), then ＋ Spur (a new synth gets index 6): what does the Regie show?
import { open, buildSong } from './n5-v-qm-lib.mjs';
const {b, p, errs} = await open({touch: true});
await buildSong(p, {mk: false});
const r = await p.evaluate(() => {
  const out = {}; const st = stimmeT(); SYNQUENZER.vvDirSet(6, 7, 'spur', st); out.set = {st, video: S.song.video, cuts: SYNQUENZER.vvCuts().shots.map(s => (s.a + 1) + '–' + s.b + ' ' + s.v + (s.t != null ? ':' + s.t : ''))};
  removeTrack(st); out.afterRemove = {nt: NT(), video: S.song.video || null, ofRow: vvDirOf(6, 7)};
  out.addOk = typeof addTrack === 'function' ? addTrack() : null;
  out.afterAdd = {nt: NT(), names: S.tracks.map(t => t.name), video: S.song.video || null, ofRow: vvDirOf(6, 7), cuts: SYNQUENZER.vvCuts().shots.map(s => (s.a + 1) + '–' + s.b + ' ' + s.v + (s.t != null ? ':' + S.tracks[s.t].name : ''))};
  return out; });
console.log(JSON.stringify(r, null, 1), errs); await b.close();
