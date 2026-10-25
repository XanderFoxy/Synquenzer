// QA V2e′ t17: cost of the first song-view opening (sync work + first frame)
import { openVp, T, SETUP55, sleep } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(false)); await sleep(500);
const open = () => E(() => new Promise(res => { const t0 = performance.now(); window.SYNQUENZER.songView(true); const t1 = performance.now(); requestAnimationFrame(() => { const t2 = performance.now(); requestAnimationFrame(() => res({sync: +(t1 - t0).toFixed(1), toFrame: +(t2 - t0).toFixed(1), toFrame2: +(performance.now() - t0).toFixed(1)})); }); }));
for (let i = 0; i < 4; i++) { console.log(VP, 'open', i, JSON.stringify(await open())); await E(() => window.SYNQUENZER.songView(false)); await sleep(300); }
await b.close();
