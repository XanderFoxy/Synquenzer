// G-MKP8: MK8-09 M-PLATZ in landscape (L1, L2, 926 × 428) with the MS 2000 panel: quer the sheet has the panel's 44-px header
// (no „Sichern“ button, H-17), so WRITE on the plate opens the place choice and a tap on the display (SPIEL) the library with
// Bank ▾. Same measurement as v3-mk8-ui.mjs (copy of mplatz). Usage: node gmkp8-mk8-platz-quer.mjs <index.html>
import {launch, open, tap, el, ctr} from './v3-mkp-lib.mjs';
const FILE = process.argv[2]; let fails = 0, n = 0;
const ok = (id, c, info) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const b = await launch();
// M-PLATZ: place choice (Sichern), Bank ▾ and the library rows in all formats
const mplatz = page => page.evaluate(() => {
  const bad = [], vw = innerWidth, vh = innerHeight, p = document.querySelector('.pop.mk8w'); if (!p) return ['kein Fenster'];
  const pr = p.getBoundingClientRect(); if (pr.left < 0 || pr.top < 0 || pr.right > vw + .5 || pr.bottom > vh + .5) bad.push('Fenster außerhalb');
  const bs = [...p.querySelectorAll('button')].filter(b => !b.hidden && getComputedStyle(b).display !== 'none');
  for (const b of bs) { const r = b.getBoundingClientRect(); if (r.height < 44 - .5 || r.width < 44 - .5) bad.push('klein ' + b.textContent.trim() + ' ' + r.width.toFixed(0) + '×' + r.height.toFixed(0));
    if (b.scrollWidth > b.clientWidth + 1) bad.push('abgeschnitten ' + b.textContent.trim()); if (r.bottom > pr.bottom + .5 && p.scrollHeight <= p.clientHeight) bad.push('außerhalb ' + b.textContent.trim()); }
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i].getBoundingClientRect(), c = bs[j].getBoundingClientRect(); if (a.left < c.right - .5 && c.left < a.right - .5 && a.top < c.bottom - .5 && c.top < a.bottom - .5) bad.push('überlappt ' + bs[i].textContent.trim() + '/' + bs[j].textContent.trim()); }
  const inf = p.querySelector('.mk8i'); if (inf && inf.scrollWidth > inf.clientWidth + 1) bad.push('Infozeile läuft über');
  return bad;
});
for (const f of ['L1', 'L2', 'X']) {
  const page = await open(b, FILE, f);
  await page.evaluate(async () => { await SYNQUENZER.libraryReady(); mkProg.select(2, 14); MKUI.P.mode = 'spiel'; MKUI.view({ansicht: 'ganz'}); });
  await page.waitForTimeout(400);
  const w = await el(page, 'write'); const [x, y] = ctr(w); await tap(page, x, y); await page.waitForTimeout(300);
  const a = await mplatz(page); const go = await page.evaluate(() => { const g = document.querySelector('.pop.mk8w [data-a="go"]'); return g ? g.textContent : ''; });
  await page.screenshot({path: `gmkp8-shots/${f}-write.png`});
  await page.evaluate(() => closePop()); await page.waitForTimeout(200);
  const l = await el(page, 'lcd'); const [lx, ly] = ctr(l); await tap(page, lx, ly); await page.waitForTimeout(400);
  const rows = await page.evaluate(() => [...document.querySelectorAll('#sndSheet .brow')].slice(0, 6).map(r => r.getBoundingClientRect().height));
  await page.tap('#sndSheet .brbank'); await page.waitForTimeout(250);
  const bb = await mplatz(page); await page.screenshot({path: `gmkp8-shots/${f}-bank.png`});
  ok('MK8-09 M-PLATZ ' + f + ' Platzwahl über WRITE der Platte', a.length === 0 && go === 'Auf B14 schreiben', (a.slice(0, 6).join('; ') || 'alle Tasten ≥ 44 × 44, im Bild, nichts abgeschnitten, keine Überlappung') + ' · ' + go);
  ok('MK8-09 M-PLATZ ' + f + ' Bank ▾ (Bibliothek über die Anzeige) und Zeilen', bb.length === 0 && rows.length > 0 && rows.every(h => h >= 44), (bb.join('; ') || 'Bank-Tasten ≥ 44') + ' · Zeilen ' + rows.map(h => h.toFixed(0)).join('/') + ' px');
  ok('MK8-09 M-PLATZ ' + f + ' Konsole', page.errs.length === 0, page.errs.join(' | ').slice(0, 300));
  await page.ctx.close();
}
console.log('ERGEBNIS', n - fails, '/', n, 'PASS'); await b.close();
