import { openVp, mk2, SETUP, sleep } from './v3-v2e2-lib.mjs';
const {b, p, errs, cdp} = await openVp(process.argv[2] || 'P1');
const T = mk2(p, cdp), {E} = T;
await E(SETUP(false)); await sleep(300);
for (let k = 0; k < 4; k++) {
  const r = await E(() => { const t0 = performance.now(); window.SYNQUENZER.songView(true); const t1 = performance.now(); document.body.offsetHeight; const t2 = performance.now(); return new Promise(res => requestAnimationFrame(() => { const t3 = performance.now(); window.SYNQUENZER.songView(false); res([t1 - t0, t2 - t1, t3 - t0]); })); });
  console.log(r.map(x => x.toFixed(1)));
  await sleep(200);
}
await b.close();
