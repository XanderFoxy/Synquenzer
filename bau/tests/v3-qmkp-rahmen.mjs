// MK-P-13 / typische Fehler 5: frame and sheet rect fixed, page height fixed, 0 layout-shift, keyboard fixed (portrait) over state changes done by real taps
import {launch, open, openMk, FMT, tap, touch, line, panel, ctr, tapSel} from './v3-qmkp-lib.mjs';
const b = await launch(); const fails = [];
for (const f of Object.keys(FMT)) {
  const page = await open(b, f, {init: () => { window.__LS = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__LS.push({v: e.value, hr: e.hadRecentInput, src: (e.sources || []).map(s => s.node ? (s.node.className || s.node.nodeName || '').toString().slice(0, 30) : '?')}); }).observe({type: 'layout-shift', buffered: true}); } catch (e) {} }});
  const m0 = await page.evaluate(() => ({sh: document.scrollingElement.scrollHeight, sw: document.scrollingElement.scrollWidth}));
  await openMk(page); await page.waitForTimeout(500);
  const meas = () => page.evaluate(() => { const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return [q.left, q.top, q.width, q.height].map(v => Math.round(v * 10) / 10).join(','); };
    return {fr: r(MKUI.P.el && MKUI.P.el.fr), sheet: r(EL.synthSheet), sh: document.scrollingElement.scrollHeight, sw: document.scrollingElement.scrollWidth, st: document.scrollingElement.scrollTop, kb: innerWidth < innerHeight ? r(document.getElementById('kbArea')) : null}; });
  const base = await meas();
  if (base.sh !== m0.sh || base.sw !== m0.sw) fails.push(`${f} open editor: page ${m0.sh}x${m0.sw} -> ${base.sh}x${base.sw}`);
  const ls0 = await page.evaluate(() => window.__LS.length);
  const steps = [
    ['tap FILTER title', async () => { const p = await panel(page); const s = p.sections.find(s => s.id === 'flt'); const E = p.elements.find(e => e.id === 'f.cut'); await tap(page, E.px.x + E.px.w / 2, E.px.y - E.px.h * 1.6); }],
    ['▶', () => tapSel(page, '.mknav .mkar:last-child')], ['▶', () => tapSel(page, '.mknav .mkar:last-child')], ['◀', () => tapSel(page, '.mknav .mkar:first-child')],
    ['swipe', async () => { const p = await panel(page); const r = p.rahmen; await touch(page, line(r.x + r.w * .8, r.y + r.h * .08, r.x + r.w * .2, r.y + r.h * .08, 10), 16); }],
    ['map', () => tapSel(page, '.mknav .mkmap')],
    ['EDIT', async () => { const E = (await panel(page)).elements.find(e => e.id === 'edit'); if (E.px.x < 0 || E.px.x > innerW) {} await page.evaluate(() => MKUI.press('edit')); }],
    ['SPIEL tab', () => tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]')],
    ['FX tab', () => tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="fx"]')],
    ['GERÄT tab', () => tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="geraet"]')],
    ['voc', () => page.evaluate(() => SYNQUENZER.mkSet(0, 'mode', 3))],
    ['synth', () => page.evaluate(() => SYNQUENZER.mkSet(0, 'mode', 0))],
    ['seq on + note', () => page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.seq.on', 1); SYNQUENZER.mkSet(0, 't.0.seq.q.0.k', 11); })],
    ['map2', () => tapSel(page, '.mknav .mkmap')],
  ];
  const innerW = f;
  for (const [nm, fn] of steps) {
    try { await fn(); } catch (e) { fails.push(`${f} ${nm}: ERR ${String(e).slice(0, 100)}`); continue; }
    await page.waitForTimeout(450);
    const m = await meas();
    for (const k of ['fr', 'sheet', 'sh', 'sw', 'st', 'kb']) if (m[k] !== base[k] && !(k === 'fr' && m.fr == null)) fails.push(`${f} after ${nm}: ${k} ${base[k]} -> ${m[k]}`);
  }
  const ls = await page.evaluate(n => window.__LS.slice(n), ls0);
  if (ls.length) fails.push(`${f} layout-shift ${ls.length}: ${JSON.stringify(ls).slice(0, 300)}`);
  if (page.errs.length) fails.push(`${f} console ${JSON.stringify(page.errs).slice(0, 300)}`);
  await page.ctx.close();
}
console.log('FAILS', fails.length); for (const x of fails) console.log(' ', x);
await b.close();
