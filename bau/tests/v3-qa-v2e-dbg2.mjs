import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
const {b, p, errs, cdp} = await openVp('P1');
const T = mk(p, cdp), {E} = T;
await E(SETUP(true)); await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(400);
for (const play of [false, true]) {
  if (play) { await E(() => { const Q = window.SYNQUENZER; Q.setBpm(120); Q.songPlay(0); }); await p.waitForTimeout(800); }
  await T.tapCv(6 * 36 + 10, 9, 300);
  console.log('sel', JSON.stringify((await T.info()).sel));
  await T.tapCv(8 * 36 + 10, 9, 300);
  console.log('play', play, 'after REFRAIN tap', await T.pop(), JSON.stringify((await T.info()).sel), (await T.info()).mark);
  await E(() => { if (UI.pop) closePop(); window.SYNQUENZER.songSelect(null); }); await p.waitForTimeout(200);
}
await b.close();
