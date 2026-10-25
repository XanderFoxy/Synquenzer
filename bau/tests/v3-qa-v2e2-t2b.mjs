// QA V2e′ t2b: why is the first auto-open late? longtasks + rAF frame after open
import { openVp, T, SETUP55, PREP, RESET, sleep } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(false)); await E(() => window.SYNQUENZER.songView(false)); await sleep(300);
await E(PREP);
await E(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']});
  const ga = document.getElementById('gridArea'); window.__frames = []; const f = () => { window.__frames.push(Math.round(performance.now())); requestAnimationFrame(f); }; requestAnimationFrame(f); return 1; });
const k0 = await t.key(0);
for (let i = 0; i < 2; i++) {
  await E(RESET); await E(() => { window.__lt = []; window.__frames = []; });
  await t.down(k0.x, k0.y); await sleep(1300);
  const r = await E(() => ({down: Math.round(window.__down), open: Math.round(window.__open), lt: window.__lt, fr: window.__frames.filter(x => x > window.__down + 900 && x < window.__down + 1200).map(x => Math.round(x - window.__down))}));
  console.log(i, 'open', r.open - r.down, 'longtasks', JSON.stringify(r.lt.map(x => [x[0] - r.down, x[1]])), 'frames', r.fr.join(' '));
  await t.up(); await sleep(600);
}
await b.close();
