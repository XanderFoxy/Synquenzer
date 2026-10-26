// MK-P fix: trace of 4 s idle (panel open, project playing) at CPU x THR, DPR 3: frame counts, layerize, paint, invalidated objects
import {launch, open, FILE, VORG} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 4), F = process.argv[2] || 'P1', WHICH = process.argv[3] || 'new';
const b = await launch(); const page = await open(b, F, {dpr: 3, file: WHICH === 'old' ? VORG : (WHICH === 'new' ? FILE : WHICH)});
await page.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
  const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
  for (let t = 0; t < 2; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * t, v: .8}))); Q.setClip(t, 0, {len: 4, notes});
    Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 2); Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.q.0.k', 11); }
  Q.selectTrack(0); Q.openEditor(); await sl(1500); Q.launchScene(0); });
await page.waitForTimeout(1500);
if (process.env.EXP) await page.evaluate(x => (0, eval)(x), process.env.EXP);
await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
await b.startTracing(page, {categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.invalidationTracking']});
await page.waitForTimeout(4000);
const ev = JSON.parse((await b.stopTracing()).toString()).traceEvents;
await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
const tn = new Map(); for (const e of ev) if (e.name === 'thread_name') tn.set(e.pid + ':' + e.tid, e.args.name);
const M = ev.filter(e => tn.get(e.pid + ':' + e.tid) === 'CrRendererMain');
const sums = new Map(), cnt = new Map();
for (const e of M) { if (e.ph !== 'X' || !e.dur) continue; sums.set(e.name, (sums.get(e.name) || 0) + e.dur); cnt.set(e.name, (cnt.get(e.name) || 0) + 1); }
console.log(F, WHICH, 'x' + THR, '4 s idle, sums (ms):');
console.log([...sums].sort((a, b) => b[1] - a[1]).slice(0, 18).map(([k, v]) => (v / 1000).toFixed(0).padStart(6) + ' ' + String(cnt.get(k)).padStart(5) + 'x ' + k).join('\n'));
const inv = new Map(); for (const e of M) if (/Invalidation/.test(e.name) && e.args && e.args.data) { const d = e.args.data, k = e.name + ' ' + (d.nodeName || d.reason || '') + ' ' + (d.reason || ''); inv.set(k, (inv.get(k) || 0) + 1); }
console.log('--- invalidations'); console.log([...inv].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => String(v).padStart(5) + ' ' + k.slice(0, 150)).join('\n'));
await b.close();
