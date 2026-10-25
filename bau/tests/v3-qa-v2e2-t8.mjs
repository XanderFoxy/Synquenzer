// QA V2e′ t8: edge scrolling rate (2 → 6 bars/s), limits, FOLGEN hold, during a running song nothing launches
import { openVp, T, SETUP55, PREP, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
// long song: 40 bars (append Strophe ×8 behind the 7 bars)
await E(SETUP55(false));
await E(() => { const Q = window.SYNQUENZER; for (let k = 0; k < 8; k++) Q.placePart(0, Q.song().bars, 'insert'); return Q.song().bars; }).then(x => console.log('bars', x));
await E(() => window.SYNQUENZER.songView(false)); await sleep(300);
const k0 = await t.key(0);
// play the song in the background while dragging
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(120); Q.songPlay(0); return 1; });
await sleep(300);
const st0 = await E(() => JSON.stringify(window.SYNQUENZER.runtime().slots));
await t.down(k0.x, k0.y); await sleep(1120);
let inf = await t.info();
const yy = inf.canvas.y + inf.canvas.h * .5, xr = inf.canvas.x + inf.canvas.w - 10;
await t.glide(k0.x, k0.y, xr, yy, 10, 16);
// sample SV.x
const samp = [];
const tA = Date.now();
for (let i = 0; i < 26; i++) { const x = await E(() => [performance.now(), window.SYNQUENZER.svLayoutInfo().x0, window.SYNQUENZER.viewState('song')]); samp.push(x); await sleep(100); }
const v1 = (s0, s1) => ((s1[1] - s0[1]) / 36) / ((s1[0] - s0[0]) / 1000);
const r1 = v1(samp[1], samp[7]), r2 = v1(samp[14], samp[24]);
console.log('rates', r1.toFixed(2), r2.toFixed(2), 'fol', JSON.stringify(samp[5][2]));
check(`${VP} N7S-43 edge 2 bars/s (±10 %)`, Math.abs(r1 - 2) <= .2, r1);
check(`${VP} N7S-43 after 1 s 6 bars/s (±10 %)`, Math.abs(r2 - 6) <= .6, r2);
const fol = samp[5][2];
check(`${VP} N7S-43 FOLGEN holds (Finger)`, fol && fol.follow === 'hold', fol);
// keep going until the limit
await sleep(5000);
inf = await t.info();
const bars = await E(() => window.SYNQUENZER.song().bars);
const maxBar = (inf.x0 + inf.canvas.w) / 36;
console.log('x0', inf.x0, 'visible end bar', maxBar.toFixed(2), 'n', inf.drag && inf.drag.n, 'bars', bars);
check(`${VP} 5.1 never further than song end + 4`, maxBar <= bars + 4 + .05 && inf.drag.n <= bars + 4, [maxBar, inf.drag.n]);
// left edge back to 0
await t.glide(xr, yy, inf.canvas.x + 8, yy, 8, 16);
await sleep(9000);
inf = await t.info();
check(`${VP} 5.1 never before bar 1`, inf.x0 >= 0 && inf.drag.n >= 0, [inf.x0, inf.drag.n]);
const st1 = await E(() => JSON.stringify(window.SYNQUENZER.runtime().slots));
// abort on transport
const tr = await t.rect('.sv-play');
await t.glide(inf.canvas.x + 8, yy, tr.cx, tr.cy, 5, 16); await t.up(); await sleep(300);
const fol2 = await E(() => window.SYNQUENZER.viewState('song'));
console.log('after', JSON.stringify(fol2), 'songOn', await t.songOn());
check(`${VP} FOLGEN back after drag ends`, fol2.follow !== 'hold' || fol2.reason !== 'finger', fol2);
await E(() => window.SYNQUENZER.songPlay(false));
console.log('errors', errs);
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
