// Startzeit vorher/nachher: je Lauf ein frischer Browser-Kontext, abwechselnd Basis und neue Fassung (3 Läufe je Datei).
// Gemessen: DOMContentLoaded-Ende, load-Ende und „App bereit“ (BOOT.done, abgefragt je Bild) – alles ab Navigationsbeginn.
// Aufruf: node startzeit.mjs <basis.html> <index.html> [läufe]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
const A = path.resolve(process.argv[2]), B = path.resolve(process.argv[3]), N = +(process.argv[4] || 3);
const b = await chromium.launch();
const res = {basis: [], neu: []};
async function one(f) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const p = await ctx.newPage();
  await p.goto('file://' + f, {waitUntil: 'load', timeout: 120000});
  await p.waitForFunction(() => typeof BOOT !== 'undefined' && BOOT.done, null, {polling: 'raf', timeout: 120000});
  const r = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return {dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), ready: Math.round(performance.now())}; });
  await ctx.close();
  return r;
}
await one(A);   // Aufwärmen (Datei-Cache), nicht gezählt
for (let k = 0; k < N; k++) { res.basis.push(await one(A)); res.neu.push(await one(B)); }
const med = L => { const s = L.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
const sum = L => ({dcl: med(L.map(x => x.dcl)), load: med(L.map(x => x.load)), ready: med(L.map(x => x.ready))});
console.log(JSON.stringify({laeufe: res, median: {basis: sum(res.basis), neu: sum(res.neu)}}, null, 1));
await b.close();
