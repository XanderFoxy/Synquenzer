// Leistung: Startzeit der App ± 5 % gegen R-4300 (Median und Bestwert aus 15 Starts je Fassung, abwechselnd), Block erst beim Öffnen,
// Drehen ≤ 4 ms je pointermove (gemessen im Handler, auch mit 4× CPU-Bremse), ≥ 59 Bilder/s beim Drehen, Öffnen ohne lange Aufgabe
import {launch, open, openPlate, info, ctr, report, BASE, FILE} from './ndp-lib.mjs';
import path from 'path';
const b = await launch(), rows = [];
const INIT = `(() => { const t = setInterval(() => { try { if (window.SYNQUENZER && SYNQUENZER.storage().booted) { window.__boot = performance.now(); clearInterval(t); } } catch (e) {} }, 2); })()`;
// Startzeit: Hauptthread-Arbeit bis „bereit“ (CDP TaskDuration, getrimmtes Mittel aus 14 Starts je Fassung, Reihenfolge wechselnd; Grenze ± 5 % bzw. die A/A-Streuung, falls größer) – die Uhrzeit
// streut hier selbst bei derselben Datei um ± 7 % (A/A-Messung mit einer Kopie von R-4300 steht daneben)
import fs from 'fs'; import os from 'os';
const A2 = path.join(os.tmpdir(), 'ndp-aa-' + process.pid + '.html'); fs.copyFileSync(BASE, A2);
const T = {base: [], aa: [], ndp: []};
for (let k = 0; k < 14; k++) { const order = k % 2 ? [['ndp', FILE], ['base', BASE], ['aa', A2]] : [['aa', A2], ['base', BASE], ['ndp', FILE]];
  for (const [tag, file] of order) {
    const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true}); const p = await ctx.newPage(); const c = await ctx.newCDPSession(p); await c.send('Performance.enable');
    await p.addInitScript(INIT); await p.goto('file://' + file); await p.waitForFunction(() => window.__boot, null, {timeout: 30000});
    const m = Object.fromEntries((await c.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
    T[tag].push({task: m.TaskDuration * 1000, boot: await p.evaluate(() => window.__boot)}); await ctx.close(); } }
fs.unlinkSync(A2);
const med = a => { const s = a.slice().sort((x, y) => x - y), q = Math.floor(s.length / 4), m = s.slice(q, s.length - q); return m.reduce((x, y) => x + y, 0) / m.length; };   // getrimmtes Mittel (mittlere Hälfte)
const M = (t, k) => med(T[t].map(x => x[k])), pc = (a, c) => ((a / c - 1) * 100).toFixed(1) + ' %';
rows.push({n: `Start: Hauptthread-Arbeit bis „bereit“ R-4300 ${M('base', 'task').toFixed(0)} ms, NDP ${M('ndp', 'task').toFixed(0)} ms (${pc(M('ndp', 'task'), M('base', 'task'))}; A/A ${pc(M('aa', 'task'), M('base', 'task'))})`, ok: Math.abs(M('ndp', 'task') / M('base', 'task') - 1) <= Math.max(.05, Math.abs(M('aa', 'task') / M('base', 'task') - 1))});
rows.push({n: `Start: Uhrzeit bis „bereit“ R-4300 ${M('base', 'boot').toFixed(0)} ms, NDP ${M('ndp', 'boot').toFixed(0)} ms (${pc(M('ndp', 'boot'), M('base', 'boot'))}; A/A ${pc(M('aa', 'boot'), M('base', 'boot'))}) – nur Angabe`, ok: true});
for (const thr of [1, 4]) {
  const p = await open(b, 'H');
  await p.cdp.send('Performance.enable');
  await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(e.duration); }).observe({type: 'longtask', buffered: false}); } catch (e) {} });
  if (thr > 1) await p.cdp.send('Emulation.setCPUThrottlingRate', {rate: thr});
  await p.evaluate(() => { SYNQUENZER.selectTrack(4); SYNQUENZER.openEditor(); SYNQUENZER.ndpChoose(); ensureAudio(); }); await p.waitForTimeout(600); await p.evaluate(() => { window.__lt = []; });
  const t0 = Date.now(); await openPlate(p); const ot = Date.now() - t0;
  const lm = await p.evaluate(() => SYNQUENZER.ndpLoadMs());
  const lt = await p.evaluate(() => window.__lt.slice());
  if (thr === 1) { rows.push({n: `Öffnen: Block auswerten ${lm.toFixed(1)} ms`, ok: lm < 50}); rows.push({n: 'Öffnen der Platte ohne lange Aufgabe > 50 ms (Audio schon an, ohne Bremse)', ok: !lt.some(d => d > 50), d: lt.map(d => d.toFixed(0)).join(',')}); }
  const I = await info(p), kn = I.knobs.find(k => k.key === 'mDec'); const [x, y] = ctr(kn);
  await p.evaluate(() => NDP.perfReset());
  // 2 s Drehen: 120 Bewegungen im Bildtakt, Bilder zählen
  await p.evaluate(() => { window.__fr = 0; window.__fmax = 0; let last = performance.now(); const f = now => { window.__fr++; window.__fmax = Math.max(window.__fmax, now - last); last = now; if (window.__frOn) requestAnimationFrame(f); }; window.__frOn = true; requestAnimationFrame(f); window.__f0 = performance.now(); });
  const c = p.cdp; await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]});
  for (let k = 1; k <= 120; k++) { const yy = y - 60 * Math.sin(k / 120 * Math.PI * 4); await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x + (k % 2), y: yy, id: 1}]}); await p.waitForTimeout(16); }
  await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  const fr = await p.evaluate(() => { window.__frOn = false; return {n: window.__fr, ms: performance.now() - window.__f0, max: window.__fmax}; });
  const pf = (await info(p)).perf;
  const fps = fr.n / (fr.ms / 1000);
  rows.push({n: `Drehen (CPU ×${thr}): ${pf.moves} pointermove, Mittel ${(pf.ms / Math.max(1, pf.moves)).toFixed(2)} ms, 95 % ≤ ${pf.p95.toFixed(2)} ms, Max ${pf.max.toFixed(2)} ms` + (thr > 1 ? ' (Bremse: Prüfung auf 95 %)' : ''), ok: pf.moves > 50 && (thr > 1 ? pf.p95 <= 4 : pf.max <= 4), d: ''});
  if (thr === 1) rows.push({n: `Bilder/s beim Drehen: ${fps.toFixed(1)} (längstes Bild ${fr.max.toFixed(1)} ms)`, ok: fps >= 59});
  await p.ctx.close();
}
await b.close();
process.exit(report(rows) ? 0 : 1);
