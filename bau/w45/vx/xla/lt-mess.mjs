import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(3000);
const bytes = [...fs.readFileSync('tests/' + (process.argv[3] || 'synth-song.cbp'))];
await p.evaluate(async () => { applyProject(normalizeProject(demoProjectRaw()), {}); S.name = 'Vorher-Projekt'; setBpm(97); markDirty(); await autosave.flush(); });
const r = await p.evaluate(async b => {
  await window.__xla.file(Uint8Array.from(b).buffer, 'A'); await window.__xla.build();
  const lt = [], T = []; const LTS = []; const wrap = n => { const f = window[n] || eval(n); const g = function () { const t = performance.now(); try { return f.apply(this, arguments); } finally { T.push(n + ':' + Math.round(performance.now() - t)); } }; return g; };
  applyProject = wrap('applyProject'); serialize = wrap('serialize'); parkFile = wrap('parkFile'); parkSnapshot = wrap('parkSnapshot'); toast = wrap('toast'); closePop = wrap('closePop'); setSongView = wrap('setSongView'); xlaProject = wrap('xlaProject'); projectFileObj = wrap('projectFileObj'); undoPush = wrap('undoPush'); normalizeProject = wrap('normalizeProject'); new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(Math.round(e.duration) + '@' + Math.round(e.startTime)); }).observe({type: 'longtask'});
  const RAF = window.requestAnimationFrame; window.requestAnimationFrame = cb => RAF(ts => { const t = performance.now(); try { cb(ts); } finally { const d = performance.now() - t; if (d > 8) T.push('raf:' + Math.round(d) + '@' + Math.round(t)); } });
  const t0 = performance.now(); T.push('t0@' + Math.round(t0)); await window.__xla.apply(); const t1 = performance.now();
  await new Promise(r => setTimeout(r, 1500));
  return {ms: Math.round(t1 - t0), lt, T};
}, bytes);
console.log(JSON.stringify(r));
await b.close();
