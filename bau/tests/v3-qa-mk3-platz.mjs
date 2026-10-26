import {launch, open, box, tap, J, FMT} from './v3-qa-mk3-lib.mjs';
FMT.L1SA = [844, 390]; FMT.L1HB = [844, 390];
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const b = await launch();
const states = [
  ['schicht-t2-filter', () => { SYNQUENZER.mkSet(0, 'mode', 1); MKUI.P.tim = 2; MKUI.setWahl(1, 5); MKUI.lcdOf(MKUI.knobs()[1]); }],
  ['split-stimme-eb2', () => { SYNQUENZER.mkSet(0, 'mode', 2); MKUI.P.tim = 1; MKUI.setWahl(1, 0); MKUI.P.shift = 1; MKUI.render(); MKUI.lcdOf(MKUI.knobs()[2]); }],
  ['beide-solo', () => { MKUI.P.shift = 0; MKUI.P.tim = 3; MKUI.soloSet(1); MKUI.setWahl(1, 7); }],
  ['stimmung-eigene', () => { MKUI.soloSet(0); SYNQUENZER.mkSet(0, 'scale', 9); SYNQUENZER.mkSet(0, 'skey', 1); MKUI.setWahl(2, 9); MKUI.lcdOf(MKUI.knobs()[0]); }],
  ['eigene-view', () => { MKUI.viewOpen('eigene'); }],
  ['eigene-back', () => { MKUI.viewClose(); }],
  ['kopie-pop', () => { MKUI.timCopyPop(null); }],
  ['liste-stimmung', async () => { closePop(); const e = document.querySelector('#synthSheet .mkx[data-k="k0"]'); if (e) { const r = e.getBoundingClientRect(); /* list via API */ } }]];
const res = [];
for (const f of ['P1', 'P2', 'P3', 'L1', 'L2', 'W', 'L0']) for (const half of (f === 'P2' || f === 'P3' || f === 'L2') ? ['A', 'B'] : ['']) {
  const {ctx, page, errs} = await open(f);
  if (half) await page.evaluate(h => { MKUI.setHalf(h); MKUI.build(MKUI.P.pg, 0); }, half);
  await page.evaluate(async () => { await SYNQUENZER.saveSound(0, 'QA Lang Name Für Die Liste 123', 'new'); });
  for (const [n, fn] of states) {
    await page.evaluate(fn); await page.waitForTimeout(180);
    if (n === 'liste-stimmung' && await box(page, 'k0')) { await tap(page, 'k0'); await page.waitForTimeout(150); }
    const r = await page.evaluate(() => {
      const out = [], W = innerWidth, H = innerHeight;
      if (document.documentElement.scrollWidth > W + 1) out.push('page-x ' + document.documentElement.scrollWidth);
      const hits = [];
      for (const e of document.querySelectorAll('#synthSheet .mkx, .pop button')) { const r = e.getBoundingClientRect(); if (!r.width || getComputedStyle(e).visibility === 'hidden') continue;
        if (r.right > W + .5 || r.left < -.5 || r.top < -.5 || r.bottom > H + .5) out.push('außen ' + (e.dataset.k || e.textContent.trim().slice(0, 12)) + ' ' + [r.left, r.top, r.right, r.bottom].map(Math.round));
        const interactive = e.tagName === 'BUTTON' || e.getAttribute('role') === 'button' || e.getAttribute('role') === 'slider';
        if (interactive && (r.width < 43.5 || r.height < 43.5)) out.push('klein ' + (e.dataset.k || e.textContent.trim().slice(0, 12)) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
        if (interactive && e.classList.contains('mkx')) hits.push([e.dataset.k, r.left, r.top, r.right, r.bottom]); }
      for (let i = 0; i < hits.length; i++) for (let j = i + 1; j < hits.length; j++) { const a = hits[i], c = hits[j]; if (Math.min(a[3], c[3]) - Math.max(a[1], c[1]) > 1 && Math.min(a[4], c[4]) - Math.max(a[2], c[2]) > 1) out.push('überlappt ' + a[0] + '∩' + c[0]); }
      for (const e of document.querySelectorAll('#synthSheet .mkx *, .pop *')) { if (!e.offsetParent || e.children.length || !e.textContent.trim()) continue; const cs = getComputedStyle(e);
        if (e.scrollWidth > e.clientWidth + 1 && cs.textOverflow !== 'ellipsis' && cs.display !== 'inline') out.push('abgeschnitten "' + e.textContent.trim().slice(0, 18) + '" ' + e.scrollWidth + '>' + e.clientWidth); }
      return out; });
    res.push([f + (half ? '-' + half : '') + ' ' + n, r]);
  }
  if (errs.length) res.push([f + ' Konsole', errs]);
  await ctx.close();
}
const bad = res.filter(x => x[1].length);
for (const x of bad) console.log('  ' + x[0] + ': ' + x[1].slice(0, 6).join(' | '));
ok('M-PLATZ (eigene Prüfung) für die MK3-Zustände in P1, P2 A/B, P3 A/B, L1, L2 A/B, W, 926×428', !bad.length, res.length + ' Fälle, ' + bad.length + ' mit Befund');
await b.close();
