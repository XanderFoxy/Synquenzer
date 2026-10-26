import {open, sleep} from './v3-qa-gmk5-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const TR = 2;
await E(t => { SYNQUENZER.setEngine(t, 'mk'); }, TR); await sleep(800);
console.log(await E(t => { const Q = SYNQUENZER; Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.latch', 1); const a = Q.mkGet(t).arp.latch; Q.mkSet(t, 'arp.latch', 0); const b = Q.mkGet(t).arp.latch; const ser = JSON.parse(Q.serialize()); const tr = (ser.project || ser).tracks[t]; return [a, b, tr.sound.p.mk.arp.latch, Object.keys(ser)]; }, TR));
console.log(await E(async t => { const Q = SYNQUENZER; Q.mkSet(t, 'arp.latch', 1); Q.mkSet(t, 'arp.latch', 0); const s = Q.serialize(); await Q.load(s); return Q.mkGet(t).arp.latch; }, TR));
console.log(await E(async t => { const Q = SYNQUENZER; Q.mkSet(t, 'arp.latch', 1); Q.panic(); Q.mkSet(t, 'arp.latch', 0); Q.panic(); const s = Q.serialize(); await Q.load(s); return Q.mkGet(t).arp.latch; }, TR));
console.log('errs', errs);
await T.br.close();
