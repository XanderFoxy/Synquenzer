// QA G-MK6 flow (iPhone P 390x844 / L 844x390, CDP touch): songwriting with the MS 2000 mod sequencer (SEQ, SCHRITTE, AUFN., tools)
import {open, sleep, OUT, check, done, eq, diff} from './vg567-gmk6-tl.mjs';
const L = process.argv[2] === 'L', TAG = L ? 'L' : 'P';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
T.knobList = async (k, re) => { await T.tapMk(k, 300); const r = await T.tapPop(re); await sleep(600); return r ? 'ok' : 'no list item ' + re + ' ' + JSON.stringify(await T.popTexts()); };
const U = () => T.undoN();
const TR = 2;   // Rom-Fläche (pad) → MS 2000
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await T.openEd(TR);
await T.toMk();
check('F1 engine MS 2000 (touch)', (await E(t => SYNQUENZER.getSound(t).engine, TR)) === 'mk');
let pn = await T.panel(); log('fmt', pn.fmt, 'half', pn.half);
const half = async want => { pn = await T.panel(); if (pn.half && pn.half !== 'beide' && pn.half !== want) { await T.tapTxt('.tab, button', want === 'B' ? /^RECHTS$/ : /^LINKS$/); await sleep(350); } };
await half('B');
// a sustained, bright sound so the cutoff sequence is audible: SAW, cutoff 40, reso 60, amp sustain full
await E(t => { const Q = SYNQUENZER; Q.mkSet(t, 't.0.f.cut', 40); Q.mkSet(t, 't.0.f.res', 50); Q.mkSet(t, 't.0.e2.a', 0); Q.mkSet(t, 't.0.e2.s', 127); Q.mkSet(t, 't.0.e1.s', 0); Q.mkSet(t, 't.0.f.eg', 0); }, TR);
let u0 = await U();
log('w2 →', JSON.stringify(await T.w2(/^11 SEQ/))); await sleep(600);
let lc = await T.lcd2(); pn = await T.panel();
check('F2 EDIT-WAHL 2 → 11 SEQ (list): knobs SEQ AN · SEQUENZ · ZIEL · BEWEGUNG · LÄNGE, matrix "SCHRITTE ▸"', pn.sel.wahl === 2 && pn.sel.pos === 10 && pn.knobs.map(k => k && k.l).join(',') === 'SEQ AN,SEQUENZ,ZIEL,BEWEGUNG,LÄNGE' && /SCHRITTE ▸/.test(pn.matrix.join(' ')), {knobs: pn.knobs.map(k => k && k.l), lcd: lc, matrix: pn.matrix});
u0 = await U();
log('SEQ AN', await T.knobList('k0', /^an$/));
let S = await T.seq(TR); lc = await T.lcd2();
check('F3 SEQ AN list → an: one undo, LCD', S.on === 1 && (await U()) === u0 + 1, {on: S.on, du: (await U()) - u0, lcd: lc, matrix: (await T.panel()).matrix});
u0 = await U();
await T.tapMk('k2', 300); const zl = await T.popTexts(); log('ZIEL list n', zl && zl.length);
// the list scrolls; CUTOFF is row 12 – scroll it into view like a finger would (scrollIntoView = native scroll)
await E(() => { const b = [...document.querySelectorAll('#popLayer .pop button')].find(b => /^CUTOFF/.test(b.textContent.trim())); b && b.scrollIntoView({block: 'center'}); }); await sleep(200);
const zr = await T.tapPop(/^CUTOFF/); await sleep(600);
S = await T.seq(TR); lc = await T.lcd2();
check('F4 ZIEL list → CUTOFF: one undo', S.q[0].k === 11 && (await U()) === u0 + 1, {k: S.q[0].k, tapped: zr && zr.t, du: (await U()) - u0, lcd: lc});
u0 = await U();
log('BEWEGUNG', await T.knobList('k3', /^Stufe$/));
S = await T.seq(TR);
log('m', S.q[0].m, 'du', (await U()) - u0);
// open SCHRITTE via the matrix row
const mrow = await E(() => [...document.querySelectorAll('#synthSheet .mrow2')].find(e => /SCHRITTE/.test(e.textContent)).dataset.k);
await T.tapMk(mrow, 400);
let I = await T.steps();
check('F5 tap on matrix row SEQ → SCHRITTE view (16 columns, head keys ≥ 44 px)', I && I.cols.length === 16 && I.keys.every(k => k.w >= 43.5 && k.h >= 43.5), I && {geo: I.geo, keys: I.keys.map(k => k.k + ' ' + k.w.toFixed(0) + '×' + k.h.toFixed(0))});
await p.screenshot({path: OUT + TAG + '-f5-schritte.png'});
// paint with one finger across columns 1..8 near the top (touch) – one undo
u0 = await U();
const col = k => I.cols[k];
let a = col(0), b = col(L ? 7 : 7);
await T.down(a.x + a.w / 2, a.y + 10); await sleep(30); await T.glide(a.x + a.w / 2, a.y + 10, b.x + b.w / 2, b.y + 10, 16, 16); await T.up(); await sleep(200);
S = await T.seq(TR);
check('F6 paint (touch) columns 1–8 at the top: high values, one undo', S.q[0].v.slice(0, 8).every(x => x >= 50) && S.q[0].v.slice(8).every(x => x === 0) && (await U()) === u0 + 1, {v: S.q[0].v.join(','), du: (await U()) - u0});
// drag column 9..16 alternately down (touch, vertical)
u0 = await U();
for (const k of [9, 11, 13, 15]) { const q = col(k); await T.down(q.x + q.w / 2, q.y + q.h / 2); await sleep(30); await T.glide(q.x + q.w / 2, q.y + q.h / 2, q.x + q.w / 2, q.y + q.h - 2, 10, 16); await T.up(); await sleep(150); }
S = await T.seq(TR);
check('F7 drag (touch) columns 10, 12, 14, 16 down: negative, 4 undos', [9, 11, 13, 15].every(k => S.q[0].v[k] <= -40) && (await U()) === u0 + 4, {v: S.q[0].v.join(','), du: (await U()) - u0});
// tap above the bar of column 9 → +1
u0 = await U(); let q9 = col(8); const v8 = S.q[0].v[8];
await T.tap(q9.x + q9.w / 2, q9.y + 8, 250); S = await T.seq(TR);
check('F8 tap (touch) above the bar of column 9: +1, one undo', S.q[0].v[8] === v8 + 1 && (await U()) === u0 + 1, {before: v8, after: S.q[0].v[8], du: (await U()) - u0});
await p.screenshot({path: OUT + TAG + '-f8-painted.png'});
// hold a key (touch on the on-screen keyboard) for 2.5 s and record the track: the cutoff must follow the steps
const kA = await T.key(L ? 10 : 5);
await E(() => { window.__capP = null; });
const capP = T.capT(TR, 2600);
await sleep(60); await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 7}]);
I = await T.steps(); const curs = []; for (let k = 0; k < 10; k++) { await sleep(180); curs.push((await T.steps()).cur); }
await sleep(400); await T.send('touchEnd', []);
const cap = await capP;
// HF energy per 10 ms window
const sr = cap.sr, x = cap.l.map((v, i) => (v + cap.r[i]) / 2); let i0 = x.findIndex(v => Math.abs(v) > 1e-3);
const W = Math.round(sr * .01), hf = [], all = []; for (let i = Math.max(1, i0); i + W < x.length; i += W) { let h = 0, s = 0; for (let k = i; k < i + W; k++) { const d = x[k] - x[k - 1]; h += d * d; s += x[k] * x[k]; } hf.push(+(10 * Math.log10(h / (s + 1e-20) + 1e-20)).toFixed(1)); all.push(+(10 * Math.log10(s / W + 1e-20)).toFixed(1)); }
const bpm = await E(() => SYNQUENZER.runtime().bpm), stepS = 60 / bpm / 4, perStep = [];
for (let s = 0; s < 16 && (s + 1) * stepS * 100 < hf.length; s++) { const a0 = Math.round(s * stepS * 100) + 2, a1 = Math.round((s + 1) * stepS * 100) - 2; const seg = hf.slice(a0, a1); perStep.push(+(seg.reduce((u, v) => u + v, 0) / seg.length).toFixed(1)); }
log('bpm', bpm, 'per step HF ratio dB', perStep.join(' '), '\nrunning step display', curs.join(','));
const hi = perStep.slice(0, 8), lo = perStep.slice(9, 16).filter((_, k) => k % 2 === 0);
check('F9 audible: steps 1–8 (CUTOFF +≥50) clearly brighter than the negative steps (≥ 6 dB HF ratio)', hi.length === 8 && lo.length >= 3 && Math.min(...hi) - Math.max(...lo) > 6, {hi, lo});
check('F10 running step lit while the key is held', curs.filter(v => v >= 1).length >= 8 && new Set(curs).size >= 5, curs);
await sleep(600);
log('after release cur', (await T.steps()).cur);
// ● AUFN. → GERÄT (SPIEL), hold a key, turn CUTOFF slowly
u0 = await U(); const before = await E(t => SYNQUENZER.mkGet(t), TR);
await T.tapMk('rec', 400); pn = await T.panel(); lc = await T.lcd2();
const mx = await E(() => [...document.querySelectorAll('#synthSheet .mrow2')].map(e => e.textContent + (e.querySelector('.mrec, .blink') ? '[blink]' : '')).join(' | '));
check('F11 ● AUFN. → GERÄT in SPIEL, matrix "● AUFN." blinking, LCD tells what to do', !pn.view && pn.sel.wahl === 0 && pn.rec && /AUFN/.test(mx), {sel: pn.sel, view: pn.view, rec: pn.rec, mx, lcd: lc});
await p.screenshot({path: OUT + TAG + '-f11-rec.png'});
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 7}]); await sleep(200);
const kc = await T.mk('k0'); await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 7}, {x: kc.cx, y: kc.cy, id: 8}]); await sleep(40);
for (let s = 1; s <= 70; s++) { await T.send('touchMove', [{x: kA.cx, y: kA.cy, id: 7}, {x: kc.cx, y: kc.cy - s * 1.6, id: 8}]); await sleep(35); }
await T.send('touchEnd', [{x: kA.cx, y: kA.cy, id: 7}]); await sleep(50);
let recN = 0; for (let k = 0; k < 40 && !recN; k++) { await sleep(150); recN = await E(t => AU.synth[t].mkRecN || 0, TR); }
await T.send('touchEnd', []); await sleep(300);
const after = await E(t => SYNQUENZER.mkGet(t), TR), last = await E(t => AU.synth[t].mkRecLast, TR); lc = await T.lcd2();
log('rec', JSON.stringify(last), 'lcd', lc);
check('F12 AUFN. with a held key + CUTOFF drag (two fingers): ZIEL CUTOFF, steps written, CUTOFF back to 40, one undo', recN >= 1 && after.t[0].seq.q[0].k === 11 && after.t[0].f.cut === 40 && (await U()) === u0 + 1, {recN, v: after.t[0].seq.q[0].v.join(','), cut: after.t[0].f.cut, du: (await U()) - u0, lcd: lc, pn: (await T.panel()).rec});
// undo restores
await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 300);
const und = await E(t => SYNQUENZER.mkGet(t), TR);
check('F13 ↶ after AUFN. restores everything', eq(und, before), diff(und, before).slice(0, 5));
await T.tapTxt('#synthSheet .hb.ur', /^↷$/, 300);
const red = await E(t => SYNQUENZER.mkGet(t), TR);
check('F14 ↷ re-applies the recording', eq(red, after), diff(red, after).slice(0, 5));
log('errs', errs);
await p.screenshot({path: OUT + TAG + '-f14.png'});
await T.br.close(); done();
