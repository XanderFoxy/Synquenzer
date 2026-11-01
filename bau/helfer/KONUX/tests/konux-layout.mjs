// KONUX: Layout in 428×926, 926×428, 428×650, 375×667 — für Bereich, Marke, Block (mit Zurückholen): das Blatt ganz im Bild,
// nichts abgeschnitten, Treffer ≥ 44 px (Karten ≥ 64 px), der Song darüber bleibt sichtbar (≥ 90 px Song-Zeilen) und bedienbar
// (Lage: popLayer „pass“), Vorschau-Rahmen da. Bildschirmfotos nach bilder/nachher-*.png
import { createRequire } from 'module';
import { open, buildSong, NEU, BILD, tapSel, markTap, selRange, blockTap } from './lib.mjs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const browser = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const VP = [[428, 926], [926, 428], [428, 650], [375, 667]], out = [];
const check = p => p.evaluate(() => {
  const pop = UI.pop && UI.pop.el; if (!pop) return {err: 'kein Blatt'};
  const vw = innerWidth, vh = innerHeight, r = pop.getBoundingClientRect(), f = [];
  if (r.left < -.5 || r.top < -.5 || r.right > vw + .5 || r.bottom > vh + .5) f.push(`Blatt außerhalb ${r.left},${r.top},${r.right},${r.bottom}`);
  if (pop.scrollHeight > pop.clientHeight + 1) f.push(`Blatt scrollt (${pop.scrollHeight} > ${pop.clientHeight})`);
  if (pop.scrollWidth > pop.clientWidth + 1) f.push('Blatt breiter als der Schirm');
  const small = [];
  for (const b of pop.querySelectorAll('button,input')) {
    const q = b.getBoundingClientRect(); if (!q.width) continue;
    const min = b.classList.contains('kx-c') ? 64 : 44;
    const inSc = b.closest('.cp-sc');                     // Namens-Chips: waagrecht scrollbar – nur Höhe zählt, Breite ≥ 44
    if (q.height < min - .5 || q.width < 44 - .5) small.push(`${b.className.split(' ').slice(-1)}:${q.width.toFixed(0)}×${q.height.toFixed(0)}`);
    if (!inSc && (q.left < r.left - .5 || q.right > r.right + .5 || q.bottom > r.bottom + .5)) f.push('abgeschnitten ' + (b.textContent || b.className).trim().slice(0, 20));
    if (!inSc && b.scrollWidth > b.clientWidth + 2 && !b.classList.contains('kx-c')) f.push('Text passt nicht: ' + b.textContent.trim().slice(0, 24));
  }
  for (const t of pop.querySelectorAll('.kx-c b')) if (t.scrollWidth > t.clientWidth + 1) f.push('Kartentitel passt nicht: ' + t.textContent);
  if (small.length) f.push('zu klein: ' + small.join(' '));
  const cv = SV.cv.getBoundingClientRect(), song = Math.min(cv.bottom, r.top) - cv.top - SV.rulerH;
  if (song < 90) f.push(`Song darüber nur ${song.toFixed(0)} px`);
  if (!EL.popLayer.classList.contains('pass')) f.push('Song darunter nicht bedienbar (pass fehlt)');
  if (!KX.pv) f.push('keine Vorschau');
  return {f, h: Math.round(r.height), song: Math.round(song)};
});
for (const [W, H] of VP) {
  const o = await open({w: W, h: H, browser}); const p = o.p;
  await buildSong(p);
  await p.evaluate(() => { SYNQUENZER.konsolidieren(6, 9, 'Hook'); SYNQUENZER.blockMake(0, 1); SV.x = 0; closePop(); UI.dirty.song = true; }); await p.waitForTimeout(400);
  const fall = async (name, go) => {
    const r = {test: 'layout', fall: `${W}×${H} ${name}`, ok: true, fehler: []};
    try { await go(); await p.waitForTimeout(250); const c = await check(p); if (c.err) throw new Error(c.err); r.fehler = c.f; r.blattH = c.h; r.songPx = c.song; r.ok = !c.f.length;
      await p.screenshot({path: `${BILD}/nachher-${W}x${H}-${name}.png`}); }
    catch (e) { r.ok = false; r.fehler.push(String(e).slice(0, 160)); }
    await p.evaluate(() => { closePop(); SV.sel = null; rangeBarSync(); svButtons(); SV.x = 0; UI.dirty.song = true; }); await p.waitForTimeout(250);
    out.push(r); console.log(JSON.stringify(r));
  };
  await fall('bereich', async () => { await selRange(p, 2, 5); await tapSel(p, '#rangeBar button[data-a="more"]', 450); await tapSel(p, '.pop button[data-a="konux"]', 450); });
  await fall('marke', async () => { await markTap(p, '^HOOK'); await tapSel(p, '.pop button[data-kon="ux"]', 450); });
  await fall('block', async () => { await blockTap(p, 'B1'); });
  await fall('block-umbenennen', async () => { await blockTap(p, 'B1'); await tapSel(p, '.pop .kx-w[data-kx="name"]'); });
  if (o.errs.length) out.push({test: 'layout', fall: `${W}×${H} Konsole`, ok: false, fehler: o.errs});
  await o.close();
}
await browser.close();
process.exitCode = out.every(r => r.ok) ? 0 : 1;
