import {open, sleep} from './v3-qa-gmk5-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const TR = 2;
await E(t => { SYNQUENZER.setEngine(t, 'mk'); }, TR); await sleep(800);
await E(t => { const Q = SYNQUENZER; Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.latch', 1); Q.mkSet(t, 't.0.f.cut', 33); }, TR);
await E(() => SYNQUENZER.save()); await sleep(600);
console.log(await E(async t => { const Q = SYNQUENZER; Q.mkSet(t, 'arp.latch', 0); Q.mkSet(t, 't.0.f.cut', 77); const s = Q.serialize(); const j = JSON.parse(s); const inSer = [j.project.tracks[t].sound.p.mk.arp.latch, j.project.tracks[t].sound.p.mk.t[0].f.cut]; await Q.load(s); await new Promise(r => setTimeout(r, 800)); return {inSer, after: [Q.mkGet(t).arp.latch, Q.mkGet(t).t[0].f.cut]}; }, TR));
// keyOn with latch then check
console.log('errs', errs);
await T.br.close();
