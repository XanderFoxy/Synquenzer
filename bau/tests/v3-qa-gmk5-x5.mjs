// release before a step during ● REC vs plain play: does the next step still sound? (instrument liveUp)
import {open, sleep, check, done} from './v3-qa-gmk5-tl.mjs';
const REC = process.argv[2] === 'rec';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
const TR = 2;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await E(t => { SYNQUENZER.setEngine(t, 'mk'); }, TR); await sleep(800);
await E(t => { const Q = SYNQUENZER; Q.selectTrack(t); Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 1); SYNQUENZER.clearClip(t, 0); SYNQUENZER.clearClip(t, 1); }, TR);
await E(() => { window.__up = []; const o = ARPC.liveUp; ARPC.liveUp = function (i, id, t) { window.__up.push([id, +t2b(t).toFixed(3), +audBeat().toFixed(3), +t2b(AU.ctx.currentTime).toFixed(3)]); return o.apply(this, arguments); }; });
log('LIVE_LEAD', await E(() => LIVE_LEAD), 'outLat', await E(() => AU.outLat));
const waitBeat = b => p.waitForFunction(b => audBeat() >= b, b, {timeout: 30000, polling: 2});
if (REC) { await E(t => SYNQUENZER.tapSlot(t, 2), TR); await sleep(200); await T.tapSel('#bRec', 50); await p.waitForFunction(() => SYNQUENZER.runtime().rec.state === 'recording', null, {timeout: 8000, polling: 5}); }
else { await E(() => SYNQUENZER.play()); await sleep(300); }
const out = [];
for (const rel of [0.15, 0.2, 0.3, 0.15, 0.2, 0.3]) {
  const B = Math.ceil(await E(() => audBeat())) + 2;
  await waitBeat(B - 1.5); await T.holdKeys([0, 4, 7]);
  await waitBeat(B - rel); const rb = await E(() => audBeat()); await T.releaseKeys();
  await waitBeat(B + .6);
  const L = await E(([B]) => SYNQUENZER.noteLog(300).filter(e => e.track === 2 && e.src === 'arp' && e.beat > B - .3 && e.beat < B + .6).map(e => [+e.beat.toFixed(3), e.out]), [B]);
  out.push({rel, B, rb: +rb.toFixed(3), notes: L, ups: await E(() => window.__up.splice(0))});
}
for (const o of out) log(JSON.stringify(o));
check((REC ? 'during ● REC' : 'plain play') + ': chord released ≥ 0.15 beat (80 ms) before a step → no step at/after B', out.every(o => !o.notes.some(x => x[0] >= o.B - .01)), out.map(o => [o.rel, o.notes.filter(x => x[0] >= o.B - .01)]));
await E(() => SYNQUENZER.stop());
log('errs', JSON.stringify(errs));
await T.br.close(); done();
