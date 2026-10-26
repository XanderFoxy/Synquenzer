// QA MK7 regression: main-thread load while playing the demo (no vocoder): timer lateness, rAF gaps, long tasks, base vs new
import { open, APP } from './v3-qa-mk7reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk6-base-4.12.0.html';
const N = +(process.argv[2] || 3), VP = process.argv[3] === 'L' ? {width: 844, height: 390} : {width: 390, height: 844};
const agg = {base: [], new: []};
for (let i = 0; i < N; i++) for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open(VP, file);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(120); Q.launchScene(0); });
  await p.waitForTimeout(1000);
  const r = await p.evaluate(async () => {
    const late = [], raf = [], lt = []; let busy = 0;
    const po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(e.duration); }); try { po.observe({entryTypes: ['longtask']}); } catch (e) {}
    const t0 = performance.now(); let last = t0, rl = t0, stop = false;
    const tick = () => { const n = performance.now(); late.push(n - last - 10); last = n; if (!stop) setTimeout(tick, 10); }; setTimeout(tick, 10);
    const fr = n => { raf.push(n - rl); rl = n; if (!stop) requestAnimationFrame(fr); }; requestAnimationFrame(fr);
    await new Promise(r => setTimeout(r, 5000)); stop = true; po.disconnect();
    const q = (a, f) => { const s = a.slice().sort((x, y) => x - y); return +s[Math.floor(f * (s.length - 1))].toFixed(1); };
    return {lateMed: q(late, .5), late95: q(late, .95), lateMax: q(late, 1), rafMed: q(raf.slice(2), .5), raf95: q(raf.slice(2), .95), rafMax: q(raf.slice(2), 1), longN: lt.length, longSum: Math.round(lt.reduce((a, b) => a + b, 0))};
  });
  agg[name].push(r);
  console.log(i, name, JSON.stringify(r), errs.length ? JSON.stringify(errs) : '');
  await b.close();
}
