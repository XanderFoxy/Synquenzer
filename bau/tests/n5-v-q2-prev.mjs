// QA musiker VV2: ▶ Vorschau in the Video sheet, 9:16, Bild Auto [Kamera] vs Song — draw cost per frame (vvDrawRun), long tasks,
// rAF gaps, at the cuts (blend) vs elsewhere; late notes
import { open, buildSong } from './n5-v-qm-lib.mjs';
const VIEW = process.argv[2] || 'auto', FMT = process.argv[3] || '9:16';
const {b, p, errs} = await open({w: 390, h: 844, touch: true, dpr: 3});
await buildSong(p);
await p.evaluate(() => { const Q = SYNQUENZER, m = S.song.marks.find(x => x.name === 'Refrain'); Q.vvDirSet(m.a, m.a + m.len, 'matrix'); Q.vvDirSet(2, 4, 'spur', 3); Q.vvDirSet(6, 7, 'spur', stimmeT()); });
await p.evaluate(([v, f]) => { SYNQUENZER.vvPrefs({fmt: f, view: v, cam: 'kamera'}); vvOpen(); }, [VIEW, FMT]); await p.waitForTimeout(800);
await p.evaluate(() => { const Q = window.__pv = {d: [], lt: [], late: [], gaps: []}; const o = window.vvDrawRun; window.vvDrawRun = function () { const t = performance.now(); const r = o.apply(this, arguments); const rt = arguments[5]; Q.d.push([+(performance.now() - t).toFixed(2), rt && rt.cur ? rt.cur.k : -1, arguments[4] && arguments[4].sb != null ? +arguments[4].sb.toFixed(2) : null]); return r; };
  let last = performance.now(); const f = t => { if (t - last > 34) Q.gaps.push([Math.round(t - last), Math.round(t)]); last = t; Q.raf = requestAnimationFrame(f); }; Q.raf = requestAnimationFrame(f);
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) Q.lt.push([Math.round(e.duration), Math.round(e.startTime)]); }).observe({entryTypes: ['longtask']}); } catch (e) {}
  const ol = window.logNote; window.logNote = function (e) { const r = ol.apply(this, arguments); try { if (e && e.time != null) { const d = e.time - AU.ctx.currentTime; if (d < 0.003) Q.late.push(+(d * 1000).toFixed(1)); } } catch (x) {} return r; };
  Q.t0 = performance.now(); vvPrevStart(); });
await p.waitForTimeout(14000);
const r = await p.evaluate(() => { const Q = window.__pv; cancelAnimationFrame(Q.raf); vvPrevStop && vvPrevStop();
  const d = Q.d.filter(x => x[2] != null), sorted = d.map(x => x[0]).sort((a, b) => a - b);
  // frames within 0.6 beat after a cut (blend 300 ms ≈ 0.56 beat at 112)
  const cutsAt = (VV.lastPrevRt || (VV.prev && VV.prev.rt) || {shots: []}).shots;
  return {n: d.length, p50: sorted[sorted.length >> 1], p95: sorted[Math.floor(sorted.length * .95)], max: sorted[sorted.length - 1], top: d.slice().sort((a, b) => b[0] - a[0]).slice(0, 6), lt: Q.lt.map(x => [x[0], Math.round(x[1] - Q.t0)]), gaps: Q.gaps.map(x => [x[0], Math.round(x[1] - Q.t0)]), late: Q.late}; });
console.log(VIEW, FMT, JSON.stringify(r), 'errs', JSON.stringify(errs), require_load());
function require_load() { return ''; }
await b.close();
