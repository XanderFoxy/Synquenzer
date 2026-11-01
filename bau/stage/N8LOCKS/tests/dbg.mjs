import {open} from './lib.mjs';
import fs from 'fs';
const src = fs.readFileSync('i2b-abnahme.mjs', 'utf8'); const helper = src.slice(src.indexOf('await p.evaluate(() => {'), src.indexOf('/* ---------- Gleichheit'));
const {b, p} = await open();
await eval('(async () => {' + helper + '})()');
const r = await p.evaluate(async () => {
  const s = __va(), lk = [__wi('cutoff'), 3000, __wi('o1w'), 1]; s.p.poly = 1;
  const C = await __ren(s, [{k: 'on', id: 1, n: 57, t: .02, lk}, {k: 'on', id: 2, n: 60, t: .2}, {k: 'off', id: 1, t: .3}, {k: 'off', id: 2, t: .5}], {sec: .7, probe: 64});
  const D = await __ren(s, [{k: 'on', id: 1, n: 57, t: .02}, {k: 'on', id: 2, n: 60, t: .2}, {k: 'off', id: 1, t: .3}, {k: 'off', id: 2, t: .5}], {sec: .7, probe: 64});
  const w = [[.19, .2], [.2, .21], [.21, .25], [.25, .3], [.3, .5], [.5, .7]].map(([a, b]) => [a, __cmp(D, C, a, b).toFixed(1)]);
  const rc = C.reps.filter(m => m.f / 48000 > .25 && m.f / 48000 < .27).map(m => m.lkRep), rd = D.reps.filter(m => m.f / 48000 > .25 && m.f / 48000 < .27).map(m => m.lkRep);
  const t = S.tracks.findIndex(x => x.kind === 'synth'), sp = spb(), early = .010 / sp;
  SYNQUENZER.setClip(t, 0, {len: 1, notes: [{t: 1 - early, d: .2, n: 60, v: .8}], ln: [{p: 'cutoff', len: 16, g: '1/16', st: [{i: 3, v: .3}, {i: 4, v: .8}]}]});
  const X = SYNQUENZER.lkNoteX(t, 0, 0, 1 - early);
  return {w, rc: rc[0], rd: rd[0], X, y5: __eu('cutoff', .8)};
});
console.log(JSON.stringify(r, null, 0).slice(0, 2500));
await b.close();
