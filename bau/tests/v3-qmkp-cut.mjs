// typische Fehler 1/2: labels cut (scrollWidth > clientWidth with the app font) in every format and state; page never scrolls sideways
import {launch, open, openMk, FMT, OUT} from './v3-qmkp-lib.mjs';
const b = await launch(); const all = [];
const SAFE = process.env.SAFE ? process.env.SAFE.split(',').map(Number) : null;
const check = (page, st) => page.evaluate(st => {
  const out = []; const sh = EL.synthSheet;
  const vis = e => { if (!e.offsetWidth || !e.offsetHeight) return false; if (e.closest('[hidden]')) return false; const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden'; };
  const hasText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  for (const e of sh.querySelectorAll('*')) { if (!vis(e) || !hasText(e)) continue; if (e.closest('.mkplate')) continue; const cs = getComputedStyle(e);
    if (e.scrollWidth > e.clientWidth + 1 && cs.overflowX !== 'auto' && cs.overflowX !== 'scroll') out.push('W ' + (e.className || e.tagName).toString().slice(0, 24) + ' "' + e.textContent.trim().slice(0, 30) + '" ' + e.scrollWidth + '>' + e.clientWidth + (cs.textOverflow === 'ellipsis' ? ' (ellipsis)' : ''));
    if ((cs.overflowY === 'hidden' || cs.overflow === 'hidden') && e.scrollHeight > e.clientHeight + 2) out.push('H ' + (e.className || e.tagName).toString().slice(0, 24) + ' "' + e.textContent.trim().slice(0, 30) + '" ' + e.scrollHeight + '>' + e.clientHeight); }
  // the LCDs: 16 characters must fit the box
  for (const lc of document.querySelectorAll('.mkplcd')) { if (!vis(lc)) continue; const r = lc.getBoundingClientRect(); for (const ln of lc.querySelectorAll('.ln')) { const rg = document.createRange(); rg.selectNodeContents(ln); const q = rg.getBoundingClientRect(); if (q.right > r.right + .5 || q.left < r.left - .5) out.push('LCD "' + ln.textContent + '" ' + Math.round(q.width) + ' > box ' + Math.round(r.width)); if (ln.getClientRects().length > 1 || rg.getClientRects().length > 1) out.push('LCD wraps "' + ln.textContent + '"'); } }
  // things of the sheet that leave the viewport
  for (const e of sh.querySelectorAll('button, .tab, .hb, .mkqh > *, .mknav')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.right > innerWidth + .5 || r.left < -.5 || r.bottom > innerHeight + .5) out.push('OFF ' + (e.className || e.tagName).toString().slice(0, 24) + ' ' + [r.left, r.top, r.right, r.bottom].map(Math.round)); }
  const se = document.scrollingElement; if (se.scrollWidth > innerWidth) out.push('PAGE scrollWidth ' + se.scrollWidth + ' > ' + innerWidth);
  return out.map(x => st + ': ' + x);
}, st);
const states = [
  ['ganz', p => p.evaluate(() => MKUI.view({ansicht: 'ganz', haelfte: 'links'}))],
  ['ganz-r', p => p.evaluate(() => MKUI.view({ansicht: 'ganz', haelfte: 'rechts'}))],
  ['halt1', p => p.evaluate(() => MKUI.view({ansicht: 'zoom', halt: 1}))],
  ['halt9', p => p.evaluate(() => MKUI.view({ansicht: 'zoom', halt: 9}))],
  ['halt13', p => p.evaluate(() => MKUI.view({ansicht: 'zoom', halt: 13}))],
  ['edit08', p => p.evaluate(() => { MKUI.view({ansicht: 'zoom', halt: 13}); MKUI.press('edit'); MKUI.press('s6'); })],
  ['edit25', p => p.evaluate(() => { MKUI.press('s15'); MKUI.press('cur.r'); MKUI.press('cur.r'); })],
  ['global', p => p.evaluate(() => { MKUI.press('global'); })],
  ['exit', p => p.evaluate(() => { MKUI.press('exit'); })],
  ['spiel', p => p.evaluate(() => MKUI.view({ansicht: 'spiel'}))],
  ['fx', p => p.evaluate(() => MKUI.view({ansicht: 'fx'}))],
  ['geraet', p => p.evaluate(() => MKUI.view({ansicht: 'ganz'}))],
  ['voc', p => p.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 3); })],
  ['voc-edit14', p => p.evaluate(() => { MKUI.press('edit'); MKUI.press('s10'); })],
  ['voc-spiel', p => p.evaluate(() => MKUI.view({ansicht: 'spiel'}))],
  ['voc-baender', p => p.evaluate(() => { MKUI.view({ansicht: 'ganz'}); })],
  ['voc-baender2', p => p.evaluate(() => { MKUI.press('edit'); MKUI.press('s10'); MKUI.view({modus: 'edit', seite: '14', cursor: 16}); MKUI.lcdTap(); })],
  ['synth-schritte', p => p.evaluate(() => { MKUI.viewClose(); SYNQUENZER.mkSet(0, 'mode', 0); MKUI.view({modus: 'edit', seite: '19', cursor: 2}); MKUI.lcdTap(); })],
];
for (const f of Object.keys(FMT)) {
  const page = await open(b, f, SAFE ? {init: `(() => { const s = ${JSON.stringify(SAFE)}; document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = ':root{--sat-test:1}'; document.head.appendChild(st); }); })()`} : {});
  await openMk(page); await page.waitForTimeout(300);
  for (const [st, fn] of states) { try { await fn(page); } catch (e) { all.push(f + ' ' + st + ': ERR ' + String(e).slice(0, 120)); } await page.waitForTimeout(400); const r = await check(page, st); for (const x of r) all.push(f + ' ' + x); if (st === 'edit25' || st === 'spiel' || st === 'voc-baender2' || st === 'synth-schritte') await page.screenshot({path: OUT + '/cut-' + f + '-' + st + '.png'}); }
  if (page.errs.length) all.push(f + ' console: ' + JSON.stringify(page.errs).slice(0, 300));
  await page.ctx.close();
}
const uniq = [...new Set(all)]; console.log('findings', uniq.length); for (const x of uniq) console.log(x);
await b.close();
