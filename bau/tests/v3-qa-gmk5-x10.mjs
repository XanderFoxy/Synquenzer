// ARP key on/off while a chord is held (live keys by touch, and a clip chord while the song plays): what sounds?
import {open, sleep, check, done} from './v3-qa-gmk5-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
const TR = 2;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await T.openEd(TR); await T.toMk();
await E(t => { const Q = SYNQUENZER; Q.mkSet(t, 't.0.e2.a', 0); Q.mkSet(t, 't.0.e2.s', 100); Q.mkSet(t, 't.0.e2.r', 10); }, TR);
const lvl = ms => T.capT(TR, ms).then(c => { const n = Math.round(c.sr * .1), out = []; for (let i = 0; i + n <= c.l.length; i += n) { let s = 0; for (let k = i; k < i + n; k++) s += c.l[k] * c.l[k]; out.push(Math.round(10 * Math.log10(s / n + 1e-20))); } return out; });
const tv = () => E(t => SYNQUENZER.voices().filter(v => v.track === t && v.state !== 'released').map(v => v.src + v.out), TR);
// A: transport stopped, hold C-E-G (touch) with ARP on, tap ARP off while holding
await T.tapMk('arp', 300);
await T.holdKeys([0, 4, 7]); await sleep(600);
const vA0 = await tv();
const capA = lvl(1500); await sleep(300);
// tap ARP with a 4th finger (the keys stay held)
const ar = await T.mk('arp');
await T.send('touchStart', [{x: (await T.key(0)).cx, y: (await T.key(0)).cy, id: 20}, {x: (await T.key(4)).cx, y: (await T.key(4)).cy, id: 21}, {x: (await T.key(7)).cx, y: (await T.key(7)).cy, id: 22}, {x: ar.cx, y: ar.cy, id: 30}]);
await sleep(60);
await T.send('touchEnd', [{x: (await T.key(0)).cx, y: (await T.key(0)).cy, id: 20}, {x: (await T.key(4)).cx, y: (await T.key(4)).cy, id: 21}, {x: (await T.key(7)).cx, y: (await T.key(7)).cy, id: 22}]);
await sleep(100);
const onA = (await T.arp(TR)).on;
// the CDP touchEnd above lists the remaining touches → keys still held; check voices
await sleep(500);
const vA1 = await tv(); const LA = await capA;
await T.releaseKeys(); await sleep(400);
log('A arp on→off while holding C-E-G: arp.on', onA, 'voices before', JSON.stringify(vA0), 'after', JSON.stringify(vA1), 'level/100ms', LA.join(' '));
// B: ARP off, hold keys, tap ARP on while holding
await E(t => SYNQUENZER.mkSet(t, 'arp.on', 0), TR); await sleep(200);
await T.holdKeys([0, 4, 7]); await sleep(400);
const vB0 = await tv();
await E(() => ARPC.clearLog());
await E(t => { MKUI.arpKey(); }, TR); await sleep(800);
const vB1 = await tv(); const lB = await T.alog(TR);
await T.releaseKeys(); await sleep(400);
log('B arp off→on while holding: voices before', JSON.stringify(vB0), 'after', JSON.stringify(vB1), 'arp notes', lB.length);
// C: song plays the pad clip (chord 2 bars), ARP off mid-chord
await E(t => { SYNQUENZER.mkSet(t, 'arp.on', 1); SYNQUENZER.setClip(t, 0, {len: 2, notes: [60, 64, 67].map(n => ({t: 0, d: 7.8, n, v: .7}))}); }, TR);
await E(() => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); }); await sleep(1500);
const capC = lvl(2500); await sleep(800);
await E(() => MKUI.arpKey());
const LC = await capC; const vC = await tv();
log('C clip chord, ARP off mid-chord: level/100ms', LC.join(' '), 'voices', JSON.stringify(vC));
// D: ARP on again mid-chord
await sleep(300);
const capD = lvl(2000); await sleep(500); await E(() => ARPC.clearLog()); await E(() => MKUI.arpKey()); await sleep(1200);
const LD = await capD; const lD = await T.alog(TR);
log('D clip chord, ARP on mid-chord: level/100ms', LD.join(' '), 'arp notes within 1.2 s', lD.length, 'voices', JSON.stringify(await tv()));
await E(() => SYNQUENZER.stop());
check('X1 ARP off while live keys are held: the held keys keep sounding (normal notes)', vA1.some(s => /^live/.test(s)) || LA.slice(-4).every(v => v > -50), {vA1, LA});
check('X2 ARP off while a clip chord plays: the chord keeps sounding (no silence until the next chord)', LC.slice(-12).every(v => v > -50), LC);
check('X3 ARP on while a clip chord sounds: the arp starts ≤ 1 step', lD.length >= 3, lD.length);
log('errs', JSON.stringify(errs));
await T.br.close(); done();
