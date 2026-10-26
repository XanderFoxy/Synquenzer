// EN3-14 / §15.3: cold start without an MS 2000 track, new vs predecessor, median of 7 alternating runs (P1)
import {launch, FILE, VORG} from './v3-qmkp-lib.mjs';
const b = await launch(); const T = {new: [], old: []};
for (let k = 0; k < 7; k++) for (const [nm, file] of [['new', FILE], ['old', VORG]]) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}); const p = await ctx.newPage();
  const t0 = Date.now(); await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000, polling: 5});
  const t = await p.evaluate(() => new Promise(r => requestAnimationFrame(() => r(performance.now()))));
  const mk = await p.evaluate(() => typeof MKUI !== 'undefined');
  T[nm].push(Math.round(t) + (mk ? 100000 : 0)); await ctx.close();
}
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
console.log('new', JSON.stringify(T.new), 'median', med(T.new)); console.log('old', JSON.stringify(T.old), 'median', med(T.old)); console.log('delta ms', med(T.new) - med(T.old));
await b.close();
