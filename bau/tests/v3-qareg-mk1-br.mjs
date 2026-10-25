import { open, APP, BASE, OUT } from './v3-qareg-mk1-pw.mjs';
for (const [w, h, tag] of [[320, 568, 'P3'], [390, 844, 'P1'], [667, 375, 'L2']]) for (const [n, f] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: w, height: h}, f, true);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(500);
  await p.tap('#synthSheet button.pv'); await p.waitForTimeout(700);
  const r = await p.evaluate(() => { const vw = innerWidth, vh = innerHeight; const bad = []; const btn = [];
    for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (!r.width || !e.offsetParent) continue; const cs = getComputedStyle(e); if (e.tagName === 'BUTTON' && (r.right > vw + .5 || r.left < -.5)) bad.push('out ' + e.textContent.trim().slice(0, 20)); if (e.children.length === 0 && e.textContent.trim() && e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible' && cs.textOverflow !== 'ellipsis') bad.push('ovf ' + e.textContent.trim().slice(0, 30)); }
    const sel = [...document.querySelectorAll('select')].filter(s => s.offsetParent).map(s => [...s.options].map(o => o.text).join('/'));
    const chips = [...document.querySelectorAll('button')].filter(b => b.offsetParent && /Engine|Alle|VA|FM|WT|MS 2000/.test(b.textContent) && b.getBoundingClientRect().top > 0).map(b => b.textContent.trim().slice(0, 24) + '@' + Math.round(b.getBoundingClientRect().left) + ',' + Math.round(b.getBoundingClientRect().top) + ' ' + Math.round(b.getBoundingClientRect().width));
    return {bad: bad.slice(0, 8), sel, chips: chips.slice(0, 12), docX: document.documentElement.scrollWidth > vw}; });
  await p.screenshot({path: OUT + `br-${tag}-${n}.png`});
  console.log(tag, n, JSON.stringify(r), errs.length ? JSON.stringify(errs) : '');
  await b.close();
}
