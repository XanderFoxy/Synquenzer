import {open, sleep, OUT} from './v3-qa-gmk2a-tl.mjs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E, errs} = T;
await E(() => SYNQUENZER.setMetronome(false));
await T.openEd(0);
const mkb = await T.rectText('button', /^MS ?2000$/); await T.tap(mkb.cx, mkb.cy, 800);
await T.w('w1', /^3 OSZ 1/);
const kA = await T.key(L ? 7 : 5);
const hold = async (tag, fn) => { await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 11}]); await sleep(200); const s = await T.spec(400); let s2 = null; if (fn) { await fn(); s2 = await T.spec(400); } await T.send('touchEnd', []); await sleep(400); console.log(tag, JSON.stringify((await T.pm(0)).t[0].o1), JSON.stringify(s.peaks.slice(0, 5)), s2 ? '→ ' + JSON.stringify(s2.peaks.slice(0, 5)) : ''); };
const seq = process.argv[3] || 'a';
if (seq === 'a') {
  await T.knobList('k0', /^Sinus×$/); await sleep(300);
  await hold('sinus× c1 0');
  await E(() => SYNQUENZER.mkSet(0, 't.0.o1.c1', 74));
  await hold('sinus× c1 74 api');
  await E(() => SYNQUENZER.mkSet(0, 't.0.o1.c1', 0));
  await hold('sinus× c1 0 api');
} else {
  await T.knobList('k0', /^Speicherwelle/); await sleep(300);
  await E(() => SYNQUENZER.mkSet(0, 't.0.o1.c2', 70));
  await hold('wave36');
  await T.knobList('k0', /^Sinus×$/); await sleep(300);
  await hold('sinus× after wave36 c1 0');
  await hold('sinus× again');
}
const k1 = await T.mk('k1');
await hold('touch drag k1', async () => { await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 11}, {x: k1.cx, y: k1.cy, id: 12}]); for (let s = 1; s <= 30; s++) { await T.send('touchMove', [{x: kA.cx, y: kA.cy, id: 11}, {x: k1.cx, y: k1.cy - s * 4, id: 12}]); await sleep(25); } await sleep(60); });
await hold('after drag');
console.log(errs);
await T.br.close();
