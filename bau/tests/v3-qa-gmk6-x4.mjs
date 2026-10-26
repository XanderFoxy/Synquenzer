import {open, sleep, OUT, check, done, eq, diff} from './v3-qa-gmk6-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const TR = 2, MODE = process.argv[2] || 'a';
await T.openEd(TR);
let c = await T.rectText('button', /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(1200);
await E(t => { const Q = SYNQUENZER; Q.mkSet(t, 't.0.f.cut', 40); Q.mkSet(t, 't.0.e2.s', 127); for (let s = 0; s < 8; s++) Q.mkSet(t, 't.0.seq.q.0.v.' + s, 56); MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); }, TR);
await sleep(400);
const U = () => E(() => JSON.stringify(SYNQUENZER.undoInfo()));
await T.tapMk('rec', 400);
const kA = await T.key(5);
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 7}]); await sleep(200);
const kc = await T.mk('k0'); await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 7}, {x: kc.cx, y: kc.cy, id: 8}]); await sleep(40);
for (let s = 1; s <= 70; s++) { await T.send('touchMove', [{x: kA.cx, y: kA.cy, id: 7}, {x: kc.cx, y: kc.cy - s * 1.6, id: 8}]); await sleep(35); }
if (MODE === 'a') await T.send('touchEnd', [{x: kA.cx, y: kA.cy, id: 7}]);
else await T.send('touchEnd', []);
await sleep(50);
let recN = 0; for (let k = 0; k < 40 && !recN; k++) { await sleep(150); recN = await E(t => AU.synth[t].mkRecN || 0, TR); }
await T.send('touchEnd', []); await sleep(300);
console.log('U1', await U(), 'GEST', await E(() => typeof GEST !== 'undefined' ? GEST.size : 'n/a'), 'voices', JSON.stringify(await E(() => SYNQUENZER.voices().length)));
const ub = await T.rectText('.hb.ur, button', /^↶$/); console.log('undo btn', JSON.stringify(ub));
await T.tapTxt('.hb.ur, button', /^↶$/, 300);
console.log('U2', await U());
await T.tapTxt('.hb.ur, button', /^↶$/, 300);
console.log('U3', await U());
console.log('errs', errs);
await T.br.close();
