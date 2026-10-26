// MK-P fix: CPU profile of (idle | drag | open) at CPU x THR, DPR 3 with the perf-test setup; prints top self/total times
import {launch, open, touch, tap, line, panel, ctr, tapSel, FILE, VORG} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 4), MODE = process.argv[2] || 'idle', F = process.argv[3] || 'P1', WHICH = process.argv[4] || 'new';
const b = await launch(); const page = await open(b, F, {dpr: 3, file: WHICH === 'old' ? VORG : FILE});
const setup = async (openEd) => page.evaluate(async (openEd) => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
  const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
  for (let t = 0; t < 2; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * t, v: .8}))); Q.setClip(t, 0, {len: 4, notes});
    Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 2); Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.q.0.k', 11); }
  Q.selectTrack(openEd ? 0 : 2); if (openEd) { Q.openEditor(); await sl(1500); } Q.launchScene(0); }, openEd);
await setup(MODE !== 'open'); await page.waitForTimeout(1500);
const c = page.cdp; await c.send('Profiler.enable'); await c.send('Profiler.setSamplingInterval', {interval: 200});
await c.send('Emulation.setCPUThrottlingRate', {rate: THR});
await page.evaluate(() => { window.__tk = []; let lt = 0; clearInterval(AU.timer); AU.timer = setInterval(() => { const n = performance.now(); if (lt) window.__tk.push(n - lt); if (lt && n - lt > 50) (window.__gp = window.__gp || []).push([lt, n]); lt = n; tick(); }, TICK_MS); });
await c.send('Profiler.start');
if (MODE === 'idle') await page.waitForTimeout(6000);
else if (MODE === 'session') { const t0 = Date.now(); for (const id of ['f.cut', 'f.res', 'o1.c1', 'mix.o2']) { const E = (await panel(page)).elements.find(e => e.id === id); const [x, y] = ctr(E); await touch(page, line(x, y, x, y - 70, 20), 16); }
  const E = (await panel(page)).elements.find(e => e.id === 'f.cut'); await tap(page, E.px.x + E.px.w / 2, E.px.y - E.px.h * 1.6); await page.waitForTimeout(260); for (let k = 0; k < 9 && Date.now() - t0 < 7000; k++) { await tapSel(page, '.mknav .mkar:last-child'); await page.waitForTimeout(260); } await tapSel(page, '.mknav .mkmap'); await page.waitForTimeout(300);
  await page.evaluate(() => { MKUI.press('edit'); }); for (const s of ['s6', 's8', 's11']) { await page.evaluate(s => MKUI.press(s), s); await page.waitForTimeout(150); } await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'); while (Date.now() - t0 < 10000) await page.waitForTimeout(200); }
else if (MODE === 'drag') { for (const id of ['f.cut', 'f.res', 'o1.c1', 'mix.o2']) { const E = (await panel(page)).elements.find(e => e.id === id); const [x, y] = ctr(E); await touch(page, line(x, y, x, y - 70, 20), 16); } }
else if (MODE === 'stops') { const E = (await panel(page)).elements.find(e => e.id === 'f.cut'); await tap(page, E.px.x + E.px.w / 2, E.px.y - E.px.h * 1.6); await page.waitForTimeout(400); for (let k = 0; k < 9; k++) { await tapSel(page, '.mknav .mkar:last-child'); await page.waitForTimeout(260); } await tapSel(page, '.mknav .mkmap'); await page.waitForTimeout(300); }
else if (MODE === 'edit') { await page.evaluate(() => { MKUI.press('edit'); }); for (const s of ['s6', 's8', 's11']) { await page.evaluate(s => MKUI.press(s), s); await page.waitForTimeout(150); } await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'); await page.waitForTimeout(1000); }
else if (MODE === 'open') { await page.evaluate(async () => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 1500)); }); }
const {profile} = await c.send('Profiler.stop');
const tk = await page.evaluate(() => window.__tk); const gp = await page.evaluate(() => window.__gp || []); const pnow = await page.evaluate(() => performance.now() + performance.timeOrigin); await c.send('Emulation.setCPUThrottlingRate', {rate: 1});
const byId = new Map(profile.nodes.map(n => [n.id, n])); const self = new Map(); const dt = profile.timeDeltas; const cnt = new Map();
profile.samples.forEach((id, k) => cnt.set(id, (cnt.get(id) || 0) + (dt[k] || 0)));
const parent = new Map(); for (const n of profile.nodes) for (const ch of n.children || []) parent.set(ch, n.id);
const key = n => n.callFrame.functionName + '@' + n.callFrame.lineNumber;
const tot = new Map();
for (const [id, us] of cnt) { const n = byId.get(id); self.set(key(n), (self.get(key(n)) || 0) + us); const seen = new Set(); let p = id; while (p != null) { const q = byId.get(p), k = key(q); if (!seen.has(k)) { seen.add(k); tot.set(k, (tot.get(k) || 0) + us); } p = parent.get(p); } }
const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => (v / 1000).toFixed(1).padStart(7) + ' ' + k).join('\n');
console.log(MODE, F, WHICH, 'x' + THR, 'gaps>50', tk.filter(x => x > 50).length, 'max', Math.round(Math.max(...tk)));
// per gap: what the samples show (top JS frame under root, or program/idle/gc)
{ const ts = []; let t = profile.startTime; profile.samples.forEach((id, k) => { t += profile.timeDeltas[k] || 0; ts.push(t); });
  const to = await page.evaluate(() => performance.timeOrigin);
  const lab = id => { let n = byId.get(id), path = []; while (n) { path.push(n.callFrame.functionName || '(anon)'); n = byId.get(parent.get(n.id)); } path.reverse(); return path.slice(1, 5).join('>'); };
  const agg = new Map();
  for (const [a, z] of gp) { const A = (a + to) * 1000, Z = (z + to) * 1000; const m = new Map(); profile.samples.forEach((id, k) => { if (ts[k] >= A && ts[k] <= Z) { const l = lab(id); m.set(l, (m.get(l) || 0) + (profile.timeDeltas[k + 1] || 200)); agg.set(l, (agg.get(l) || 0) + (profile.timeDeltas[k + 1] || 200)); } });
    if (process.env.GAPS) console.log('gap', Math.round(z - a), [...m].sort((x, y) => y[1] - x[1]).slice(0, 5).map(([l, v]) => (v / 1000).toFixed(0) + ' ' + l).join(' | ')); }
  console.log('--- inside gaps (sum)'); console.log([...agg].sort((x, y) => y[1] - x[1]).slice(0, 30).map(([l, v]) => (v / 1000).toFixed(1).padStart(7) + ' ' + l).join('\n')); }
console.log('--- self'); console.log(top(self, 25)); console.log('--- total'); console.log(top(tot, 45));
await b.close();
