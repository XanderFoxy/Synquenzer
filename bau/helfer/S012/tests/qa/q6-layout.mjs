// Layout in 6 formats: FANG sheet with the „Welche“ row, Marken-Blatt (Bearbeiten + Zusammenfassen), Bearbeiten view, ⋯ list
import {launch, open, sleep, tally, OUT} from '../h.mjs';
import {songABA} from '../lib.mjs';
import {fangNoDrums} from './fx.mjs';
const ok = tally(); const br = await launch();
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 926, 428]];
const measure = (p, sel) => p.evaluate(sel => {
  const q = document.querySelector(sel); if (!q) return {missing: sel};
  const r = q.getBoundingClientRect(), bad = [];
  for (const b of q.querySelectorAll('button')) {
    const k = b.getBoundingClientRect(); if (!k.width || getComputedStyle(b).visibility === 'hidden') continue;
    const sc = b.closest('.cp-sc, .s0-list'), sr = sc && sc.getBoundingClientRect();
    const inScroll = sr && (k.right > sr.right + 1 || k.left < sr.left - 1 || k.bottom > sr.bottom + 1 || k.top < sr.top - 1);
    const lab = (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 18);
    // hit area: the element under the 4 points 2 px inside a 44×44 box centred on the button must be the button
    const cx = k.left + k.width / 2, cy = k.top + k.height / 2;
    if (!inScroll) {
      if (k.width < 43.5 || k.height < 43.5) {
        // allow a larger hit zone (::before / padding) → probe elementFromPoint at ±21 px
        const pts = [[cx - 21, cy], [cx + 21, cy], [cx, cy - 21], [cx, cy + 21]];
        const hit = pts.every(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e === b || b.contains(e)); });
        if (!hit) bad.push('klein ' + lab + ' ' + Math.round(k.width) + '×' + Math.round(k.height));
      }
      if (k.right > innerWidth + .5 || k.left < -.5 || k.bottom > innerHeight + .5 || k.top < -.5) bad.push('außen ' + lab);
    }
    if (b.scrollWidth > b.clientWidth + 1 || b.scrollHeight > b.clientHeight + 2) bad.push('abgeschnitten ' + lab + ' ' + b.scrollWidth + '>' + b.clientWidth + ' / ' + b.scrollHeight + '>' + b.clientHeight);
  }
  for (const d of q.querySelectorAll('.fs-cl,.fs-end,.ms-h span,.ms-h b,.s0-tn,.lbl,h4')) if (d.scrollWidth > d.clientWidth + 1 && getComputedStyle(d).textOverflow !== 'ellipsis') bad.push('Text ' + d.textContent.trim().slice(0, 20) + ' ' + d.scrollWidth + '>' + d.clientWidth);
  return {bad, box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], vw: innerWidth, vh: innerHeight, in: r.top >= -.5 && r.bottom <= innerHeight + .5 && r.left >= -.5 && r.right <= innerWidth + .5, sw: document.scrollingElement.scrollWidth <= innerWidth, sx: scrollX};
}, sel);
for (const [nm, w, h] of VPS) {
  // FANG sheet with the Welche row
  {
    const H = await open(br, {viewport: {width: w, height: h}}), p = H.p; await songABA(p);
    await fangNoDrums(p);
    await p.tap('.fsheet button[data-n="Strophe"]').catch(async () => { await p.evaluate(() => { const b = document.querySelector('.fsheet button[data-n="Strophe"]'); b.scrollIntoView(); }); await p.tap('.fsheet button[data-n="Strophe"]'); });
    await sleep(120);
    await p.tap('.fsheet button[data-dup="replace"]'); await sleep(150);
    await p.tap('.fsheet button[data-s0c="1"]'); await sleep(150);
    const L = await measure(p, '.fsheet');
    await p.screenshot({path: OUT + `/qa-fang-welche-${nm}.png`});
    ok(!L.bad.length && L.in && L.sw, `${nm} FANG-Blatt „Welche“: ` + JSON.stringify(L));
    ok(!H.errs.length && !H.reqs.length, `${nm} keine Fehler/Netz ` + JSON.stringify(H.errs.concat(H.reqs).slice(0, 2)));
    await H.ctx.close();
  }
  // Marken-Blatt + Bearbeiten (all tracks playing) + ⋯ list
  {
    const H = await open(br, {viewport: {width: w, height: h}}), p = H.p; await songABA(p);
    await p.evaluate(() => SYNQUENZER.songView(true)); await sleep(250);
    await p.evaluate(() => SYNQUENZER.openMarkSheet('M3')); await sleep(200);
    const M = await measure(p, '.msheet');
    const sb = await p.evaluate(() => { const r = [...document.querySelectorAll('.msheet [data-s012]')].map(b => { const k = b.getBoundingClientRect(); return [b.textContent.trim(), Math.round(k.width), Math.round(k.height)]; }); return r; });
    await p.screenshot({path: OUT + `/qa-msheet-${nm}.png`});
    ok(!M.bad.length && M.in && M.sw && sb.length === 2, `${nm} Marken-Blatt: ` + JSON.stringify(M) + ' ' + JSON.stringify(sb));
    await p.tap('.msheet button[data-s012="edit"]'); await sleep(200);
    const E = await measure(p, '.msheet');
    await p.screenshot({path: OUT + `/qa-medit-${nm}.png`});
    ok(!E.bad.length && E.in && E.sw, `${nm} Bearbeiten: ` + JSON.stringify(E));
    await p.tap('.msheet button[data-s012="back"]'); await sleep(150);
    ok(await p.evaluate(() => !!document.querySelector('.msheet [data-a="rec"]')), `${nm} ‹ zurück zum Marken-Blatt`);
    await p.evaluate(() => { if (UI.pop) closePop(); }); await sleep(300); await p.evaluate(() => SYNQUENZER.songSelect(0, 3)); await sleep(300);
    const rb = await p.$('#rangeBar button[data-a="more"]');
    if (rb && await rb.isVisible()) { await rb.tap(); await sleep(250); if (!(await p.evaluate(() => UI.pop && UI.pop.name))) { console.log(nm, '⋯ erster Tipp öffnete nichts', await p.evaluate(() => JSON.stringify({sel: SV.sel}))); await rb.tap(); await sleep(250); } await p.evaluate(() => UI.pop && UI.pop.el.setAttribute('data-qa', 'more')); const R_ = await measure(p, '[data-qa=more]'); await p.screenshot({path: OUT + `/qa-more-${nm}.png`}); ok(!R_.bad.length && R_.in && R_.sw, `${nm} ⋯ Liste: ` + JSON.stringify(R_)); }
    else ok(false, `${nm} ⋯ nicht sichtbar`);
    ok(!H.errs.length && !H.reqs.length, `${nm} keine Fehler/Netz ` + JSON.stringify(H.errs.concat(H.reqs).slice(0, 2)));
    await H.ctx.close();
  }
}
await br.close(); process.exit(ok.done() ? 1 : 0);
