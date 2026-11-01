// 4.30.0: Startzeit ohne North-Pad gegen 4.28.0 (abwechselnd, je n Läufe, frischer Kontext), CPU ×1 und ×4 (Drosselung wie ein langsames Telefon).
// Gemessen: DOMContentLoaded, load, „App bereit“ (SYNQUENZER.version da), Skript-/Task-Zeit (CDP) bis bereit, JS-Heap; dazu: kein North-Modul
// (addModule-Haken, MDX.info), auch nicht nach ▶ eines Songs mit Werks-Kit.  Aufruf: node north-startzeit.mjs <neu.html> <alt.html> [n=8]
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
const [NEW, OLD, nArg] = process.argv.slice(2), N = +(nArg || 8);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function once(file, rate) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.addInitScript(() => { window.__adds = []; const o = AudioWorklet.prototype.addModule; AudioWorklet.prototype.addModule = function (u) { window.__adds.push(String(u).slice(0, 200)); return o.apply(this, arguments); };
    // „App bereit“ = der Augenblick, in dem die App window.SYNQUENZER setzt (Zugriffs-Haken, genau; kein Abfragen im Takt)
    let Sq; Object.defineProperty(window, 'SYNQUENZER', {configurable: true, get: () => Sq, set: v => { Sq = v; if (!window.__ready) window.__ready = performance.now(); }}); });
  const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable'); if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', {rate});
  await p.goto('file://' + file); await p.waitForFunction(() => window.__ready && window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 60000});
  const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
  const r = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return {dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd, ready: window.__ready}; });
  if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
  // ▶ mit Werks-Kit (Demo-Projekt), 1,5 s: North darf nicht laden
  const md = await p.evaluate(async () => { ensureAudio(); SYNQUENZER.play && SYNQUENZER.play(); await new Promise(r => setTimeout(r, 1500)); SYNQUENZER.stop && SYNQUENZER.stop();
    const i = typeof MDX === 'object' ? MDX.info() : null; return {adds: window.__adds.filter(u => /drum model engine|synq-md/.test(atob((u.split(',')[1] || '').slice(0, 120)) || u)).length, all: window.__adds.length, st: i && i.state, mdAdds: i && i.adds, pads: typeof mdUsed === 'function' ? mdUsed() : false}; });
  await ctx.close();
  return Object.assign(r, {script: m.ScriptDuration * 1000, task: m.TaskDuration * 1000, heap: m.JSHeapUsedSize / 1048576, md, errs: errs.length});
}
const med = a => { const s = a.slice().sort((x, y) => x - y); return +(s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2).toFixed(1); };
const out = {};
for (const rate of [1, 4]) {
  const R = {neu: [], alt: []};
  await once(OLD, rate); await once(NEW, rate);                     // Aufwärmen (Datei-Cache)
  for (let i = 0; i < N; i++) { R.alt.push(await once(OLD, rate)); R.neu.push(await once(NEW, rate)); }
  for (const k of ['alt', 'neu']) out[k + '×' + rate] = Object.fromEntries(['dcl', 'load', 'ready', 'script', 'task', 'heap'].map(f => [f, med(R[k].map(x => x[f]))]).concat([['md', R[k].map(x => x.md.adds + '/' + x.md.mdAdds + '/' + x.md.st).filter((v, i, a) => a.indexOf(v) === i)], ['errs', R[k].reduce((n, x) => n + x.errs, 0)]]));
  out['diff×' + rate] = Object.fromEntries(['dcl', 'load', 'ready', 'script', 'task', 'heap'].map(f => [f, +(out['neu×' + rate][f] - out['alt×' + rate][f]).toFixed(1)]));
}
console.log(JSON.stringify(out, null, 1));
const okNo = ['neu×1', 'neu×4'].every(k => out[k].md.length === 1 && /^0\/0\//.test(out[k].md[0])) && !out['neu×1'].errs;
console.log('ohne North-Pad kein North-Modul (auch nach ▶):', okNo ? '✓' : '✗');
await b.close(); process.exit(okNo ? 0 : 1);
