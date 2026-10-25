import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
const {b, p, errs, cdp} = await openVp('P1');
const T = mk(p, cdp), {E} = T;
await E(SETUP(true)); await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(400);
for (const play of [false, true]) {
  if (play) { await E(() => { const Q = window.SYNQUENZER; Q.setBpm(120); Q.songPlay(0); }); await p.waitForTimeout(800); }
  await T.tapCv(8 * 36 + 10, 9, 60);
  const r = [];
  for (let k = 0; k < 8; k++) { r.push([await T.pop(), (await T.info()).mark, (await T.info()).x0, await E(() => UI.pop && UI.pop.name)]); await p.waitForTimeout(100); }
  console.log('play', play, JSON.stringify(r));
  await E(() => { if (UI.pop) closePop(); }); await p.waitForTimeout(200);
  await T.tapCv(3 * 36 + 10, 9, 60);
  const r2 = []; for (let k = 0; k < 5; k++) { r2.push([await T.pop(), (await T.info()).mark]); await p.waitForTimeout(100); }
  console.log('play', play, 'STROPHE', JSON.stringify(r2));
  await E(() => { if (UI.pop) closePop(); }); await p.waitForTimeout(200);
}
console.log(errs);
await b.close();
