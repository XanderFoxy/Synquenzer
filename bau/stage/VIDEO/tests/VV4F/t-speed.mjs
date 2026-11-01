// VV4-F Video-Tempo: derselbe Song (16:9 und 9:16) mit Basis R-4261 und neu; Bild-Zeit je Bild und Gesamtzeit (≥ 1,5× Echtzeit)
import { open, OUT, SONG8, check, summary } from './lib.mjs';
import fs from 'fs'; import path from 'path';
const BASE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../../snapshots/R-4270.html');
const res = {};
for (const [nm, app] of [['basis', BASE], ['neu', undefined]]) {
  const {b, p, errs} = await open({w: 428, h: 926, app});
  await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
  res[nm] = {};
  for (const fmt of ['16:9', '9:16']) {
    await p.evaluate(f => { SYNQUENZER.vvDirSet(0, 4, 'song'); SYNQUENZER.vvDirSet(4, 8, 'matrix'); SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvPrefs({fmt: f, view: 'auto', cam: 'ganz'}); }, fmt);
    const m = await p.evaluate(() => SYNQUENZER.vvMake({}));
    const pr = await p.evaluate(() => { const P = VV.prof || {}; const f = P.frame || {n: 0, sum: 0, max: 0}; return {n: f.n, avg: f.sum / Math.max(1, f.n), max: f.max}; });
    res[nm][fmt] = {ms: m.ms, dur: m.dur, x: +(m.dur * 1000 / m.ms).toFixed(2), frameAvg: +pr.avg.toFixed(3), frameMax: +pr.max.toFixed(2)};
  }
  res[nm].errs = errs; await b.close();
}
console.log(JSON.stringify(res));
for (const fmt of ['16:9', '9:16']) {
  check(`${fmt}: neu ≥ 1,5× Echtzeit`, res.neu[fmt].x >= 1.5, res.neu[fmt]);
  console.log(`  ${fmt}: Bild-Zeit je Bild (ganzes Bild, eine Messung, rauscht): Basis ${res.basis[fmt].frameAvg} ms, neu ${res.neu[fmt].frameAvg} ms`);
}
// the meter drawing alone, over all pictures of the song (7 bars)
{ const {b, p} = await open({w: 428, h: 926}); await p.evaluate(s => SYNQUENZER.setSong(s), SONG8); await p.evaluate(() => SYNQUENZER.vvRender({}));
  const d = await p.evaluate(() => { const cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1080; const g = cv.getContext('2d'); g.scale(3, 3);
    const r = VV.last, n = Math.floor(r.dur * 30), bars = []; for (let i = 0; i < 6; i++) bars.push({k: i, x: 8, y: 20 + i * 40, w: 60, h: 3, hz: true}); bars.push({k: 8, x: 6, y: 5, w: 2, h: 20});
    const t0 = performance.now(); for (let f = 0; f < n; f++) vvDrawMeters(g, f / 30, {src: r, bars}); return {ms: (performance.now() - t0) / n, n}; });
  check('vvDrawMeters je Bild ≤ 0,2 ms (7 Balken, mit 1,5-s-Halten)', d.ms <= .2, {ms: +d.ms.toFixed(3), bilder: d.n}); await b.close(); }
check('Keine Konsolenfehler', res.neu.errs.length === 0, res.neu.errs);
fs.writeFileSync(`${OUT}/t-speed.json`, JSON.stringify(Object.assign(summary(), {res}), null, 1));
