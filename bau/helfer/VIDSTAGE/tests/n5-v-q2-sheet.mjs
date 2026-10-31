// QA musiker VV2: Menü → Video by touch: Bild Auto, 9:16 [Kamera]/[Ganz mit Balken], ▶ Vorschau (frame pacing, long tasks,
// late notes during the preview with cuts/blends), 16:9 greys the 9:16 row; argv P | L
import { open, buildSong } from './n5-v-qm-lib.mjs';
import fs from 'fs';
const OUT = '/home/user/Synquenzer/bau/helfer/VIDSTAGE/tests/out/n5-v-q2-out/';
const L = process.argv[2] === 'L', [W, H, N] = L ? [844, 390, 'L1'] : [390, 844, 'P1'];
const {b, p, errs} = await open({w: W, h: H, touch: true, dpr: 3});
const res = {N};
await buildSong(p);
await p.evaluate(() => { const Q = SYNQUENZER, m = S.song.marks.find(x => x.name === 'Refrain'); Q.vvDirSet(m.a, m.a + m.len, 'matrix'); Q.vvDirSet(2, 4, 'spur', 3); Q.vvDirSet(6, 7, 'spur', stimmeT()); });
const tapXY = async (x, y, w = 350) => { await p.touchscreen.tap(x, y); await p.waitForTimeout(w); };
const tapSel = async (sel, w = 350) => { const e = await p.$(sel); if (!e) throw new Error('fehlt ' + sel); await e.scrollIntoViewIfNeeded(); const q = await e.boundingBox(); await tapXY(q.x + q.width / 2, q.y + q.height / 2, w); return q; };
const tapText = async (txt, w = 350) => tapSel(`#vvSheet button:text-is("${txt}")`, w);
const shot = n => p.screenshot({path: OUT + 'sheet-' + N + '-' + n + '.png'});
const meas = () => p.evaluate(() => {
  const out = {small: [], out: [], clip: [], btns: []};
  for (const e of document.querySelectorAll('#vvSheet button')) {
    if (!e.getClientRects().length || getComputedStyle(e).visibility === 'hidden') continue;
    const q = e.getBoundingClientRect(), t = e.textContent.trim().slice(0, 20);
    out.btns.push(t + (e.disabled ? '(grau)' : '') + (e.classList.contains('on') ? '(an)' : ''));
    if (q.width < 43.5 || q.height < 43.5) out.small.push(t + ' ' + q.width.toFixed(1) + 'x' + q.height.toFixed(1));
    if (q.right > innerWidth + .5 || q.bottom > innerHeight + .5 || q.left < -.5 || q.top < -.5) out.out.push(t);
    if (e.scrollWidth > e.clientWidth + 1) out.clip.push(t + ' ' + e.scrollWidth + '>' + e.clientWidth);
  }
  const s = document.getElementById('vvSheet'); out.scroll = s ? [s.scrollHeight, s.clientHeight] : null; out.page = [document.documentElement.scrollHeight, innerHeight];
  return out;
});
await tapSel('#bMenu', 500);
await tapSel('#menu button[aria-label="Video des Songs erstellen"]', 800);
res.open = await p.evaluate(() => SYNQUENZER.vvInfo().prefs);
await tapText('9:16'); await tapText('Auto', 500);
res.m916 = await meas(); await shot('1-916-auto');
const h0 = await p.evaluate(() => document.documentElement.scrollHeight);
await tapText('Ganz mit Balken', 500); res.balken = await p.evaluate(() => SYNQUENZER.vvInfo().prefs); await shot('2-balken');
await tapText('Kamera', 500);
await tapText('16:9', 500); res.m169 = await meas(); await shot('3-169');
res.jump = [h0, await p.evaluate(() => document.documentElement.scrollHeight)];
await tapText('9:16', 500);
// Vorschau: rAF pacing + long tasks + late notes (logNote with < 3 ms lead)
await p.evaluate(() => { const Q = window.__pv = {fr: [], lt: [], late: []}; let last = performance.now(); const f = t => { Q.fr.push(t - last); last = t; Q.raf = requestAnimationFrame(f); }; Q.raf = requestAnimationFrame(f);
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) Q.lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {}
  const o = window.logNote; window.logNote = function (e) { const r = o.apply(this, arguments); try { if (e && e.time != null) { const d = e.time - AU.ctx.currentTime; if (d < 0.003) Q.late.push(+(d * 1000).toFixed(1)); } } catch (x) {} return r; }; });
await tapText('▶ Vorschau', 200);
const cuts = [];
for (let k = 0; k < 24; k++) { await p.waitForTimeout(500); cuts.push(await p.evaluate(() => { const r = VV.prev && VV.prev.rt; return r && r.cur ? r.cur.k : null; })); if (k === 6) await shot('4-preview-spur'); if (k === 16) await shot('5-preview-matrix'); }
res.prevShots = cuts;
res.pv = await p.evaluate(() => { const Q = window.__pv; cancelAnimationFrame(Q.raf); const f = Q.fr.slice(5).sort((a, b) => a - b); return {frames: f.length, p50: +f[f.length >> 1].toFixed(1), p95: +f[Math.floor(f.length * .95)].toFixed(1), max: +f[f.length - 1].toFixed(1), over50: f.filter(x => x > 50).length, lt: Q.lt, late: Q.late}; });
const stopBtn = await p.$('#vvSheet button:text-is("■ Stopp")'); if (stopBtn) await tapText('■ Stopp', 800);
res.after = await p.evaluate(() => ({playing: R.playing, prev: SYNQUENZER.vvInfo().prev}));
res.errs = errs;
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(OUT + 'sheet-' + N + '.json', JSON.stringify(res, null, 1));
await b.close();
