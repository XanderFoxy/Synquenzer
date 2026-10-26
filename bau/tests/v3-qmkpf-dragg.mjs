// MK-P fix: where in a knob drag the scheduler gaps fall (x THR, DPR 3): marks for panel() call, touch start, moves, end
import {launch, open, touch, line, panel, ctr, FILE} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 4), F = process.argv[2] || 'P1';
const b = await launch(); const page = await open(b, F, {dpr: 3});
await page.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
  const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
  for (let t = 0; t < 2; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * t, v: .8}))); Q.setClip(t, 0, {len: 4, notes});
    Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 2); Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.q.0.k', 11); }
  Q.selectTrack(0); Q.openEditor(); await sl(1500); Q.launchScene(0); });
await page.waitForTimeout(1500);
await page.cdp.send('Emulation.setCPUThrottlingRate', {rate: THR});
await page.evaluate(() => { window.__m = []; window.__t0 = performance.now(); window.__g = []; let lt = 0; clearInterval(AU.timer); AU.timer = setInterval(() => { const n = performance.now(); if (lt && n - lt > 50) window.__g.push([Math.round(lt - window.__t0), Math.round(n - lt)]); lt = n; tick(); }, TICK_MS); });
const mk = nm => page.evaluate(nm => window.__m.push([nm, Math.round(performance.now() - window.__t0)]), nm);
for (const id of ['f.cut', 'f.res', 'o1.c1', 'mix.o2']) { await mk('panel ' + id); const E = (await panel(page)).elements.find(e => e.id === id); await mk('touch'); const [x, y] = ctr(E); await touch(page, line(x, y, x, y - 70, 20), 16); await mk('end'); await page.waitForTimeout(400); }
const r = await page.evaluate(() => ({m: window.__m, g: window.__g}));
console.log(JSON.stringify(r.m)); console.log('gaps', JSON.stringify(r.g));
await b.close();
