// QA V2e′ t32: haptic calls on the abort paths (#11 guard, #14 release on transport, #15 pointercancel) vs table B.5 („–“)
import { openVp, T, SETUP55, PREP, RESET, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(false)); await E(() => window.SYNQUENZER.songView(true)); await sleep(200); await E(() => window.SYNQUENZER.songView(false)); await sleep(300);
await E(PREP);
const k = await t.key(0);
const hapSince = () => E(() => window.__hap.map(h => [Math.round(h[0] - window.__down), h[1] === 14 ? 'pop' : h[1] === 10 ? 'snap' : 'tick']));
const paths = {
  '#11 guard': async () => { await t.down(k.x, k.y); await sleep(1150); await t.up(); },
  '#14 transport': async () => { await t.down(k.x, k.y); await sleep(1150); const inf = await t.info(); await t.glide(k.x, k.y, inf.canvas.x + 60, inf.canvas.y + 40, 4, 16); const r = await t.rect('.sv-play'); await t.glide(inf.canvas.x + 60, inf.canvas.y + 40, r.cx, r.cy, 4, 16); await sleep(150); await E(() => { window.__mark = window.__hap.length; }); await t.up(); },
  '#15 pointercancel': async () => { await t.down(k.x, k.y); await sleep(1150); await t.glide(k.x, k.y, k.x + 30, k.y - 30, 3, 16); await sleep(150); await E(() => { window.__mark = window.__hap.length; }); await t.cancel(); },
};
for (const [tag, fn] of Object.entries(paths)) {
  await E(RESET); await E(() => { window.__mark = null; });
  await fn(); await sleep(400);
  const h = await hapSince(), mark = await E(() => window.__mark);
  const atEnd = mark != null ? h.slice(mark) : h.filter(x => x[0] > 1200);
  console.log(tag, JSON.stringify(h), 'at abort:', JSON.stringify(atEnd));
  check(`${VP} B.5 ${tag}: no haptic on the abort`, atEnd.length === 0, atEnd);
}
await b.close();
process.exit(done());
