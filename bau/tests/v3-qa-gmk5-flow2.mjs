// QA G-MK5 flow 2 (touch): ● REC a take with the arp on (Zufall, 1/16), the clip holds the pressed keys; playback = the same arpeggio;
// scene switches with arp clips, no stuck note; ECO keeps arpeggiating
import {open, sleep, OUT, check, done} from './v3-qa-gmk5-tl.mjs';
const L = process.argv[2] === 'L', TAG = L ? 'L' : 'P';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
const TR = 2;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await T.openEd(TR); await T.toMk();
await E(t => { const Q = SYNQUENZER; Q.mkSet(t, 't.0.e2.a', 0); Q.mkSet(t, 't.0.e2.d', 40); Q.mkSet(t, 't.0.e2.s', 90); Q.mkSet(t, 't.0.e2.r', 10); }, TR);
await T.tapMk('arp', 300);
await T.w2(/^\d+ ARP A/); await sleep(300);
log('TYP', await T.knobList('k3', /^Zufall$/));
log('AUFL', await T.knobList('k1', /^1\/16$/));
const A = await T.arp(TR); log('arp', JSON.stringify(A));
await T.closePop(); await T.tapTxt('#synthSheet button', /^✕$/); await sleep(500);
// select the empty slot track 2 / scene 3 (tap on the grid cell) and press ● (touch)
await E(t => SYNQUENZER.tapSlot(t, 2), TR); await sleep(300);
log('sel', JSON.stringify(await E(() => ({t: R.selT, s: R.selS}))));
const u0 = await T.undoN();
await T.tapSel('#bRec', 50);
log('rec state', JSON.stringify(await E(() => SYNQUENZER.runtime().rec)));
// wait for the end of the count-in (bar 1)
await p.waitForFunction(() => SYNQUENZER.runtime().rec.state === 'rec' || SYNQUENZER.runtime().rec.state === 'recording', null, {timeout: 8000, polling: 10}).catch(() => {});
log('rec state 2', JSON.stringify(await E(() => SYNQUENZER.runtime().rec)));
const beatNow = () => E(() => audBeat());
const waitBeat = b => p.waitForFunction(b => audBeat() >= b, b, {timeout: 20000, polling: 5});
const b0 = await E(() => SYNQUENZER.runtime().rec.startBeat);
await waitBeat(b0 - 0.02); await T.holdKeys([0, 4, 7]); await waitBeat(b0 + 1.9); await T.releaseKeys();
await waitBeat(b0 + 2 - 0.02); await T.holdKeys([2, 5, 9]); await waitBeat(b0 + 3.9); await T.releaseKeys();
await waitBeat(b0 + 4 - 0.02); await T.holdKeys([4, 7, 11]); await waitBeat(b0 + 7.9); await T.releaseKeys();
await waitBeat(b0 + 8.2);
const takeArp = await E(b0 => SYNQUENZER.noteLog(600).filter(e => e.track === 2 && e.src === 'arp' && e.beat >= b0 - .1 && e.beat < b0 + 8).map(e => [+(e.beat - b0).toFixed(3), e.out]), b0);
await T.tapSel('#bRec', 100);   // ● again: finish the take
log('after 2nd ●', JSON.stringify(await E(() => SYNQUENZER.runtime().rec)));
await p.waitForFunction(() => SYNQUENZER.runtime().rec.state === 'off', null, {timeout: 12000, polling: 20}).catch(() => log('rec did not end'));
log('ended at beat', await beatNow());
const st = await E(() => SYNQUENZER.runtime().rec);
const clip = await E(t => SYNQUENZER.getClip(t, 2), TR);
log('rec end', JSON.stringify(st && st.state), 'clip', JSON.stringify(clip && {len: clip.len, notes: clip.notes.map(n => [+n.t.toFixed(2), n.n, +n.d.toFixed(2)])}));
const du = (await T.undoN()) - u0; const top = await T.undoTop();
check('R1 ● with arp (touch): the clip holds the pressed keys (C E G · D F A · E G B), one undo', clip && clip.notes.map(n => n.n).sort((a, b) => a - b).join() === [60, 64, 67, 62, 65, 69, 64, 67, 71].sort((a, b) => a - b).join() && du === 1, {du, top, notes: clip && clip.notes.map(n => [+n.t.toFixed(2), n.n])});
log('take arp', JSON.stringify(takeArp));
// let the recorded clip loop: compare playback arpeggio with the take
await sleep(200);
const playing = await E(() => SYNQUENZER.runtime().playing);
log('playing', playing, JSON.stringify(await E(() => ({slot: R.slot, pend: R.pend.map(x => x && x.slot)}))));
// the new clip (2 bars) plays at once (rec finish launches it) → wait 2 passes
let cs = await E(t => R.cstart[t], TR);
log('cstart', cs, 'beat', await beatNow());
const CL = clip.len * 4;
if (cs < await beatNow() - 1) { const bn = await beatNow(); cs = cs + Math.ceil((bn - cs) / CL) * CL; }
log('pass start', cs);
await waitBeat(cs + 3 * CL + .3);
const pass = k => E(([cs, k, CL]) => SYNQUENZER.noteLog(800).filter(e => e.track === 2 && e.src === 'arp' && e.beat >= cs + k * CL - .01 && e.beat < cs + (k + 1) * CL - .01).map(e => [+(e.beat - cs - k * CL).toFixed(3), e.out]), [cs, k, CL]);
const p0 = await pass(1), p1 = await pass(2);
log('pass0', JSON.stringify(p0)); log('pass1', JSON.stringify(p1));
log('all t2', JSON.stringify(await E(() => SYNQUENZER.noteLog(900).filter(e => e.track === 2 && e.beat > 7).map(e => [+e.beat.toFixed(2), e.src, e.out]))));
log('cstart now', await E(t => [R.cstart[t], R.slot[t], audBeat()], TR), 'scene', JSON.stringify(await E(() => SYNQUENZER.runtime().scene)));
const len = clip ? clip.len * 4 : 8;
check('R2 the recorded clip loops: full pass 2 = pass 3 (Zufall, same seed)', p0.length > 20 && JSON.stringify(p0) === JSON.stringify(p1), {n: [p0.length, p1.length]});
// compare with the take (ignore the first 'late' step and the last step of each chord: chords released at .9)
const norm = a => a.filter(x => ![0, 2, 4].some(b => x[0] > b - .3 && x[0] < b + .3)).map(x => x.join(':'));   // chord changes excluded (live latency)
const tk = norm(takeArp), pb = norm(p0);
const same = tk.filter(x => pb.includes(x)).length;
check('R3 playback = what was heard while recording (all steps away from the chord changes)', same === tk.length && tk.length > 15, {take: tk.length, play: pb.length, same, diff: tk.filter(x => !pb.includes(x)).slice(0, 8), diff2: pb.filter(x => !tk.includes(x)).slice(0, 8)});
// scene switch by touch: scene 1 then scene 3 again; then ■ → no stuck notes
await T.tapTxt('button.scn', /^▶\s*1/); await sleep(2500);
await T.tapTxt('button.scn', /^▶\s*3/); await sleep(2500);
const v1 = await E(() => SYNQUENZER.voices().filter(v => v.track === 2).length);
await T.tapSel('#bPlay', 100); await sleep(1500);
const fin = await E(() => ({v: SYNQUENZER.voices().filter(v => v.state !== 'off' && v.state !== 'released'), te: SYNQUENZER.tickErrors()}));
check('R4 scene 1 ↔ 3 by touch, ■: no stuck voices, no tick errors', fin.v.length === 0 && !fin.te, fin);
// ECO: arp continues
await E(() => SYNQUENZER.forceNative(true)); await sleep(300);
await E(() => ARPC.clearLog());
await T.holdKeys([0, 4, 7]); await sleep(900); await T.releaseKeys(); await sleep(300);
const eco = await T.alog(TR);
await E(() => SYNQUENZER.forceNative(false)); await sleep(300);
check('R5 ECO (forceNative): the arp keeps arpeggiating (Zufall over C E G)', eco.length >= 5 && eco.every(x => [60, 64, 67].includes(x.note)), eco.map(x => x.note));
console.log('errs', JSON.stringify(errs));
check('R6 no console errors', !errs.length, errs.slice(0, 4));
await T.br.close(); done();
