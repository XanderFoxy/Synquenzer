import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
for (const vp of ['P1', 'L1']) {
const {b, p, errs, cdp} = await openVp(vp);
const T = mk(p, cdp), {E} = T;
await E(SETUP(true)); await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(400);
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(120); Q.songPlay(0); }); await p.waitForTimeout(800);
await T.tapCv(3 * 36 + 10, 9, 400);
console.log(vp, 'pop', await T.pop(), 'fol chip', JSON.stringify(await T.rect('.sv-fol')), 'canvas', JSON.stringify((await T.info()).canvas), JSON.stringify(await E(() => window.SYNQUENZER.viewState('song'))));
await p.screenshot({path: 'v3-qa-v2e/fol-' + vp + '.png'});
await b.close();
}
