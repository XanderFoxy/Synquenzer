// MK-P fix: CPU profile of an action (first SPIEL tab in landscape | first panel open), x THR
import {launch, open, openMk, tapSel, FILE, VORG} from './v3-qmkp-lib.mjs';
const THR = +(process.env.THR || 1), F = process.argv[2] || 'L1', WHAT = process.argv[3] || 'spiel';
const b = await launch(); const page = await open(b, F, {dpr: 3, file: process.env.OLD ? VORG : FILE});
if (WHAT === 'spiel') { await page.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 800)); }); await openMk(page); await page.waitForTimeout(800); }
else { await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(1); }); await page.waitForTimeout(800); }
const c = page.cdp; await c.send('Profiler.enable'); await c.send('Profiler.setSamplingInterval', {interval: 100}); await c.send('Emulation.setCPUThrottlingRate', {rate: THR});
await c.send('Profiler.start');
if (WHAT === 'spiel') { await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'); await page.waitForTimeout(700); }
else { await page.evaluate(async () => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 1200)); }); }
const {profile} = await c.send('Profiler.stop'); await c.send('Emulation.setCPUThrottlingRate', {rate: 1});
const byId = new Map(profile.nodes.map(n => [n.id, n])), parent = new Map(); for (const n of profile.nodes) for (const ch of n.children || []) parent.set(ch, n.id);
const cnt = new Map(); profile.samples.forEach((id, k) => cnt.set(id, (cnt.get(id) || 0) + (profile.timeDeltas[k] || 0)));
const key = n => n.callFrame.functionName + '@' + n.callFrame.lineNumber; const tot = new Map(), self = new Map();
for (const [id, us] of cnt) { const n = byId.get(id); self.set(key(n), (self.get(key(n)) || 0) + us); const seen = new Set(); let p = id; while (p != null) { const q = byId.get(p), k = key(q); if (!seen.has(k)) { seen.add(k); tot.set(k, (tot.get(k) || 0) + us); } p = parent.get(p); } }
const top = (m, n) => [...m].filter(([k]) => !/^\((idle|root)\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => (v / 1000).toFixed(1).padStart(7) + ' ' + k).join('\n');
console.log(WHAT, F, 'x' + THR, '--- total'); console.log(top(tot, 40)); console.log('--- self'); console.log(top(self, 20));
await b.close();
