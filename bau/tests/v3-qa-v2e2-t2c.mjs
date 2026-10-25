// QA V2e′ t2c: first spring open on a fresh page: event → task end (MO) → next frame
import { openVp, T, SETUP55, PREP, RESET, sleep } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(false)); await E(() => window.SYNQUENZER.songView(false)); await sleep(300);
await E(PREP);
await E(() => { window.__frames = []; const f = () => { window.__frames.push(performance.now()); requestAnimationFrame(f); }; requestAnimationFrame(f); return 1; });
const k0 = await t.key(0);
for (let i = 0; i < 3; i++) {
  await E(RESET); await E(() => { window.__frames = []; });
  await t.down(k0.x, k0.y); await sleep(480);
  await t.glide(k0.x, k0.y, k0.x + 20, k0.y - 20, 3, 10);
  const cr = await t.rect('.corner.sw');
  await sleep(60);
  const tSend = await E(() => performance.now());
  await t.move(cr.cx, cr.cy); await sleep(200);
  const r = await E(ts => { const d = window.SYNQUENZER.svLayoutInfo().drag; const open = window.__open; const fr = window.__frames.find(x => x > open);
    return {why: d && d.why, lagInHandler: d && d.lag, open: Math.round(open - window.__down), sendToTaskEnd: Math.round(open - ts), sendToFrame: Math.round(fr - ts), taskEndToFrame: Math.round(fr - open)}; }, tSend);
  console.log(VP, i, JSON.stringify(r));
  await t.up(); await sleep(600);
}
await b.close();
