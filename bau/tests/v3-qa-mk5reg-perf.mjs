// QA MK5 regression: scheduler tick cost and frame pacing without arp, base vs new (demo; demo with 3 MS 2000 tracks)
import { open, APP } from './v3-qa-mk5reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk5-base-4.12.0.html';
for (let rep = 0; rep < 2; rep++) for (const [name, file] of [['base', BASE], ['new', APP]]) for (const mk of [0, 1]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  const r = await p.evaluate(async mk => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
    await Q.loadDemo(); if (mk) { for (const t of [0, 1, 2]) Q.setEngine(t, 'mk'); await sl(800); }
    const orig = window.tick; const ts = []; window.tick = function (h) { const t0 = performance.now(); try { return orig.apply(this, arguments); } finally { ts.push(performance.now() - t0); } };
    const fr = []; let last = performance.now(), go = true; const lp = () => { const n = performance.now(); fr.push(n - last); last = n; if (go) requestAnimationFrame(lp); }; requestAnimationFrame(lp);
    Q.launchScene(0); await sl(2000); ts.length = 0; fr.length = 0; await sl(6000); go = false; Q.stop();
    const q = (a, x) => { const s = a.slice().sort((u, v) => u - v); return +s[Math.floor(x * (s.length - 1))].toFixed(3); };
    return {n: ts.length, p50: q(ts, .5), p95: q(ts, .95), max: q(ts, 1), fps: +(1000 / q(fr, .5)).toFixed(1), long: fr.filter(x => x > 50).length}; }, mk);
  console.log(rep, name, mk ? 'mk' : 'va', JSON.stringify(r), JSON.stringify(errs));
  await b.close();
}
