// G10-20: 16 Takes à 32 s – Mini-Wellen im Hintergrund ≤ 1,5 s, Heap ≤ +2 MB (kein AudioBuffer je Take), Blatt öffnen ≤ 16 ms Haupt-Faden
import {boot, ok, sheet} from './lib.mjs';
const {b, p, errs} = await boot({width: 428, height: 926}, {args: ['--js-flags=--expose-gc', '--enable-precise-memory-info']});
await p.evaluate(async () => {
  const sr = 48000, n = 32 * sr;
  for (let k = 0; k < 16; k++) {
    const a = new Int16Array(n); for (let i = 0; i < n; i++) { const t = i / sr, env = (Math.floor(t * 2 + k) % 3 === 0) ? 0 : .5 + .4 * Math.sin(t * 3 + k); a[i] = Math.round(9000 * env * Math.sin(2 * Math.PI * (180 + 10 * k) * t)); }
    await SYNQUENZER.tkInject({pcm: a, scene: 0, len: 4});
  }
});
await p.evaluate(() => { TK.buf.clear(); SYNQUENZER.g10cClearPeaks(); });   // keine Puffer im Speicher (nur der hörbare würde geladen)
await p.evaluate(() => { gc(); gc(); });
const h0 = await p.evaluate(() => performance.memory.usedJSHeapSize);
await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(e.duration); }).observe({type: 'longtask', buffered: false}); } catch (e) {} });
const t = await p.evaluate(async () => {
  const t0 = performance.now(); SYNQUENZER.tkSheet({t: SYNQUENZER.tkInfo().stimme, s: 0}); const open = SYNQUENZER.g10cInfo().ms;
  await SYNQUENZER.g10cWaitPeaks(); return {open, all: performance.now() - t0, n: SYNQUENZER.g10cInfo().pkN, pkMs: SYNQUENZER.g10cInfo().pkMs};
});
const lt = await p.evaluate(() => window.__lt);
await p.evaluate(() => { TK.buf.clear(); gc(); gc(); });
const h1 = await p.evaluate(() => performance.memory.usedJSHeapSize);
ok(t.n === 16, '16 Mini-Wellen gerechnet');
ok(t.all <= 1500, 'alle Mini-Wellen in ' + t.all.toFixed(0) + ' ms (≤ 1500)');
ok(t.open <= 16, 'Blatt öffnen ' + t.open.toFixed(1) + ' ms Haupt-Faden (≤ 16)');
ok((h1 - h0) <= 2 * 1024 * 1024, 'Heap +' + ((h1 - h0) / 1048576).toFixed(2) + ' MB (≤ 2 MB, kein AudioBuffer je Take)');
ok(!lt.some(d => d > 50), 'keine langen Aufgaben > 50 ms beim Rechnen (' + JSON.stringify(lt.map(d => Math.round(d))) + ')');
// zweites Öffnen: alles aus dem Cache, ≤ 16 ms
await p.evaluate(() => closePop());
const t2 = await p.evaluate(() => { SYNQUENZER.tkSheet({t: SYNQUENZER.tkInfo().stimme, s: 0}); return SYNQUENZER.g10cInfo().ms; });
ok(t2 <= 16, 'Blatt mit 16 fertigen Wellen öffnen ' + t2.toFixed(1) + ' ms');
ok(errs.length === 0, 'keine Fehler ' + JSON.stringify(errs));
await b.close();
