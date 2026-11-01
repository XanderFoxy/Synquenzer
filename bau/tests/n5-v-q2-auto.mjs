// QA musiker VV2-03: the Auto-Regisseur on Xander's song without any entries — where are the cuts vs the part starts?
import { open, buildSong } from './n5-v-qm-lib.mjs';
const {b, p, errs} = await open({touch: true});
await buildSong(p, {bars: +(process.argv[2] || 12)});
const r = await p.evaluate(() => { const c = SYNQUENZER.vvCuts(); return {marks: S.song.marks.map(m => m.name + '@' + (m.a + 1) + '–' + (m.a + m.len)), shots: c.shots.map(s => (s.a + 1) + '–' + s.b + ' ' + s.v + (s.t != null ? ':' + S.tracks[s.t].name : '') + ' (' + s.why + ')'), hash: c.hash,
  lanes: S.song.lanes.map((l, t) => S.tracks[t].name + ': ' + l.map(e => (e.bar + 1) + '→' + e.slot).join(' '))}; });
console.log(JSON.stringify(r, null, 1), errs);
await b.close();
