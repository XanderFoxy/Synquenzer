import {open, OUT, sleep} from './v3-qa-gp2a-lib.mjs';
const T = await open({mic: false}); const {p, E, errs} = T;
console.log(JSON.stringify(await E(() => {
  const Q = SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120);
  Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: .4, n: 60, v: .8}]});
  const nt = Q.tracks().length, L = s => Array.from({length: nt}, (_, t) => [{bar: 0, slot: s[t] == null ? -1 : s[t]}]);
  Q.setPart(0, {name: 'Strophe', lanes: L([0]), len: 2, src: 'fang', chords: {len: 1, ch: [{b: 0, tg: Q.parseChord('C')}]}});
  Q.setSong({bars: 0, lanes: Array.from({length: nt}, () => []), carrier: [], marks: []});
  const r = Q.placePart(0, 0);
  return {r, song: Q.song(), part: Q.parts()[0]};
})));
await T.br.close();
