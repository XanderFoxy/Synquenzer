// V2c′ Leistung: 6 Synth-Spuren mit dichten Clips, Träger-Wechsel alle 0,5 s, 8 s Wiedergabe – „Eine Skala“ an vs aus
import { open } from './v3-v2d-pw.mjs';
import { mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
const res = {};
for (const on of [false, true]) {
  const {b, p, errs} = await open();
  res[on] = await p.evaluate(async on => {
    const Q = window.SYNQUENZER; Q.newProject(); Q.oneScale(on);
    while (Q.NT() < 8) { try { if (addTrack() < 0) break; } catch (e) { break; } }
    for (const t of [0, 1, 2, 3, 6, 7]) if (S.tracks[t] && S.tracks[t].kind === 'synth') {
      const ns = []; for (let k = 0; k < 64; k++) ns.push({t: k * .25, d: .2, n: 52 + ((k * 7 + t * 3) % 30), v: .7});
      Q.setClip(t, 0, {len: 4, key: {root: 4, scale: 'aeolian'}, notes: ns});
    }
    const H = Q.harmony, ch = [[60, 64, 67], [65, 69, 72], [67, 71, 74, 77], [69, 72, 76], [62, 65, 69], [64, 68, 71], [70, 74, 77], [61, 65, 68]].map(c => H.detectChord(c));
    let tS = 0, nS = 0, tA = 0, nA = 0, mx = 0;
    const s0 = window.scheduleTrack, a0 = window.applyCarrierChange;
    window.scheduleTrack = function () { const t = performance.now(); try { return s0.apply(this, arguments); } finally { const d = performance.now() - t; tS += d; nS++; mx = Math.max(mx, d); } };
    window.applyCarrierChange = function () { const t = performance.now(); try { return a0.apply(this, arguments); } finally { const d = performance.now() - t; tA += d; nA++; mx = Math.max(mx, d); } };
    const lt = []; const po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(e.duration); }); po.observe({entryTypes: ['longtask']});
    Q.setBpm(140); Q.play(); Q.launchScene(0);
    let frames = 0, run = true; const fr = () => { frames++; if (run) requestAnimationFrame(fr); }; requestAnimationFrame(fr);
    const t0 = performance.now(); let k = 0;
    while (performance.now() - t0 < 8000) { recallCarrier(ch[k++ % ch.length]); await new Promise(r => setTimeout(r, 500)); }
    run = false; po.disconnect(); Q.stop();
    window.scheduleTrack = s0; window.applyCarrierChange = a0;
    return {fps: frames / 8, sched: +(tS / Math.max(1, nS)).toFixed(3), carrier: +(tA / Math.max(1, nA)).toFixed(2), maxMs: +mx.toFixed(2), nS, nA, longtasks: lt.filter(d => d > 50).length};
  }, on);
  res[on].errs = errs.length;
  await b.close();
}
console.log(JSON.stringify(res));
check('Leistung: „Eine Skala“ an – Planung je Spur und Aufruf im Mittel ≤ 1 ms, Träger-Wechsel ≤ 8 ms, nicht mehr longtasks > 50 ms als aus, ≥ 55 fps', res[true].sched <= 1 && res[true].carrier <= 8 && res[true].longtasks <= res[false].longtasks && res[true].fps >= 55, res[true]);
check('Leistung: Zuwachs gegenüber aus ≤ 2 ms je Träger-Wechsel', res[true].carrier - res[false].carrier <= 2, {on: res[true].carrier, off: res[false].carrier});
check('keine Konsolenfehler', !res[true].errs && !res[false].errs);
process.exit(done() ? 1 : 0);
