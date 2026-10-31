// VS-P-fix: lange Tasks beim Spielen eines 16-Takt-Takes mit arbeitendem Spitzen-Schutz (langsamstes Tempo), ohne Mitschnitt;
// jede lange Aufgabe wird den gemessenen App-Funktionen zugeordnet (vpPump, tkStartSrc, Planer). node n4-vs-p-fix-lt.mjs <app> [bpm] [bars]
import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
const FILE = process.argv[2] || APP, BPMX = +(process.argv[3] || 40), BARS = +(process.argv[4] || 16);
const H = await open({file: FILE}), p = H.p;
await p.evaluate(b => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(b); }, BPMX);
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate), N = Math.round(BARS * 240 / BPMX * sr);
// Take im Browser erzeugen (kein riesiges Array über die Leitung): leiser Ton + Plosiv jede Sekunde
const id = await p.evaluate(([N, sr, L]) => { const pc = new Int16Array(N); let s = 7; for (let i = 0; i < N; i++) pc[i] = Math.round(0.02 * 32767 * Math.sin(2 * Math.PI * 1000 * i / sr));
  const n = Math.round(0.004 * sr); for (let t = 0.75; t < N / sr - 0.1; t += 1) { const i0 = Math.round(t * sr); for (let j = 0; j < n; j++) { s = (s * 16807) % 2147483647; pc[i0 + j] = Math.max(-32768, Math.min(32767, pc[i0 + j] + Math.round(0.95 * 32767 * Math.sin(Math.PI * j / n) * (s / 2147483647 * 2 - 1)))); } }
  return SYNQUENZER.tkInject({pcm: Array.from(pc), sr, scene: 0, len: L}).id; }, [N, sr, BARS]);
await p.evaluate(() => SYNQUENZER.vpWait && SYNQUENZER.vpWait());
await sleep(500);
const vi = await p.evaluate(id => SYNQUENZER.vpInfo ? SYNQUENZER.vpInfo().takes[id] : null, id);
await p.evaluate(() => { const W = window.__W = {}; for (const f of ['vpPump', 'tkStartSrc', 'vpLim', 'tkSched', 'scheduler', 'tick', 'schedTick']) { const o = window[f]; if (typeof o !== 'function') continue;
    window[f] = function () { const t0 = performance.now(); try { return o.apply(this, arguments); } finally { const d = performance.now() - t0; const w = W[f] || (W[f] = {n: 0, max: 0, sum: 0, at: 0}); w.n++; w.sum += d; if (d > w.max) { w.max = d; w.at = t0; } } }; }
  window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([+e.startTime.toFixed(0), +e.duration.toFixed(1)]); }).observe({type: 'longtask'});
  window.__t0 = performance.now(); SYNQUENZER.launchScene(0); });
const sec = BARS * 240 / BPMX * 1.5 + 2; await sleep(sec * 1000);
const r = await p.evaluate(() => ({lt: window.__lt.map(([a, d]) => [+((a - window.__t0) / 1000).toFixed(2), d]), W: Object.fromEntries(Object.entries(window.__W).map(([k, w]) => [k, {n: w.n, maxMs: +w.max.toFixed(1), sumMs: +w.sum.toFixed(1)}]))}));
await p.evaluate(() => SYNQUENZER.stop());
console.log(FILE.split('/').slice(-2).join('/'), await p.evaluate(() => SYNQUENZER.version), BPMX + ' BPM', BARS + ' Takte', (N / sr).toFixed(1) + ' s', 'vp', JSON.stringify(vi && vi.heard));
console.log('  lange Tasks [s nach Start, ms]:', JSON.stringify(r.lt), ' über 50 ms:', r.lt.filter(x => x[1] > 50).length);
console.log('  App-Funktionen:', JSON.stringify(r.W));
console.log('  Konsole', JSON.stringify(H.errs.slice(0, 2)));
await H.br.close();
