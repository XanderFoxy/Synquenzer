// G-MK5 fix: touch chord (CDP, 3 fingers) around the heard bar line, many repeats; logs press, key times, planned/cancelled arp voices
import {open, sleep, check, done} from './v3-qa-gmk5-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const TR = 2, RES = +(process.env.RES || 1), KS = +(process.env.KS || 0);
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await E(t => { SYNQUENZER.setEngine(t, 'mk'); }, TR); await sleep(800);
await E(([t, r, k]) => { const Q = SYNQUENZER; Q.selectTrack(t); Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', r); if (k) Q.mkSet(t, 'arp.ks', 1); Q.clearClip(t, 0); Q.clearClip(t, 1); }, [TR, RES, KS]);
await E(() => { window.__lv = []; const o = ARPC.live; ARPC.live = function (i, id, n, vel, t) { const r = o.apply(this, arguments); window.__lv.push([n, +t2b(t).toFixed(3), +audBeat().toFixed(3)]); return r; };
  window.__sv = []; const o2 = window.spawnVoice; window.spawnVoice = function (i, n, vel, t, oo) { const v = o2.apply(this, arguments); if (oo && oo.src === 'arp') { const rec = [+t2b(t).toFixed(3), n, +audBeat().toFixed(3), 0]; window.__sv.push(rec); if (v) { const c = v.cancel.bind(v); v.cancel = function () { rec[3] = +audBeat().toFixed(3); return c(); }; } } return v; }; });
const waitBeat = b => p.waitForFunction(b => audBeat() >= b, b, {timeout: 30000, polling: 2});
await E(() => SYNQUENZER.play()); await sleep(300);
const out = []; const N = +(process.env.N || 16), stepB = [1/24,1/16,1/12,1/8,1/6,1/4][RES] * 4;
for (let k = 0; k < N; k++) {
  const pre = [0.03, 0.01, -0.01, 0.0][k % 4];
  const B = Math.ceil((await E(() => audBeat())) / 4 + .3) * 4 + 4;
  await waitBeat(B - pre); const pb = await E(() => audBeat()); await T.holdKeys([0, 4, 7]);
  await waitBeat(B + 1.2); await T.releaseKeys(); await waitBeat(B + 1.9);
  const L = await E(([B]) => SYNQUENZER.noteLog(300).filter(e => e.track === 2 && e.src === 'arp' && e.beat > B - .3 && e.beat < B + .8).map(e => [+(e.beat - B).toFixed(3), e.out, e.late ? 'L' : '']), [B]);
  const lv = await E(B => window.__lv.splice(0).map(x => [x[0], +(x[2] - B).toFixed(3)]), B);
  const sv = await E(B => window.__sv.splice(0).filter(x => x[0] > B - .3 && x[0] < B + .6).map(x => [+(x[0] - B).toFixed(3), x[1], +(x[2] - B).toFixed(3), x[3] ? +(x[3] - B).toFixed(3) : 0]), B);
  out.push({pre, pb: +(pb - B).toFixed(3), first: L.slice(0, 3), lv, sv});
}
for (const o of out) console.log(JSON.stringify(o));
// a press after the bar line by more than the late window (0.4 step / 60 ms) legitimately joins the next step
const inWin = o => o.lv.length && o.lv[0][1] * 60 / 112 < Math.min(.06, .4 * stepB * 60 / 112) - .005;
const ok = o => !inWin(o) || (o.first.length && o.first[0][0] < stepB - .01 && o.first[0][1] === 60);
check('touch chord on the heard bar line: step 1 (C) sounds before the 2nd step (' + out.filter(ok).length + '/' + out.length + ', in window ' + out.filter(inWin).length + ')', out.every(ok), out.filter(o => !ok(o)));
await E(() => SYNQUENZER.stop());
console.log('errs', JSON.stringify(errs));
await T.br.close(); done();
