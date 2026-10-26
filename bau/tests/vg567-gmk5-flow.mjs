// QA G-MK5 flow (iPhone P 390x844 / L 844x390, CDP touch): songwriting with the MS 2000 arpeggiator (ARP key, ARP A/B, step keys, latch, REC)
import {open, sleep, OUT, check, done} from './vg567-gmk5-tl.mjs';
const L = process.argv[2] === 'L', TAG = L ? 'L' : 'P';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
const U = () => T.undoN();
const TR = 2;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await T.openEd(TR);
log('toMk', await T.toMk());
check('F1 engine MS 2000 (touch)', (await E(t => SYNQUENZER.getSound(t).engine, TR)) === 'mk');
let pn = await T.panel(); log('fmt', pn.fmt, 'half', pn.half);
const half = async want => { pn = await T.panel(); if (pn.half && pn.half !== 'beide' && pn.half !== want) { await T.tapTxt('.tab, button', want === 'B' ? /^RECHTS$/ : /^LINKS$/); await sleep(350); } };
await half('A');
// make the sound clearly audible and short (pluck-ish) so arp notes are separable
await E(t => { const Q = SYNQUENZER; Q.mkSet(t, 't.0.e2.a', 0); Q.mkSet(t, 't.0.e2.d', 40); Q.mkSet(t, 't.0.e2.s', 90); Q.mkSet(t, 't.0.e2.r', 10); Q.mkSet(t, 't.0.f.cut', 90); }, TR);
let u0 = await U();
const ab = await T.mk('arp'); log('ARP key rect', JSON.stringify(ab));
await T.tapMk('arp', 400);
let A = await T.arp(TR); let lc = await T.edLcd(); let ut = await T.undoTop();
check('F2 ARP key (touch): arp.on = 1, LED on, one undo, LCD hint', A.on === 1 && (await U()) === u0 + 1 && (await T.pinfo()).arp.on, {on: A.on, du: (await U()) - u0, top: ut, lcd: lc, cls: await T.arpCls()});
await p.screenshot({path: OUT + TAG + '-f2-arpon.png'});
// hold C E G by touch with transport stopped
await E(() => ARPC.clearLog && ARPC.clearLog());
const t0 = await E(() => AU.ctx.currentTime);
const cap = T.capT(TR, 1700);
await sleep(50);
const hk = await T.holdKeys([0, 4, 7]);
await sleep(1200);
const held = await E(() => SYNQUENZER.voices().filter(v => v.track === 2).map(v => [v.src, v.out, v.state]));
await T.releaseKeys();
const relT = await E(() => AU.ctx.currentTime);
await sleep(600);
let lg = await T.alog(TR); const c1 = await cap;
const pk = c1.l.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
log('held voices', JSON.stringify(held));
log('arpLog', JSON.stringify(lg.map(x => [+(x.t - t0).toFixed(3), x.note, +x.dur.toFixed(3), x.step])));
const notes = lg.map(x => x.note);
const after = lg.filter(x => x.t > relT + 0.02);
check('F3 hold C-E-G (touch, transport stopped): arpeggio Up C E G C E G …, audible', notes.length >= 6 && notes.slice(0, 6).join() === [notes[0], notes[1], notes[2], notes[0], notes[1], notes[2]].join() && notes[0] < notes[1] && notes[1] < notes[2] && 20 * Math.log10(pk) > -40, {first: notes.slice(0, 9), peakDb: +(20 * Math.log10(pk + 1e-9)).toFixed(1)});
check('F4 release: no arp note after release (+20 ms), 0 arp voices', after.length === 0 && (await E(() => SYNQUENZER.voices().filter(v => v.track === 2 && v.state !== 'released' && v.state !== 'off').length)) === 0, {after: after.map(x => [+(x.t - relT).toFixed(3), x.note]), v: await E(() => SYNQUENZER.voices().filter(v => v.track === 2))});
// EDIT-WAHL 2 → ARP A
log('w2 ARP A', JSON.stringify(await T.w2(/^\d+ ARP A/)));
await sleep(500);
pn = await T.panel(); lc = await T.edLcd();
check('F5 EDIT-WAHL 2 → ARP A (list): knobs TEMPO · AUFLÖSUNG · GATE · TYP · OKTAVEN, number keys become step keys', pn.knobs.map(k => k && k.l).join(',') === 'TEMPO,AUFLÖSUNG,GATE,TYP,OKTAVEN' && pn.arp.steps, {knobs: pn.knobs.map(k => k && k.l), lcd: lc, keys: pn.arp.keys});
await p.screenshot({path: OUT + TAG + '-f5-arpa.png'});
u0 = await U();
log('TYP', await T.knobList('k3', /^Wechsel 2$/));
A = await T.arp(TR);
check('F6 TYP list → Wechsel 2: one undo', A.type === 3 && (await U()) === u0 + 1, {type: A.type, du: (await U()) - u0, lcd: await T.edLcd()});
u0 = await U();
log('OKT drag', await T.dragMk('k4', -40, 10));
A = await T.arp(TR);
check('F7 OKTAVEN drag up a bit → 2 (rastet), one undo', A.range >= 2 && A.range <= 4 && (await U()) === u0 + 1, {range: A.range, du: (await U()) - u0, lcd: await T.edLcd()});
if (A.range !== 2) { await E(t => SYNQUENZER.mkSet(t, 'arp.range', 2), TR); }
u0 = await U();
log('AUFL', await T.knobList('k1', /^1\/8$/));
A = await T.arp(TR);
check('F8 AUFLÖSUNG list → 1/8: one undo, LCD shows ms', A.res === 3 && (await U()) === u0 + 1, {res: A.res, lcd: await T.edLcd()});
u0 = await U();
log('GATE drag', await T.dragMk('k2', 40, 12));
A = await T.arp(TR);
check('F9 GATE drag down → < 75, one undo', A.gate < 75 && (await U()) === u0 + 1, {gate: A.gate, du: (await U()) - u0, lcd: await T.edLcd()});
// ARP B
log('w2 ARP B', JSON.stringify(await T.w2(/^\d+ ARP B/)));
await sleep(500);
pn = await T.panel();
check('F10 EDIT-WAHL 2 → ARP B (list): knobs LATCH · SWING · KEY SYNC · LÄNGE · ZIEL', pn.knobs.map(k => k && k.l).join(',') === 'LATCH,SWING,KEY SYNC,LÄNGE,ZIEL' && pn.arp.steps, {knobs: pn.knobs.map(k => k && k.l), lcd: await T.edLcd()});
u0 = await U();
log('LÄNGE drag', await T.dragMk('k3', 30, 10));
A = await T.arp(TR);
log('last', A.last);
check('F11 LÄNGE drag down → < 8, one undo', A.last < 8 && A.last >= 1 && (await U()) === u0 + 1, {last: A.last, lcd: await T.edLcd()});
await E(t => SYNQUENZER.mkSet(t, 'arp.last', 6), TR); await sleep(200);
u0 = await U();
await T.tapMk('n1', 300); await T.tapMk('n4', 300);
A = await T.arp(TR); pn = await T.panel();
const kc = await T.keyCls();
check('F12 step keys 2 and 5 (touch): pause, 2 undos; keys: 1 3 4 6 on, 2 5 pause (blink), 7 8 dark', A.steps === (255 & ~2 & ~16) && (await U()) === u0 + 2 && pn.arp.keys.join(',') === 'an,pause,an,an,pause,an,dunkel,dunkel' && kc[1].includes('mpause') && kc[6].includes('mover'), {steps: A.steps.toString(2), keys: pn.arp.keys, cls: kc, lcd: await T.edLcd()});
u0 = await U();
await T.tapMk('n7', 300);
A = await T.arp(TR);
check('F13 step key 8 above LÄNGE: no change, LCD explains', A.steps === (255 & ~2 & ~16) && (await U()) === u0, {lcd: await T.edLcd()});
await p.screenshot({path: OUT + TAG + '-f12-steps.png'});
u0 = await U();
log('LATCH', await T.knobList('k0', /^an$/));
A = await T.arp(TR);
check('F14 LATCH list → an: one undo', A.latch === 1 && (await U()) === u0 + 1, {latch: A.latch});
// hold D F A briefly, release → latched; pattern Alt 2 over 2 octaves, length 6 with steps 2/5 resting
await E(() => ARPC.clearLog());
const t1 = await E(() => AU.ctx.currentTime);
await T.holdKeys([2, 5, 9]); await sleep(150); await T.releaseKeys();
await sleep(3200);
lg = await T.alog(TR);
log('latched', JSON.stringify(lg.map(x => [+(x.t - t1).toFixed(3), x.note, x.step])));
const steps = lg.map(x => x.step);
// expected U = D F A D' F' A' (62 65 69 74 77 81); Alt2 = U + rev(U) = 12 entries; pointer advances on rests
const U2 = [62, 65, 69, 74, 77, 81]; const ALT2 = U2.concat(U2.slice().reverse());
const exp = []; for (let c = 0; c < lg.length + 20 && exp.length < lg.length; c++) { const s = c % 6; if (s === 1 || s === 4) continue; exp.push([ALT2[c % 12], s + 1]); }
const got = lg.map(x => [x.note, x.step]);
check('F15 latch: plays on after release ≥ 3 s; Wechsel 2 · 2 Okt · LÄNGE 6 · steps 2/5 rest (pattern exact)', lg.length >= 8 && JSON.stringify(got) === JSON.stringify(exp.slice(0, got.length)), {got: got.slice(0, 14), exp: exp.slice(0, 14)});
// step keys light: running step shown (cur)
pn = await T.panel();
log('running step', pn.arp.cur, pn.arp.keys, await T.keyCls());
check('F16 running step is shown on the step keys while the latched arp runs', pn.arp.cur >= 0, {cur: pn.arp.cur});
// start transport by touch → arp on song grid
await T.closePop();
const pb = await T.rect('#bPlay'); log('play button', JSON.stringify(pb));
let tPlay = null;
if (pb) { await T.tap(pb.cx, pb.cy, 100); tPlay = await E(() => AU.ctx.currentTime); }
await sleep(2500);
const playing = await E(() => SYNQUENZER.runtime().playing);
lg = await T.alog(TR);
const grid = await E(([tp]) => { const L = SYNQUENZER.arpLog(2).filter(x => x.t > tp + .3); return L.map(x => +(t2b(x.t) * 2).toFixed(3)); }, [tPlay]);
log('grid (in 1/8 units)', JSON.stringify(grid.slice(0, 16)));
check('F17 ▶ (touch) while latched: song plays, arp notes on the 1/8 song grid (± 0.004 eighth)', playing && grid.length >= 4 && grid.every(g => Math.abs(g - Math.round(g)) < .004 || /late/.test('')), {playing, grid: grid.slice(0, 12)});
await p.screenshot({path: OUT + TAG + '-f17-playing.png'});
// the pad clip of scene 1 now feeds the arp (clip chord replaces the latched live chord)
const nl = await E(tp => SYNQUENZER.noteLog(400).filter(e => e.track === 2 && e.time > tp + .3).map(e => [e.src, e.out]), tPlay);
check('F18 playing: the clip chord C-E-G(-B) of the pad clip is arpeggiated (replaces the latched D-F-A)', nl.length >= 4 && nl.every(x => x[0] === 'arp' && [60, 64, 67, 71, 72, 76, 79, 83].includes(x[1])), nl.slice(0, 12));
// ■ stop by touch, then LATCH off with a latched live chord → stops ≤ 1 step
await T.tap(pb.cx, pb.cy, 300);
await T.holdKeys([2, 5, 9]); await sleep(150); await T.releaseKeys(); await sleep(700);
await T.w2(/^\d+ ARP B/); await sleep(400);
u0 = await U();
log('LATCH off', await T.knobList('k0', /^aus$/));
const tOff = await E(() => AU.ctx.currentTime);
await sleep(900);
lg = await T.alog(TR);
const late = lg.filter(x => x.t > tOff + 60 / 112 / 2 + .01);
check('F19 LATCH aus (transport stopped, latched chord): arp stops ≤ 1 step, one undo, 0 voices after release', late.length === 0 && (await U()) === u0 + 1 && (await E(() => SYNQUENZER.voices().filter(v => v.track === 2 && v.state === 'on').length)) === 0, {after: late.map(x => [+(x.t - tOff).toFixed(3), x.note])});
console.log('errs', JSON.stringify(errs));
await T.br.close(); done();
