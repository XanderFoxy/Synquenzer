// first opening of the MS 2000 sheet: long tasks + CPU profile (x4, DPR 3)
import {launch} from './v3-mkp-lib.mjs';
import path from 'path';
const FILE = process.argv[2], [w, h] = (process.argv[3] || '390x844').split('x').map(Number), THR = +process.env.THR || 4;
const b = await launch();
const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 3});
const page = await ctx.newPage(); page.on('pageerror', e => console.log('ERR', String(e)));
await page.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
await page.goto('file://' + path.resolve(FILE)); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const cdp = await ctx.newCDPSession(page);
await page.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); ensureAudio(); await sl(1200); for (let t = 0; t < 2; t++) Q.setEngine(t, 'mk'); Q.selectTrack(2); await sl(800); });
await cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {interval: 100}); await cdp.send('Profiler.start');
const r = await page.evaluate(async () => { window.__lt.length = 0; const t0 = performance.now(); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 1500)); return {lt: window.__lt.map(x => [x[0] - Math.round(t0), x[1]]), pl: window.MKUI && MKUI.PL ? {done: MKUI.PL.done, ms: MKUI.PL.ms, n: MKUI.PL.slices && MKUI.PL.slices.length, mx: MKUI.PL.slices && Math.max(...MKUI.PL.slices)} : null}; });
const {profile} = await cdp.send('Profiler.stop');
const byId = new Map(profile.nodes.map(n => [n.id, n])), cnt = new Map(); profile.samples.forEach((id, k) => cnt.set(id, (cnt.get(id) || 0) + (profile.timeDeltas[k] || 0)));
const parent = new Map(); for (const n of profile.nodes) for (const c of n.children || []) parent.set(c, n.id);
const incl = new Map(); for (const [id, us] of cnt) { const seen = new Set(); let x = id; while (x != null) { const n = byId.get(x), f = n.callFrame, key = (f.functionName || '(anon)') + ':' + f.lineNumber; if (!seen.has(key)) { seen.add(key); incl.set(key, (incl.get(key) || 0) + us); } x = parent.get(x); } }
console.log(JSON.stringify({lt: r.lt, pl: r.pl, incl: [...incl].filter(([k]) => !/^\((root|program|idle)\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, v]) => k + ' ' + (v / 1000).toFixed(0))}));
await b.close();
