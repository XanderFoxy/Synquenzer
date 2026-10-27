// QA VS4 F (FP-IPHONE): 60 s take: cleaning in the worker, main-thread long tasks and frame gaps while the song plays; startup
import {launch, open, sleep} from './v3-qa-vs4-h.mjs';
import fs from 'fs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null), ctx = await br.newContext({viewport: {width: 390, height: 844}});
const t0 = Date.now(); const H = await open(br, {ctx}), p = H.p; const tStart = Date.now() - t0;
const nav = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return {dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd)}; });
console.log('  size', fs.statSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VS4/index.html').size, 'nav', JSON.stringify(nav), 'open ms', tStart);
const r = await p.evaluate(() => { const sr = 48000, n = sr * 60, a = new Int16Array(n); let s = 7; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; const t = i / sr; a[i] = ((t % 1.5) < 1 ? 0.3 * Math.sin(2 * Math.PI * (200 + 50 * Math.floor(t / 1.5) % 4) * t) : 0) * 32767 + (s / 2147483647 - 0.5) * 60; } return SYNQUENZER.tkInject({pcm: a, sr, scene: 1, len: 16}); });
await p.evaluate(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); SYNQUENZER.launchScene(0); });
await sleep(800);
const res = await p.evaluate(async id => {
  const gaps = []; let last = performance.now(), run = true; const raf = () => { const n = performance.now(); gaps.push(n - last); last = n; if (run) requestAnimationFrame(raf); }; requestAnimationFrame(raf);
  window.__lt = []; const t = performance.now(); SYNQUENZER.clSet(id, 60); await SYNQUENZER.clWait(id); const ms = performance.now() - t; await new Promise(r => setTimeout(r, 300)); run = false;
  gaps.sort((a, b) => b - a); return {ms: Math.round(ms), lt: window.__lt.slice(), maxGap: Math.round(gaps[0]), p99: Math.round(gaps[Math.floor(gaps.length * 0.01)]), frames: gaps.length, info: SYNQUENZER.clInfo(id)};
}, r.id);
console.log('  ', JSON.stringify({ms: res.ms, lt: res.lt, maxGap: res.maxGap, p99: res.p99, frames: res.frames, last: res.info.last}));
ok(res.info.worker === 'worker' && res.info.buf, 'cleaning of a 60 s take ran in the worker: ' + JSON.stringify(res.info.last));
ok(!res.lt.some(d => d > 50), 'FP-IPHONE: no long task > 50 ms on the main thread while cleaning 60 s during playback: ' + JSON.stringify(res.lt));
ok(res.maxGap <= 50, 'frame gaps while cleaning: max ' + res.maxGap + ' ms, p99 ' + res.p99 + ' ms');
await p.evaluate(() => SYNQUENZER.stop());
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 2)));
await br.close(); console.log(fail ? 'FAIL ' + fail : 'ALL OK');
