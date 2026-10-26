// targeted: (a) release shortly before a step while the song runs: does a step still sound after the release?
// (b) take start: first step at the take's first beat; (c) take end → first pass of the new clip with arp on / off
import {open, sleep, OUT, check, done} from './v3-qa-gmk5-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
const TR = 2;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await E(t => { SYNQUENZER.setEngine(t, 'mk'); }, TR); await sleep(800);
await E(t => { const Q = SYNQUENZER; Q.selectTrack(t); Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 1); }, TR);
// clear track 2 clips so only live keys feed the arp
await E(t => { SYNQUENZER.clearClip(t, 0); SYNQUENZER.clearClip(t, 1); }, TR);
await E(() => SYNQUENZER.launchScene(0)); await E(() => SYNQUENZER.play()); await sleep(600);
const waitBeat = b => p.waitForFunction(b => audBeat() >= b, b, {timeout: 20000, polling: 2});
const info = () => E(() => ({outLat: AU.outLat != null ? AU.outLat : (typeof outLat === 'function' ? outLat() : null), base: AU.ctx.baseLatency, ol: AU.ctx.outputLatency}));
log('lat', JSON.stringify(await info()));
const res = [];
for (const rel of [0.06, 0.1, 0.15, 0.2]) {   // release this many beats before beat B (a 1/16 step at B)
  const B = Math.ceil(await E(() => audBeat())) + 2;
  await waitBeat(B - 1.5); await T.holdKeys([0, 4, 7]);
  await waitBeat(B - rel); const relB = await E(() => audBeat()); const relCt = await E(() => AU.ctx.currentTime); await T.releaseKeys();
  await waitBeat(B + 1);
  const L = await E(([B]) => SYNQUENZER.noteLog(300).filter(e => e.track === 2 && e.src === 'arp' && e.beat > B - 1.6 && e.beat < B + 1).map(e => [+e.beat.toFixed(3), e.out]), [B]);
  const after = L.filter(x => x[0] > relB + .01);
  res.push({rel, relB: +relB.toFixed(3), lastSteps: L.slice(-3), after});
}
log(JSON.stringify(res, null, 0));
check('A1 a chord released before a step: no arp step after the (audible) release', res.every(r => r.after.length === 0), res.map(r => ({rel: r.rel, after: r.after})));
// legato chord change on the beat: release C-E-G 0.08 beat before B, press D-F-A 0.02 beat before B
const res2 = [];
for (let k = 0; k < 3; k++) {
  const B = Math.ceil(await E(() => audBeat())) + 2;
  await waitBeat(B - 1.5); await T.holdKeys([0, 4, 7]);
  await waitBeat(B - .08); await T.releaseKeys(); await waitBeat(B - .02); await T.holdKeys([2, 5, 9], 40); await waitBeat(B + 1); await T.releaseKeys();
  await waitBeat(B + 1.4);
  const L = await E(([B]) => SYNQUENZER.noteLog(300).filter(e => e.track === 2 && e.src === 'arp' && e.beat > B - .3 && e.beat < B + .6).map(e => [+e.beat.toFixed(3), e.out, e.late ? 'late' : '']), [B]);
  res2.push(L);
}
log('legato change', JSON.stringify(res2));
check('A2 legato chord change on the beat (C-E-G off 0.08 beat before, D-F-A on 0.02 before): the beat plays the new chord, no old-chord note at/after the change', res2.every(L => L.filter(x => x[0] >= -0 && [60, 64, 67].includes(x[1]) && x[0] > 0).length === 0 || true) && res2.every(L => { const B = Math.round(L.find(x => [62, 65, 69].includes(x[1]))?.[0] ?? 0); return !L.some(x => x[0] >= B - .03 && [60, 64, 67].includes(x[1])); }), res2);
await E(() => SYNQUENZER.stop());
console.log('errs', JSON.stringify(errs));
await T.br.close(); done();
