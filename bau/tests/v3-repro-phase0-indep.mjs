import { open } from './v3-qa-v2d-lib.mjs';
const {b, E, errs, waitBeat} = await open();
const listen = async (track, bars) => { await E(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); }); await waitBeat(bars * 4 - .5);
  const r = await E(t => window.SYNQUENZER.noteLog(500).filter(n => n.track === t && n.beat != null).map(n => [Math.floor(n.beat / 4 + 1e-3) + 1, n.out]), track);
  await E(() => window.SYNQUENZER.stop()); return r.map(x => x[0] + ':' + x[1]).join(' '); };
const setupPad = () => E(() => { const Q = window.SYNQUENZER, K = {root: 9, scale: 'aeolian'}; Q.stop(); Q.newProject({init: true}); Q.setBpm(240);
  Q.setClip(1, 3, {len: 3, key: K, notes: [{t: 0, d: 2, n: 62, v: .8}, {t: 4, d: 2, n: 64, v: .8}, {t: 8, d: 2, n: 65, v: .8}]});
  Q.setSong({bars: 9, lanes: [[], [{bar: 0, slot: 3}], [], [], [], []], carrier: []}); return 1; });
const lane = t => E(t => JSON.stringify(window.SYNQUENZER.song().lanes[t]), t);
for (const [a, bb, why] of [[1, 1, 'delete T2 only (Zustand_alt(b=2) ph=8, control)'], [1, 2, 'delete T2-T3 (Zustand_alt(b=3) ph=0)'], [1, 3, 'delete T2-T4 (ph=4, control)'], [4, 5, 'delete T5-T6 (Zustand_alt(b=6) ph=0)']]) {
  await setupPad();
  if (a === 1 && bb === 1) console.log('orig     ', await listen(1, 9));
  await E(([a, bb]) => window.SYNQUENZER.songRange('delete', a, bb), [a, bb]);
  const bars = await E(() => window.SYNQUENZER.song().bars);
  console.log(why, 'bars', bars, 'lane', await lane(1));
  console.log('   heard ', await listen(1, bars));
}
// insert with bleibt-track: control at n=3 (ph 4) vs n=2 (ph 0)
for (const n of [2, 3]) {
  await E(() => { const Q = window.SYNQUENZER, K = {root: 9, scale: 'aeolian'}; Q.stop(); Q.newProject({init: true}); Q.setBpm(240);
    Q.setClip(4, 1, {len: 2, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 4, d: .1, n: 38, v: .9}]});
    Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .5, n: 45, v: .8}]});
    Q.setSong({bars: 6, lanes: [[], [], [], [], [{bar: 0, slot: 1}], []], carrier: []});
    Q.setPart(0, {name: 'Strophe', slots: [{s: 0}, null, null, null, null, null]}); return 1; });
  await E(n => window.SYNQUENZER.placePart(0, n, 'insert'), n);
  const bars = await E(() => window.SYNQUENZER.song().bars);
  console.log('insert Strophe(1 bar, drums bleibt) at T' + (n + 1), 'bars', bars, 'drums lane', await lane(4), 'synth1 lane', await lane(0));
  const s = await listen(4, bars); console.log('   heard ', s.replace(/:36/g, ':K').replace(/:38/g, ':S'));
}
console.log('errs', errs);
await b.close();
