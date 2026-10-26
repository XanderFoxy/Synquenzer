// typische Fehler 4 / MK-P-07: every touch target outside the plate >= 44 x 44 (hit area incl. ::after), no overlap; compared with 4.15.0
import {launch, open, openMk, FMT, tapSel, VORG, FILE} from './v3-qmkp-lib.mjs';
const b = await launch(); const out = {};
const meas = page => page.evaluate(() => {
  const vis = e => e.offsetWidth && !e.closest('[hidden]') && getComputedStyle(e).visibility !== 'hidden';
  const L = [];
  for (const e of document.querySelectorAll('#synthSheet button, #synthSheet .tab, #synthSheet [role=button], #kbArea .mkwheel, #kbArea .whl, .mksp button')) {
    if (!vis(e) || e.closest('.mkplate') || e.closest('.pop')) continue; const r = e.getBoundingClientRect(); let w = r.width, h = r.height;
    const a = getComputedStyle(e, '::after'); if (a && a.content !== 'none' && a.position === 'absolute') { const t = parseFloat(a.top) || 0, bt = parseFloat(a.bottom) || 0, l = parseFloat(a.left) || 0, rr = parseFloat(a.right) || 0; if (a.inset || t < 0 || l < 0) { w = Math.max(w, r.width - l - rr); h = Math.max(h, r.height - t - bt); } }
    if (w < 43.5 || h < 43.5) L.push((e.className || e.tagName).toString().slice(0, 26) + ' "' + (e.getAttribute('aria-label') || e.textContent).trim().slice(0, 12) + '" ' + Math.round(w) + 'x' + Math.round(h)); }
  return L;
});
for (const file of [FILE, VORG]) for (const f of Object.keys(FMT)) {
  const page = await open(b, f, {file});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(1500);
  const a = await meas(page); let c = [];
  if (file === FILE) { await tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'); await page.waitForTimeout(600); c = await meas(page); }
  out[(file === FILE ? 'new ' : 'old ') + f] = [...new Set([...a, ...c.map(x => 'SPIEL ' + x)])];
  await page.ctx.close();
}
for (const f of Object.keys(FMT)) { const n = out['new ' + f], o = out['old ' + f]; const neu = n.filter(x => !o.includes(x.replace(/^SPIEL /, ''))); console.log(f, 'new-only small targets:', JSON.stringify(neu)); }
await b.close();
