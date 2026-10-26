// ↶ while a latched arp runs (undo LATCH an / ARP an): stops ≤ 1 step, no stuck voice; ↷ then plays again only with new keys
import {open, sleep, check, done} from './v3-qa-gmk5-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const TR = 2;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await T.openEd(TR); await T.toMk();
await T.tapMk('arp', 300);
await T.w2(/^\d+ ARP B/); await sleep(400);
await T.knobList('k0', /^an$/);
await T.holdKeys([0, 4, 7]); await sleep(200); await T.releaseKeys(); await sleep(800);
const n0 = (await T.alog(TR)).length;
await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 50); const tU = await E(() => AU.ctx.currentTime);
await sleep(800);
const L1 = await T.alog(TR); const late1 = L1.filter(x => x.t > tU + 60 / 112 / 4 + .01);
const v1 = await E(t => SYNQUENZER.voices().filter(v => v.track === t && v.state === 'on').length, TR);
check('Z1 ↶ (LATCH an) while the latched arp runs: stops ≤ 1 step, 0 sounding voices', n0 > 2 && late1.length === 0 && v1 === 0, {n0, after: late1.map(x => [+(x.t - tU).toFixed(3), x.note]), v1, latch: (await T.arp(TR)).latch});
await T.tapTxt('#synthSheet .hb.ur', /^↷$/, 50); await sleep(600);
const n2 = (await T.alog(TR)).length;
check('Z2 ↷ (LATCH an again): the released chord does not come back by itself', n2 === L1.length, {n2, before: L1.length});
await T.holdKeys([2, 5, 9]); await sleep(200); await T.releaseKeys(); await sleep(700);
await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 50); await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 50); const tU2 = await E(() => AU.ctx.currentTime); // undo LATCH, ARP B?, ARP an
await sleep(900);
const L3 = await T.alog(TR); const late3 = L3.filter(x => x.t > tU2 + 60 / 112 / 4 + .01);
const A = await T.arp(TR);
check('Z3 ↶ ×2 back to ARP aus while latched: arp stops, LED off, no stuck voice', late3.length === 0 && !A.on && (await E(t => SYNQUENZER.voices().filter(v => v.track === t && v.state === 'on').length, TR)) === 0 && !(await T.pinfo()).arp.on, {late3: late3.length, A: [A.on, A.latch], led: (await T.pinfo()).arp.on, top: await T.undoTop()});
console.log('errs', JSON.stringify(errs));
check('Z4 no console errors', !errs.length, errs);
await T.br.close(); done();
