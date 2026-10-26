// main-thread breakdown by trace event name (renderer main thread), panel open + scene playing; optional SCRIPT=1 runs panelScript
import {launch} from './v3-mkp-lib.mjs';
import path from 'path';
const FILE = process.argv[2], [w, h] = (process.argv[3] || '390x844').split('x').map(Number), THR = +process.env.THR || 4, SEC = +process.env.SEC || 5;
const b = await launch();
const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: +process.env.DPR || 3});
const page = await ctx.newPage(); page.on('pageerror', e => console.log('ERR', String(e)));
await page.goto('file://' + path.resolve(FILE)); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const cdp = await ctx.newCDPSession(page);
await page.evaluate(async (o) => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
  const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
  for (let t = 0; t < 2; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * t, v: .8}))); Q.setClip(t, 0, {len: 4, notes});
    Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 2); Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.q.0.k', 11); }
  Q.selectTrack(0); if (!o.closed) Q.openEditor(); await sl(1500); if (o.view && window.MKUI) MKUI.view(o.view); await sl(600); if (!o.stop) { Q.clearLog(); Q.launchScene(0); } await sl(900); }, {closed: !!process.env.CLOSED, view: process.env.VIEW ? JSON.parse(process.env.VIEW) : null, stop: !!process.env.STOP});
await cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
const evs = []; cdp.on('Tracing.dataCollected', d => { for (const e of d.value) evs.push(e); });
await cdp.send('Tracing.start', {categories: 'devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline', transferMode: 'ReportEvents'});
await page.evaluate(async (o) => { console.timeStamp('tr-start'); const PS = o.script && window.MKUI ? MKUI.panelScript(o.sec * 1000) : null; await new Promise(r => setTimeout(r, o.sec * 1000)); if (PS) PS.stop(); console.timeStamp('tr-end'); }, {script: !!process.env.SCRIPT, sec: SEC});
const done = new Promise(r => cdp.once('Tracing.tracingComplete', r)); await cdp.send('Tracing.end'); await done;
const st = evs.find(e => e.name === 'TimeStamp' && e.args?.data?.message === 'tr-start'), en = {ts: st.ts + SEC * 1e6};
const M = evs.filter(e => e.pid === st.pid && e.tid === st.tid && e.ph === 'X' && e.ts >= st.ts && e.ts <= en.ts);
const sum = new Map(), n = new Map(); for (const e of M) { sum.set(e.name, (sum.get(e.name) || 0) + (e.dur || 0)); n.set(e.name, (n.get(e.name) || 0) + 1); }
const span = (en.ts - st.ts) / 1000;
const tasks = M.filter(e => e.name === 'RunTask'); const busy = tasks.reduce((a, e) => a + e.dur, 0) / 1000;
console.log(JSON.stringify({span: +span.toFixed(0), busyMs: +busy.toFixed(0), busyPct: +(busy / span * 100).toFixed(1), top: [...sum].filter(([k]) => k !== 'RunTask').sort((a, b) => b[1] - a[1]).slice(0, 22).map(([k, v]) => k + ' ' + (v / 1000).toFixed(0) + 'ms/' + n.get(k))}));
await b.close();
