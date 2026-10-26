// MK-P fix: which main-screen regions the open MS 2000 sheet hides (mkcov) per format, and that they come back on close / other engine
import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const b = await launch(); let bad = 0;
for (const f of ['P1', 'P2', 'P3', 'L1', 'L2', 'W', 'X', 'XH']) {
  const page = await open(b, f); await openMk(page); await page.waitForTimeout(400);
  const st = () => page.evaluate(() => { const o = {}; for (const id of ['gridArea', 'top', 'strip', 'modebar', 'kbArea', 'carrier']) { const n = document.getElementById(id); if (!n) continue; const r = n.getBoundingClientRect(); o[id] = getComputedStyle(n).visibility + (n.classList.contains('mkcov') ? '*' : '') + '[' + [r.left, r.top, r.width, r.height].map(Math.round) + ']'; }
    // a hidden region must lie completely under the sheet
    const sh = EL.synthSheet.getBoundingClientRect(); o.ok = [...document.querySelectorAll('.mkcov')].every(n => { const r = n.getBoundingClientRect(); return getComputedStyle(n).visibility !== 'hidden' || (r.left >= sh.left - 1 && r.right <= sh.right + 1 && r.top >= sh.top - 1 && r.bottom <= sh.bottom + 1); }); return o; });
  const a = await st();
  await page.evaluate(() => SYNQUENZER.closeEditor ? SYNQUENZER.closeEditor() : closeEditor()); await page.waitForTimeout(200);
  const c = await page.evaluate(() => [...document.querySelectorAll('#app *')].filter(n => getComputedStyle(n).visibility === 'hidden' && n.closest('.mkcov')).length);
  await page.evaluate(() => { SYNQUENZER.openEditor(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'wt'); }); await page.waitForTimeout(300);
  const w = await page.evaluate(() => ({cov: [...document.querySelectorAll('.mkcov')].map(n => n.id), gridVis: getComputedStyle(document.getElementById('gridArea')).visibility, sheet: EL.synthSheet.className}));
  if (!a.ok || c || w.cov.length) bad++;
  console.log(f, JSON.stringify(a), '| after close hidden:', c, '| WT engine:', JSON.stringify(w));
  await page.ctx.close();
}
console.log(bad ? 'FAIL ' + bad : 'PASS'); await b.close();
