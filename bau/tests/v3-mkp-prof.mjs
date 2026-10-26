// CPU profile of the MK-P panel session (P1, DPR 3, x4) to find the long tasks
import {launch} from './v3-mkp-lib.mjs';
import path from 'path';
const FILE = process.argv[2], [w, h] = (process.argv[3] || '390x844').split('x').map(Number), THR = +process.env.THR || 4;
const b = await launch();
const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 3});
const page = await ctx.newPage(); page.on('pageerror', e => console.log('ERR', String(e)));
await page.addInitScript((ns) => { window.__noScript = ns; window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); } catch (e) {} }, !!process.env.NOSCRIPT);
await page.goto('file://' + path.resolve(FILE)); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const cdp = await ctx.newCDPSession(page);
await page.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
  const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
  for (let t = 0; t < 2; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * t, v: .8}))); Q.setClip(t, 0, {len: 4, notes});
    Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 2); Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.q.0.k', 11); }
  Q.selectTrack(0); Q.openEditor(); await sl(1500); Q.clearLog(); Q.launchScene(0); await sl(900); });
await cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {interval: 200}); await cdp.send('Profiler.start');
const r = await page.evaluate(async () => { window.__lt.length = 0; const t0 = performance.now(); const PS = window.__noScript || !window.MKUI || !MKUI.panelScript ? {stop() {}, res: null} : MKUI.panelScript(10000); await new Promise(r => setTimeout(r, 10300)); PS.stop(); return {lt: window.__lt.map(x => [x[0] - Math.round(t0), x[1]]), res: PS.res}; });
const {profile} = await cdp.send('Profiler.stop');
const self = new Map(), byId = new Map(profile.nodes.map(n => [n.id, n])); const dt = profile.timeDeltas; const cnt = new Map();
profile.samples.forEach((id, k) => cnt.set(id, (cnt.get(id) || 0) + (dt[k] || 0)));
for (const [id, us] of cnt) { const n = byId.get(id), f = n.callFrame, key = (f.functionName || '(anon)') + ':' + f.lineNumber; self.set(key, (self.get(key) || 0) + us); }
const top = [...self].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => k + ' ' + (v / 1000).toFixed(0) + 'ms');
// inclusive
const parent = new Map(); for (const n of profile.nodes) for (const c of n.children || []) parent.set(c, n.id);
const incl = new Map(); for (const [id, us] of cnt) { const seen = new Set(); let x = id; while (x != null) { const n = byId.get(x), f = n.callFrame, key = (f.functionName || '(anon)') + ':' + f.lineNumber; if (!seen.has(key)) { seen.add(key); incl.set(key, (incl.get(key) || 0) + us); } x = parent.get(x); } }
const topI = [...incl].sort((a, b) => b[1] - a[1]).slice(0, 45).map(([k, v]) => k + ' ' + (v / 1000).toFixed(0) + 'ms');
console.log(JSON.stringify({lt: r.lt, res: r.res, self: top, incl: topI}, null, 1));
await b.close();
