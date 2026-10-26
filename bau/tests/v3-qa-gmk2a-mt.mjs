import {open, sleep} from './v3-qa-gmk2a-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setMetronome(false); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.mkSet(0, 't.0.e2.s', 127); });
await T.openEd(0); await T.w('w1', /^3 OSZ 1/);
const kA = await T.key(12); const keyPt = {x: kA.cx, y: kA.cy, id: 90};
const v = () => E(() => SYNQUENZER.voices().length);
await T.send('touchStart', [keyPt]); await sleep(300); console.log('key down', await v());
const r = await T.mk('k2');
await T.send('touchStart', [{x: r.cx, y: r.cy, id: 92}]); await sleep(100); console.log('2nd finger down (only new point listed)', await v());
for (let s = 1; s <= 20; s++) { await T.send('touchMove', [{x: r.cx, y: r.cy - s * 3, id: 92}]); await sleep(20); }
console.log('after moves (only moving point listed)', await v(), JSON.stringify((await T.pm(0)).t[0].o1), 'gest', JSON.stringify(await E(() => SYNQUENZER.gestures())));
await T.send('touchEnd', [{x: r.cx, y: r.cy - 60, id: 92}]); await sleep(200); console.log('2nd finger up (listed)', await v(), 'gest', JSON.stringify(await E(() => SYNQUENZER.gestures())), 'undo', await T.undoN());
await T.send('touchEnd', [keyPt]); await sleep(300); console.log('key up', await v());
await T.br.close();
