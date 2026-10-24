// T12: Lange Phrase (16 Takte, 70 BPM ≈ 55 s Gesang): Auswertungszeit, longtasks (> 50 ms) im Hauptfaden beim FANG und bei Blatt-Tipps,
// Clip-Länge 16, Noten-Treffer.
import {open, sleep, voice, playAtBeat, waitBeat, result, micOnApi} from './v3-qa-vs2acc-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const H = await open({vp: 'P1'}), p = H.p;
await p.evaluate(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); SYNQUENZER.setBpm(70); });
await micOnApi(p, 'wired');
await p.evaluate(() => SYNQUENZER.play()); await waitBeat(p, 0.3);
const SB = await p.evaluate(() => SYNQUENZER.vsClock().spb);
const sc = [57, 59, 60, 62, 64, 65, 67, 69];
const MEL = []; let k = 0; for (let b = 4; b < 68; b += 1) { if (b % 8 === 7) continue; MEL.push([b, b % 4 === 3 ? 0.5 : 1, sc[(k * 3 + (k >> 2)) % 8]]); k++; }
await playAtBeat(p, voice(MEL.map(([b, d, m]) => ({on: 0.05 + (b - 4) * SB, dur: d * SB, m})), {fs: 16000, seed: 21}), 4, 0.05, 16000);
await waitBeat(p, 68.4);
const t0 = await p.evaluate(() => performance.now());
await p.evaluate(() => { window.__lt.length = 0; window.__tm = []; for (const nm of ['stRead', 'vsNotesOf', 'vsApply', 'vsPyin', 'vsAnalyse', 'vsFangDone', 'vsResSheet', 'analyseClip', 'switchTrackAt', 'fangCompute']) { const f = window[nm]; if (typeof f !== 'function') { window.__tm.push([nm, 'fehlt']); continue; } window[nm] = function (...a) { const t = performance.now(); const r = f.apply(this, a); window.__tm.push([nm, +(performance.now() - t).toFixed(1)]); return r; }; } });
await p.tap('#bFang');
const r = await result(p);
const t1 = await p.evaluate(() => performance.now());
const lt = await p.evaluate(() => window.__lt.slice()); console.log('  Zeiten', JSON.stringify(await p.evaluate(() => window.__tm)));
const vi = await p.evaluate(() => SYNQUENZER.vsInfo());
console.log('  Auswertung', JSON.stringify(vi.last), 'gesamt bis Blatt', Math.round(t1 - t0), 'ms; longtasks', JSON.stringify(lt));
ok(r && r.len === 16 && r.start === 1, `Clip ${r && r.len} Takte ab Takt ${r && r.start + 1}`);
const hit = r ? MEL.filter(([b, , m]) => r.notes.some(n => n.n === m && Math.abs(r.start * 4 + n.t - b) <= 0.13)).length : 0;
ok(hit >= MEL.length * 0.95, `Noten ${hit}/${MEL.length}`);
ok(!lt.some(([, d]) => d > 50), 'keine longtask > 50 ms bei der Auswertung');
await p.evaluate(() => { window.__lt.length = 0; });
for (const sel of ['[data-a="op"]', '[data-a="snap"]', '[data-g="1/8"]', '[data-g="frei"]', '[data-a="om"]']) { await p.tap('.pop.vsres ' + sel); await sleep(250); }
const lt2 = await p.evaluate(() => window.__lt.slice());
ok(!lt2.some(([, d]) => d > 50), 'keine longtask > 50 ms bei 5 Blatt-Tipps ' + JSON.stringify(lt2));
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
await H.br.close();
console.log(fail ? 'FAIL ' + fail : 'ALLE OK');
