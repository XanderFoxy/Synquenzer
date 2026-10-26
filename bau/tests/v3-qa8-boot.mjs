// QA MK8 boot with an AM project (autosaved): boot time and long tasks, MK8 (programs) vs 4.15.0 (INIT AM)
import {launch, FILE, BASE} from './v3-qa8-lib.mjs';
const b = await launch();
for (const [tag, file] of [['4.15.0', BASE], ['MK8', FILE]]) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
  await ctx.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  const p = await ctx.newPage();
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await p.evaluate(async mk8 => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.setEngine(1, 'mk'); if (mk8) { SYNQUENZER.selectTrack(0); mkProg.select(4, 14); SYNQUENZER.selectTrack(1); mkProg.select(8, 9); } await SYNQUENZER.save(); await new Promise(r => setTimeout(r, 1500)); }, tag === 'MK8');
  const v = [];
  for (let k = 0; k < 5; k++) {
    await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
    await p.waitForTimeout(1200);
    v.push(await p.evaluate(() => ({boot: Math.round(performance.now()), lt: window.__lt.filter(x => x[1] > 50), o: SYNQUENZER.getSound(0).origin, mk: typeof mkLoaded === 'function' ? mkLoaded() : null})));
  }
  console.log(tag, JSON.stringify(v.map(x => [x.lt.map(y => y[1]).join('+') || '0', x.o, x.mk])));
  await ctx.close();
}
await b.close();
