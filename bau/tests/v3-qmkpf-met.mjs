// MK-P fix: CDP Performance metrics (Task/Script/Layout/RecalcStyle durations, counts) per phase of the perf session, CPU x THR, DPR 3
import {launch, open, touch, tap, line, panel, ctr, tapSel, FILE, VORG} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 4), F = process.argv[2] || 'P1', WHICH = process.argv[3] || 'new';
const b = await launch(); const page = await open(b, F, {dpr: 3, file: WHICH === 'old' ? VORG : (WHICH === 'new' ? FILE : WHICH)});
await page.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
  const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
  for (let t = 0; t < 2; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * t, v: .8}))); Q.setClip(t, 0, {len: 4, notes});
    Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 2); Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.q.0.k', 11); }
  Q.selectTrack(0); Q.openEditor(); await sl(1500); Q.launchScene(0); });
await page.waitForTimeout(1500);
if (process.env.EXP) { await page.evaluate(x => { (0, eval)(x); }, process.env.EXP); await page.waitForTimeout(300); }
const c = page.cdp; await c.send('Performance.enable'); await c.send('Emulation.setCPUThrottlingRate', {rate: THR});
await page.evaluate(() => { window.__tk = []; let lt = 0; clearInterval(AU.timer); AU.timer = setInterval(() => { const n = performance.now(); if (lt) window.__tk.push(n - lt); lt = n; tick(); }, TICK_MS); });
const K = ['TaskDuration', 'ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration', 'LayoutCount', 'RecalcStyleCount', 'Nodes', 'TaskOtherDuration'];
const met = async () => { const {metrics} = await c.send('Performance.getMetrics'); const o = {}; for (const m of metrics) if (K.includes(m.name)) o[m.name] = m.value; return o; };
const res = []; let m0 = await met(), w0 = Date.now(), g0 = 0;
const mark = async nm => { const m1 = await met(), w1 = Date.now(); const tk = await page.evaluate(() => window.__tk.length ? window.__tk : [0]); const g = tk.slice(g0); g0 = tk.length;
  res.push([nm.padEnd(8), 'wall', w1 - w0, 'task', Math.round((m1.TaskDuration - m0.TaskDuration) * 1000), 'script', Math.round((m1.ScriptDuration - m0.ScriptDuration) * 1000), 'style', Math.round((m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000) + '/' + (m1.RecalcStyleCount - m0.RecalcStyleCount), 'layout', Math.round((m1.LayoutDuration - m0.LayoutDuration) * 1000) + '/' + (m1.LayoutCount - m0.LayoutCount), 'other', Math.round((m1.TaskOtherDuration - m0.TaskOtherDuration) * 1000), 'gaps>50', g.filter(x => x > 50).length, 'max', Math.round(Math.max(...g)), 'nodes', m1.Nodes].join(' ')); m0 = m1; w0 = w1; };
const isNew = WHICH !== 'old';
if (process.env.IDLE || !isNew) { await page.waitForTimeout(5000); await mark('idle'); }
else if (process.env.DRAG) { for (const id of ['f.cut', 'f.res', 'o1.c1', 'mix.o2']) { const E = (await panel(page)).elements.find(e => e.id === id); const [x, y] = ctr(E); await touch(page, line(x, y, x, y - 70, 20), 16); } await mark('drags'); }
else {
  for (const id of ['f.cut', 'f.res', 'o1.c1', 'mix.o2']) { const E = (await panel(page)).elements.find(e => e.id === id); const [x, y] = ctr(E); await touch(page, line(x, y, x, y - 70, 20), 16); } await mark('drags');
  const E = (await panel(page)).elements.find(e => e.id === 'f.cut'); await tap(page, E.px.x + E.px.w / 2, E.px.y - E.px.h * 1.6); await page.waitForTimeout(260); await mark('tapzoom');
  for (let k = 0; k < 9; k++) { await tapSel(page, '.mknav .mkar:last-child'); await page.waitForTimeout(260); } await mark('stops');
  await tapSel(page, '.mknav .mkmap'); await page.waitForTimeout(300); await mark('map');
  await page.evaluate(() => { MKUI.press('edit'); }); for (const s of ['s6', 's8', 's11']) { await page.evaluate(s => MKUI.press(s), s); await page.waitForTimeout(150); } await mark('edit');
  await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'); await page.waitForTimeout(800); await mark('spiel');
  await page.waitForTimeout(2000); await mark('idle2');
}
await c.send('Emulation.setCPUThrottlingRate', {rate: 1});
if (process.env.MUDUMP) console.log(await page.evaluate(() => JSON.stringify([...(window.__mu || [])].sort((a, b) => b[1] - a[1]).slice(0, 30))));
console.log(F, WHICH, 'x' + THR); for (const r of res) console.log(' ', r);
await b.close();
