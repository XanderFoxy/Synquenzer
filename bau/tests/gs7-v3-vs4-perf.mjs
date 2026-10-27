// FP-IPHONE: 60-s-Take (48 kHz) säubern – Rechenzeit im Worker, lange Aufgaben (> 50 ms) auf dem Hauptfaden, rAF während des Säuberns
import {open, sleep} from './v3-vs3-h.mjs';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const H = await open({file: APP}), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
const r = await p.evaluate(() => { const sr = 48000, n = sr * 60, x = new Array(n); let s = 3; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; x[i] = Math.round(Math.sin(i * 0.05 + Math.sin(i * 1e-4) * 30) * 8000 * (Math.floor(i / 24000) % 3 ? 1 : 0) + (s / 2147483647 - 0.5) * 200); } return SYNQUENZER.tkInject({pcm: x, sr, scene: 0, len: 8}); });
await sleep(500);
const m = await p.evaluate(async id => {
  const lt = []; const po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(Math.round(e.duration)); }); try { po.observe({entryTypes: ['longtask']}); } catch (e) {}
  let fr = 0, worst = 0, last = performance.now(), run = true; const raf = () => { const t = performance.now(); worst = Math.max(worst, t - last); last = t; fr++; if (run) requestAnimationFrame(raf); }; requestAnimationFrame(raf);
  const t0 = performance.now(); SYNQUENZER.clSet(id, 60); await SYNQUENZER.clWait(id); const ms = performance.now() - t0;
  run = false; await new Promise(r => setTimeout(r, 100)); po.disconnect();
  return {ms: Math.round(ms), fps: +(fr / (ms / 1000)).toFixed(1), worstFrame: Math.round(worst), longtasks: lt, info: SYNQUENZER.clInfo(id).last};
}, r.id);
console.log(JSON.stringify(m));
ok(m.info.how === 'worker', `60 s Take im Worker gesäubert: ${m.ms} ms gesamt (Kern ${m.info.ms} ms = ${(m.info.ms / 600).toFixed(1)} % Echtzeit, Xeon)`);
ok(!m.longtasks.some(d => d > 50) && m.worstFrame < 100, `Hauptfaden frei: lange Aufgaben ${JSON.stringify(m.longtasks)}, längster Frame ${m.worstFrame} ms, ${m.fps} fps`);
await H.br.close();
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK'); process.exit(fail ? 1 : 0);
