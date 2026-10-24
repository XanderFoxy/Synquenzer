// T13: Demo läuft, 16 Takte Gesang (70 BPM), Tipp FANG 🎤: werden Noten der laufenden Spuren zu spät gestartet (Hauptfaden blockiert
// ohne tickAhead)? Messung: start(when) mit when < currentTime. Optional CPU-Drosselung (CDP) als iPhone-Näherung.
import {open, sleep, voice, playAtBeat, waitBeat, result, micOnApi} from './v3-qa-vs2acc-h.mjs';
const rate = +(process.argv[2] || 1);
const H = await open({vp: 'P1'}), p = H.p;
const cdp = await p.context().newCDPSession(p);
await p.evaluate(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); SYNQUENZER.setBpm(70); });
await micOnApi(p, 'wired');
await p.evaluate(() => SYNQUENZER.play()); await waitBeat(p, 0.3);
const SB = await p.evaluate(() => SYNQUENZER.vsClock().spb);
const sc = [57, 59, 60, 62, 64, 65, 67, 69];
const MEL = []; let k = 0; for (let b = 4; b < 68; b += 1) { if (b % 8 === 7) continue; MEL.push([b, b % 4 === 3 ? 0.5 : 1, sc[(k * 3 + (k >> 2)) % 8]]); k++; }
await playAtBeat(p, voice(MEL.map(([b, d, m]) => ({on: 0.05 + (b - 4) * SB, dur: d * SB, m})), {fs: 16000, seed: 21}), 4, 0.05, 16000);
await waitBeat(p, 60);
if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', {rate});
await p.evaluate(() => { window.__q.late.length = 0; window.__q.lateOn = true; window.__lt.length = 0; });
// Vergleich: 4 s ohne FANG
await sleep(4000);
const base = await p.evaluate(() => ({late: window.__q.late.slice(), lt: window.__lt.slice(), n: [window.__q.onN, window.__q.stN]}));
await p.evaluate(() => { window.__q.late.length = 0; window.__lt.length = 0; });
await waitBeat(p, 68.4);
await p.tap('#bFang');
const r = await result(p); await sleep(1500);
const res = await p.evaluate(() => ({late: window.__q.late.slice(), lt: window.__lt.slice(), last: SYNQUENZER.vsInfo().last, n: [window.__q.onN, window.__q.stN]}));
if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
console.log(`CPU ×${rate}: ohne FANG 4 s: ${base.late.length} späte Starts ${JSON.stringify(base.late.slice(0, 5))}, longtasks ${JSON.stringify(base.lt)} n ${base.n}`);
console.log(`CPU ×${rate}: FANG 🎤 (16 Takte): ${res.late.length} späte Starts, max ${res.late.length ? Math.max(...res.late.map(x => x[1])) : 0} ms ${JSON.stringify(res.late.slice(0, 8))}; longtasks ${JSON.stringify(res.lt)}; Auswertung ${JSON.stringify(res.last)}; Clip ${r && r.len} T`);
await H.br.close();
