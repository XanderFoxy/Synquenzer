// Startzeit vorher/nachher mit Hauptfaden-Zeit: je Lauf frischer Kontext, abwechselnd Basis / neu.
// Gemessen bis „App bereit“ (BOOT.done): ready (ms ab Navigation), CDP ScriptDuration + TaskDuration (Hauptfaden-CPU, weniger
// empfindlich gegen Fremdlast als die Wanduhr). Aufruf: node startzeit2.mjs <basis.html> <index.html> [läufe]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import os from 'node:os';
const A = path.resolve(process.argv[2]), B = path.resolve(process.argv[3]), N = +(process.argv[4] || 3);
const b = await chromium.launch();
const res = {basis: [], neu: []};
async function one(f) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable');
  const la = os.loadavg()[0];
  await p.goto('file://' + f, {waitUntil: 'load', timeout: 120000});
  await p.waitForFunction(() => typeof BOOT !== 'undefined' && BOOT.done, null, {polling: 'raf', timeout: 120000});
  const r = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return {dcl: Math.round(n.domContentLoadedEventEnd), ready: Math.round(performance.now())}; });
  const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
  r.script = Math.round(m.ScriptDuration * 1000); r.task = Math.round(m.TaskDuration * 1000); r.last = +la.toFixed(1);
  await ctx.close();
  return r;
}
await one(A);   // Aufwärmen (Datei-Cache), nicht gezählt
for (let k = 0; k < N; k++) { if (k % 2) { res.neu.push(await one(B)); res.basis.push(await one(A)); } else { res.basis.push(await one(A)); res.neu.push(await one(B)); } }   // Reihenfolge wechselt
const med = L => { const s = L.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
const sum = L => ({dcl: med(L.map(x => x.dcl)), ready: med(L.map(x => x.ready)), script: med(L.map(x => x.script)), task: med(L.map(x => x.task))});
console.log(JSON.stringify({laeufe: res, median: {basis: sum(res.basis), neu: sum(res.neu)}}, null, 1));
await b.close();
