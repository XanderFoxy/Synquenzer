// QA G-MK3: trace of the SHIFT + 1 row tap (what blocks the main thread ~100 ms)
import {open, sleep} from './v3-qa-gmk3-tl.mjs';
import {setupProject} from './v3-qa-gmk3-setup.mjs';
const T = await open(); const {p, E, errs} = T;
await setupProject(E);
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.launchScene(1); }); await sleep(1500);
await T.openEd(0);
const shift = async () => { const pn = await T.panel(); if (!pn.shift) await T.tapMk('shift', 200); };
const cdp = T.cdp; const ev = [];
cdp.on('Tracing.dataCollected', d => ev.push(...d.value));
const traceOf = async (name, fn) => {
  ev.length = 0;
  await cdp.send('Tracing.start', {categories: 'devtools.timeline,disabled-by-default-devtools.timeline,v8.execute,blink.user_timing', transferMode: 'ReportEvents'});
  await fn();
  await sleep(800);
  await new Promise(r => { cdp.once('Tracing.tracingComplete', r); cdp.send('Tracing.end'); });
  const main = ev.filter(e => e.ph === 'X' && e.dur > 8000 && /RunTask|ThreadControllerImpl::RunTask/.test(e.name));
  const pid = main.length ? main[0].pid : null;
  const big = ev.filter(e => e.ph === 'X' && e.dur > 3000 && e.name !== 'RunTask' && !/ThreadController/.test(e.name)).sort((a, b) => b.dur - a.dur).slice(0, 25).map(e => [e.name, +(e.dur / 1000).toFixed(1), e.tid, (e.args && (e.args.data && (e.args.data.functionName || e.args.data.type || e.args.data.url || '')) || '')]);
  console.log(name, 'long tasks', JSON.stringify(main.map(e => +(e.dur / 1000).toFixed(1)).sort((a, b) => b - a).slice(0, 6)));
  console.log('  big events', JSON.stringify(big));
};
await traceOf('COPY ROW TAP', async () => { await shift(); await T.tapMk('n0', 500); const r = await E(() => { const r = [...document.querySelectorAll('#popLayer .mkcr')].find(r => /Layer Pad/.test(r.textContent)); const q = r.querySelector('button[data-t="1"]').getBoundingClientRect(); return {cx: q.x + q.width / 2, cy: q.y + q.height / 2}; }); await T.tap(r.cx, r.cy, 50); });
await traceOf('LIST POP (EINZELN) TAP', async () => { await T.w('w1', /^1 STIMME/); await T.knobList('k1', /^Schicht$/); });
await T.br.close();
