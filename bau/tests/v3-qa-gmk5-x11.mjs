// mute → unmute mid-chord (clip chord 2 bars), arp on vs off: when does the track sound again?
import {open, sleep, check, done} from './v3-qa-gmk5-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
const TR = 2;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await E(t => { SYNQUENZER.setEngine(t, 'mk'); }, TR); await sleep(800);
await E(t => { const Q = SYNQUENZER; Q.mkSet(t, 't.0.e2.a', 0); Q.mkSet(t, 't.0.e2.s', 100); Q.mkSet(t, 't.0.e2.r', 10); SYNQUENZER.setClip(t, 0, {len: 2, notes: [60, 64, 67].map(n => ({t: 0, d: 7.8, n, v: .7}))}); }, TR);
const lvl = ms => T.capT(TR, ms).then(c => { const n = Math.round(c.sr * .1), out = []; for (let i = 0; i + n <= c.l.length; i += n) { let s = 0; for (let k = i; k < i + n; k++) s += c.l[k] * c.l[k]; out.push(Math.round(10 * Math.log10(s / n + 1e-20))); } return out; });
const out = {};
for (const arp of [0, 1]) {
  await E(([t, a]) => SYNQUENZER.mkSet(t, 'arp.on', a), [TR, arp]);
  await E(() => { SYNQUENZER.stop(); SYNQUENZER.launchScene(0); SYNQUENZER.play(); }); await sleep(1200);
  await E(t => SYNQUENZER.setMute(t, true), TR); await sleep(600); await E(t => SYNQUENZER.setMute(t, false), TR);
  const L = await lvl(2000);
  out[arp ? 'arp on' : 'arp off'] = L;
  log(arp ? 'ARP on ' : 'ARP off', 'after unmute (level/100 ms):', L.join(' '));
}
await E(() => SYNQUENZER.stop());
check('M1 unmute mid-chord: the track sounds again within 0.3 s like without arp', out['arp on'].slice(3).every(v => v > -50) === out['arp off'].slice(3).every(v => v > -50), out);
log('errs', JSON.stringify(errs));
await T.br.close(); done();
