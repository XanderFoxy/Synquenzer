// QA musiker VV2-03: Auto cut list for a plain 4-part song (Intro 4, Strophe 8, Refrain 8, Outro 4) built from the demo clips
import { open } from './n5-v-qm-lib.mjs';
const {b, p, errs} = await open({touch: true});
const r = await p.evaluate(() => {
  SYNQUENZER.setSong({bars: 24, lanes: [[{bar: 0, slot: 0}, {bar: 12, slot: 1}, {bar: 20, slot: -1}], [{bar: 4, slot: 0}, {bar: 12, slot: 1}], [{bar: 12, slot: 0}, {bar: 20, slot: -1}], [{bar: 4, slot: 0}, {bar: 12, slot: 1}], [{bar: 0, slot: 1}, {bar: 4, slot: 0}, {bar: 20, slot: 1}], []],
    carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 4, name: 'Intro'}, {id: 'm2', a: 4, len: 8, name: 'Strophe'}, {id: 'm3', a: 12, len: 8, name: 'Refrain'}, {id: 'm4', a: 20, len: 4, name: 'Outro'}]});
  const c = SYNQUENZER.vvCuts(); return {shots: c.shots.map(s => (s.a + 1) + '–' + s.b + ' ' + s.v + (s.t != null ? ':' + S.tracks[s.t].name : '') + ' (' + s.why + ')'), marks: S.song.marks.map(m => m.name + '@' + (m.a + 1))}; });
console.log(JSON.stringify(r), errs); await b.close();
