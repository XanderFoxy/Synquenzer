// QA V2e′ t2: auto-open time distribution (hold still / hold+move at 500 ms), N2-2e′-03 (b)(c)
import { openVp, T, SETUP55, PREP, RESET, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1', N = +(process.argv[3] || 8);
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(false)); await E(() => window.SYNQUENZER.songView(false)); await sleep(300);
await E(PREP);
const k0 = await t.key(0); console.log('key0', k0, 'songOn', await t.songOn());
const st = [], mv = [], lifts = [];
for (let i = 0; i < N; i++) {
  await E(RESET);
  await t.down(k0.x, k0.y); await sleep(1250);
  const h = await E(() => ({open: window.__open ? window.__open - window.__down : null, hap: window.__hap.map(x => x[0] - window.__down)}));
  st.push(Math.round(h.open)); lifts.push(Math.round(h.hap[0]));
  await t.up(); await sleep(500);
  await E(RESET);
  await t.down(k0.x, k0.y); await sleep(500);
  await t.glide(k0.x, k0.y, k0.x + 20, k0.y, 4, 10);
  await sleep(750);
  const h2 = await E(() => ({open: window.__open ? window.__open - window.__down : null}));
  mv.push(Math.round(h2.open));
  await t.up(); await sleep(500);
}
console.log('lift', lifts.join(' '));
console.log('still', st.join(' '));
console.log('moved', mv.join(' '));
const bad1 = st.filter(x => Math.abs(x - 1050) > 17), bad2 = mv.filter(x => Math.abs(x - 1050) > 17);
check(`${VP} (b) open at 1050 ±1 frame (still) – all ${N}`, !bad1.length, st);
check(`${VP} (c) open at 1050 ±1 frame (moved) – all ${N}`, !bad2.length, mv);
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
