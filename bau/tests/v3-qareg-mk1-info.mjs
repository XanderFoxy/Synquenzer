import { open, APP, BASE, OUT } from './v3-qareg-mk1-pw.mjs';
for (const [w, h, tag] of [[390, 844, 'P1'], [320, 568, 'P3'], [844, 390, 'L1'], [667, 375, 'L2']]) for (const [n, f] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: w, height: h}, f, true);
  await p.tap('#bMenu'); await p.waitForTimeout(500);
  const r = await p.evaluate(() => { const m = document.getElementById('menu'); const hs = [...m.querySelectorAll('h3, h4, .msec, .mh2, b')].map(x => x.textContent.trim()).filter(t => /^INFO$/i.test(t));
    const pb = [...m.querySelectorAll('button')].find(x => /Leistungs/.test(x.textContent)); let pr = null; if (pb) { pb.scrollIntoView(); const r = pb.getBoundingClientRect(); pr = [r.left, r.top, r.width, r.height].map(Math.round).join(','); }
    const bad = []; const vw = innerWidth; for (const e of m.querySelectorAll('button, p, div, span, b, small')) { const r = e.getBoundingClientRect(); if (!r.width) continue; if (r.right > vw + .5 || r.left < -.5) bad.push('out ' + e.tagName + ' ' + e.textContent.trim().slice(0, 30)); const cs = getComputedStyle(e); if (e.children.length === 0 && e.textContent.trim() && e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible' && cs.textOverflow !== 'ellipsis') bad.push('ovf ' + e.textContent.trim().slice(0, 30)); }
    return {info: hs.length, probe: pr, bad: bad.slice(0, 8), docX: document.documentElement.scrollWidth > vw}; });
  if (n === 'new') await p.screenshot({path: OUT + `info-${tag}.png`});
  console.log(tag, n, JSON.stringify(r), errs.length ? JSON.stringify(errs) : '');
  await b.close();
}
