import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const b = await launch(); const page = await open(b, 'X'); await openMk(page); await page.waitForTimeout(400);
const r = await page.evaluate(() => { const sh = EL.synthSheet; const txt = sh.innerText + ' ' + [...sh.querySelectorAll('[aria-label],[title]')].map(e => (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('title') || '')).join(' ');
  const plate = MKUI.PL.el.innerText; const bad = /korg|micro ?korg|radias|dwgs|\bvox\b|analog modeling|ms[- ]?2000/ig;
  return {sheetHits: (txt.match(bad) || []), plateHits: (plate.match(bad) || []), nameFont: getComputedStyle(MKUI.PL.ui.name).fontFamily + ' ' + getComputedStyle(MKUI.PL.ui.name).fontWeight + ' ' + getComputedStyle(MKUI.PL.ui.name).fontStretch, body: getComputedStyle(document.body).fontFamily, imgs: document.querySelectorAll('img').length}; });
console.log(JSON.stringify(r));
await b.close();
