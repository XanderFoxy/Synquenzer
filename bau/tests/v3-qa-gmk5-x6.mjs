// a new chord pressed just before the heard beat (song running): does the beat get its first arp step (late step)?
import {open, sleep, check, done} from './v3-qa-gmk5-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
const TR = 2;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await E(t => { SYNQUENZER.setEngine(t, 'mk'); }, TR); await sleep(800);
await E(t => { const Q = SYNQUENZER; Q.selectTrack(t); Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 1); SYNQUENZER.clearClip(t, 0); SYNQUENZER.clearClip(t, 1); }, TR);
await E(() => { window.__lv = []; const o = ARPC.live; ARPC.live = function (i, id, n, vel, t) { const r = o.apply(this, arguments); window.__lv.push([n, +t2b(t).toFixed(3), +audBeat().toFixed(3), JSON.stringify(ARPC.info(i))]); return r; }; });
const waitBeat = b => p.waitForFunction(b => audBeat() >= b, b, {timeout: 30000, polling: 2});
await E(() => SYNQUENZER.play()); await sleep(300);
const out = [];
for (const pre of [0.03, 0.01, -0.01, 0.05, 0.03, 0.01, -0.01, 0.05, 0.03, 0.03]) {
  const B = Math.ceil((await E(() => audBeat())) / 4 + .3) * 4 + 4;
  await waitBeat(B - pre); const pb = await E(() => audBeat()); await T.holdKeys([0, 4, 7]);
  await waitBeat(B + 1.2); await T.releaseKeys(); await waitBeat(B + 1.9);
  const L = await E(([B]) => SYNQUENZER.noteLog(300).filter(e => e.track === 2 && e.src === 'arp' && e.beat > B - .3 && e.beat < B + .8).map(e => [+(e.beat - B).toFixed(3), e.out, e.late ? 'L' : '']), [B]);
  out.push({pre, pb: +(pb - B).toFixed(3), first: L.slice(0, 4), lv: await E(() => window.__lv.splice(0).map(x => [x[0], +(x[1]).toFixed(3), x[3]]))});
}
for (const o of out) log(JSON.stringify(o));
const okk = out.map(o => o.first.length && o.first[0][0] < .24 && o.first[0][1] === 60);
check('a chord pressed 10–50 ms before the heard bar line: C (step 1) sounds before the 2nd sixteenth', okk.every(Boolean), out.map(o => [o.pre, o.first.slice(0, 2)]));
await E(() => SYNQUENZER.stop());
log('errs', JSON.stringify(errs));
await T.br.close(); done();
