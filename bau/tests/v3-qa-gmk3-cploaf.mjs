import {open, sleep} from './v3-qa-gmk3-tl.mjs';
import {setupProject} from './v3-qa-gmk3-setup.mjs';
const T = await open(); const {p, E, errs} = T;
await setupProject(E);
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.launchScene(1); }); await sleep(1500);
await T.openEd(0);
await E(() => { window.__hb = []; let last = performance.now(); setInterval(() => { const t = performance.now(); if (t - last > 30) window.__hb.push([Math.round(t - last), Math.round(last)]); last = t; }, 5);
  window.__loaf = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__loaf.push({st: Math.round(e.startTime), d: Math.round(e.duration), block: Math.round(e.blockingDuration || 0), render: Math.round(e.renderStart ? e.startTime + e.duration - e.renderStart : 0), style: Math.round(e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0), scripts: (e.scripts || []).map(s => ({f: s.sourceFunctionName, inv: s.invoker, d: Math.round(s.duration), fl: Math.round(s.forcedStyleAndLayoutDuration || 0)}))}); }).observe({type: 'long-animation-frame', buffered: false}); } catch (e) { window.__loaf.push(String(e)); }
  window.__evt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.duration > 40) window.__evt.push({n: e.name, st: Math.round(e.startTime), d: Math.round(e.duration), proc: Math.round(e.processingEnd - e.processingStart), delay: Math.round(e.processingStart - e.startTime)}); }).observe({type: 'event', durationThreshold: 16}); } catch (e) {} });
const shift = async () => { const pn = await T.panel(); if (!pn.shift) await T.tapMk('shift', 200); };
for (let k = 0; k < 3; k++) {
  await shift(); await T.tapMk('n0', 500);
  await E(() => { window.__hb.length = 0; window.__loaf.length = 0; window.__evt.length = 0; window.__t0 = Math.round(performance.now()); });
  const r = await E(() => { const r = [...document.querySelectorAll('#popLayer .mkcr')].find(r => /Layer Pad/.test(r.textContent)); const q = r.querySelector('button[data-t="1"]').getBoundingClientRect(); return {cx: q.x + q.width / 2, cy: q.y + q.height / 2}; });
  await T.tap(r.cx, r.cy, 900);
  console.log(JSON.stringify(await E(() => ({t0: window.__t0, hb: window.__hb, loaf: window.__loaf.filter(x => typeof x === 'string' || x.d > 40), evt: window.__evt}))));
}
await T.br.close();
