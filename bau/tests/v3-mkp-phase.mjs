// MK-P-09: which part of the panel session costs main-thread time (x4): tick gaps and rAF per phase
import {launch} from './v3-mkp-lib.mjs';
import path from 'path';
const FILE = process.argv[2], [w, h] = (process.argv[3] || '390x844').split('x').map(Number), THR = +process.env.THR || 4;
const b = await launch();
const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 3});
const page = await ctx.newPage(); page.on('pageerror', e => console.log('ERR', String(e)));
await page.goto('file://' + path.resolve(FILE)); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const cdp = await ctx.newCDPSession(page);
await page.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
  const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
  for (let t = 0; t < 2; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * t, v: .8}))); Q.setClip(t, 0, {len: 4, notes});
    Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 2); Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.q.0.k', 11); }
  Q.selectTrack(0); Q.openEditor(); await sl(1500); Q.clearLog(); Q.launchScene(0); await sl(900); });
await cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
const PH = (process.env.PH || 'idle,knob,zoom,halts,pages,spiel').split(',');
for (const ph of PH) {
  if (process.env.PROF) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {interval: 100}); await cdp.send('Profiler.start'); }
  const r = await page.evaluate(async (ph) => {
    const sl = ms => new Promise(r => setTimeout(r, ms)), M = MKUI, P = M.P;
    if (M.view) { if (ED.tab !== 'geraet') M.view({ansicht: 'ganz'}); M.view({ansicht: 'ganz', modus: 'spiel'}); } await sl(800);
    const tk = []; let lastTk = 0; clearInterval(AU.timer); AU.timer = setInterval(() => { const n = performance.now(); if (lastTk) tk.push(n - lastTk); lastTk = n; tick(); }, TICK_MS);
    const raf = []; let on = true, lastF = 0; const rf = n => { if (lastF) raf.push(n - lastF); lastF = n; if (on) requestAnimationFrame(rf); }; requestAnimationFrame(rf);
    const t0 = performance.now(); let k = 0;
    const act = async () => {
      if (ph === 'idle') { await sl(3000); return; }
      if (ph === 'knob') { const d = M.defOf('f.cut'), [lo, hi] = M.range(d); while (performance.now() - t0 < 3000) { M.setv(d, lo + (hi - lo) * (.5 + .4 * Math.sin(k++ / 4)), true); P.lastKnob = d; M.renderSoon(); await new Promise(r => requestAnimationFrame(r)); } return; }
      if (ph === 'knobv') { const d = M.KN.cut, [lo, hi] = M.range(d); while (performance.now() - t0 < 3000) { M.setv(d, lo + (hi - lo) * (.5 + .4 * Math.sin(k++ / 4)), true); (M.renderSoon || M.render)(); await new Promise(r => requestAnimationFrame(r)); } return; }
      if (ph === 'zoom') { for (let n = 0; n < 6; n++) { M.zoomTo(4); await sl(250); M.toOverview(); await sl(250); } return; }
      if (ph === 'halts') { for (let n = 1; n <= 13; n++) { M.zoomTo(n); await sl(230); } return; }
      if (ph === 'pages') { P.mode = 'edit'; for (let n = 1; n <= 12; n++) { M.press('s' + n); await sl(250); } P.mode = 'spiel'; M.renderSoon(); return; }
      if (ph === 'spiel') { for (let n = 0; n < 6; n++) { M.view({ansicht: 'spiel'}); await sl(250); M.view({ansicht: 'ganz'}); await sl(250); } return; }
    };
    await act(); on = false; clearInterval(AU.timer); AU.timer = setInterval(tick, TICK_MS);
    const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length * p)] || 0; };
    return {ph, ms: Math.round(performance.now() - t0), tickGt50: tk.filter(x => x > 50).length, tickMax: Math.round(Math.max(...tk)), tickP95: Math.round(q(tk, .95)), rafP95: +q(raf, .95).toFixed(1), rafMed: +q(raf, .5).toFixed(1), frames: raf.length};
  }, ph);
  console.log(JSON.stringify(r));
  if (process.env.PROF) { const {profile} = await cdp.send('Profiler.stop');
    const byId = new Map(profile.nodes.map(n => [n.id, n])), cnt = new Map(); profile.samples.forEach((id, k) => cnt.set(id, (cnt.get(id) || 0) + (profile.timeDeltas[k] || 0)));
    const parent = new Map(); for (const n of profile.nodes) for (const c of n.children || []) parent.set(c, n.id);
    const incl = new Map(), self = new Map(); for (const [id, us] of cnt) { const f0 = byId.get(id).callFrame, k0 = (f0.functionName || '(anon)') + ':' + f0.lineNumber; self.set(k0, (self.get(k0) || 0) + us); const seen = new Set(); let x = id; while (x != null) { const n = byId.get(x), f = n.callFrame, key = (f.functionName || '(anon)') + ':' + f.lineNumber; if (!seen.has(key)) { seen.add(key); incl.set(key, (incl.get(key) || 0) + us); } x = parent.get(x); } }
    const fl = m => [...m].filter(([k]) => !/^\((root|program|idle)\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => k + ' ' + (v / 1000).toFixed(0)).join(' | ');
    console.log('INCL', fl(incl)); console.log('SELF', fl(self)); }
}
await b.close();
