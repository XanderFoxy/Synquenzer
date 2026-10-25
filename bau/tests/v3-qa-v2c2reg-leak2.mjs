// V2c′: size of the per-clip map cache (OS.cache.get(clip).maps) over time while a part's chord row changes every beat
import { open, APP } from './v3-v2d-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844}, APP);
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(300); const K = {root: 9, scale: 'aeolian'};
  Q.setClip(0, 0, {len: 1, key: K, notes: [0, 1, 2, 3].map(t => ({t, d: .5, n: [45, 48, 52, 51][t], v: .8}))});
  Q.setClip(1, 0, {len: 1, key: K, notes: [0, 1, 2, 3].map(t => ({t, d: .5, n: [69, 72, 76, 75][t], v: .8}))});
  const ch = ['Am', 'F', 'C', 'G', 'E', 'Dm', 'Bb', 'A'];
  Q.setPart(0, {name: 'A', slots: [{s: 0}, {s: 0}, null, null, null, null], chords: {len: 2, ch: ch.map((c, k) => ({b: k, tg: Q.parseChord(c)}))}});
  Q.launchPart(0); });
for (const t of [10, 30, 60]) {
  await p.waitForTimeout(t === 10 ? 10000 : t === 30 ? 20000 : 30000);
  const r = await p.evaluate(() => { const c0 = S.tracks[0].clips[0], c1 = S.tracks[1].clips[0]; const a = OS.cache.get(c0), b = OS.cache.get(c1);
    return {beat: Math.round(window.SYNQUENZER.runtime().beat), maps0: a ? a.maps.size : null, maps1: b ? b.maps.size : null, timeline: T.timeline.length}; });
  console.log('t', t, 's', JSON.stringify(r));
}
console.log('errs', JSON.stringify(errs)); await b.close();
