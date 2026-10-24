// V2d layout: Blatt „Teil gefangen“ (M-PLATZ, P ≤ 270 px, L side panel), FANG TEIL label; screenshots
import { open } from './v3-v2d-pw.mjs';
import { mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375]];
for (const [id, w, h] of VPS) {
  const {b, p, errs} = await open({width: w, height: h});
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'};
    Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .5, n: 45, v: .8}]}); Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .8}]});
    const car = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am'].map((n, k) => ({beat: k * 4, target: Q.parseChord(n)}));
    Q.setSong({bars: 20, lanes: [[{bar: 0, slot: 0}, {bar: 3, slot: -1}, {bar: 4, slot: 0}], [], [], [], [{bar: 0, slot: 0}], []], carrier: car}); Q.setKbMode('transpose'); Q.songPlay(0); });
  await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 33.5, null, {timeout: 30000, polling: 50});
  await p.waitForTimeout(100);
  const lab = await p.evaluate(() => { const b = document.getElementById(innerWidth > innerHeight ? 'bFangT' : 'bFang'); const r = b.getBoundingClientRect(); return {txt: b.textContent, vis: getComputedStyle(b).visibility, w: r.width, h: r.height, sw: b.scrollWidth, cw: b.clientWidth}; });
  check(id + ' FANG TEIL sichtbar, Text passt', /TEIL/.test(lab.txt) && lab.vis === 'visible' && lab.sw <= lab.cw + 1, lab);
  await p.evaluate(() => window.SYNQUENZER.fangTeil({beat: 33.2}));
  await p.waitForTimeout(250);
  const m = await p.evaluate(() => {
    const s = document.querySelector('.pop.fsheet'), r = s.getBoundingClientRect(), bad = [], small = [];
    for (const x of s.querySelectorAll('button, .fs-chip, .fs-end, .fs-t')) {
      const q = x.getBoundingClientRect(); if (!q.width) continue;
      const inside = x.closest('.cp-sc'); const sc = inside ? inside.getBoundingClientRect() : r;
      if (!inside && (q.left < r.left - .5 || q.right > r.right + .5 || q.bottom > innerHeight + .5)) bad.push(x.textContent + ' out');
      if (x.scrollWidth > x.clientWidth + 1 && !x.classList.contains('fs-end') && !x.classList.contains('fs-t')) bad.push(x.textContent + ' clipped');
      if (x.tagName === 'BUTTON' && !x.disabled && !x.classList.contains('fs-b') && (q.height < 36 || q.width < 36)) small.push(x.textContent + ' ' + q.width.toFixed(0) + 'x' + q.height.toFixed(0));
    }
    return {top: r.top, left: r.left, w: r.width, h: r.height, bad, small, end: s.querySelector('.fs-end').scrollWidth <= s.querySelector('.fs-end').clientWidth + 1};
  });
  const P = h > w;
  check(id + ' Blatt im Bild, nichts abgeschnitten', !m.bad.length && m.end, m);
  check(id + ' Treffer ≥ 36 px (Tasten)', !m.small.length, m.small);
  if (P) check(id + ' Höhe ≤ 270 px, unten angedockt', m.h <= 270.5 && Math.abs(m.top + m.h - h) < 1.5, {h: m.h, top: m.top});
  else check(id + ' Seitenfeld rechts (x ≥ vw − 299), Raster links frei', m.left >= w - 299.5 && m.top >= -0.5 && m.top + m.h <= h + .5, m);
  await p.screenshot({path: `v3-v2d-lay-${id}.png`});
  check(id + ' 0 Konsolenfehler', !errs.length, errs);
  await b.close();
}
process.exit(done() ? 1 : 0);
