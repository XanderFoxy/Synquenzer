import { open, APP, OUT } from './v3-qareg-mk1-pw.mjs';
for (const [w, h, tag] of [[320, 568, 'P3'], [390, 844, 'P1'], [667, 375, 'L2'], [844, 390, 'L1']]) {
  const {b, p, errs} = await open({width: w, height: h}, APP, true);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setEngine(0, 'mk'); Q.setEngine(2, 'mk'); Q.selectTrack(0); await new Promise(r => setTimeout(r, 800)); });
  const r = await p.evaluate(() => { const vw = innerWidth, vh = innerHeight, bad = [];
    for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (!r.width || !e.offsetParent) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden') continue;
      if (e.tagName === 'BUTTON' && (r.right > vw + .5 || r.left < -.5 || r.bottom > vh + .5)) bad.push('out ' + (e.id || e.className) + ' ' + e.textContent.trim().slice(0, 20));
      if (e.children.length === 0 && e.textContent.trim() && e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible' && cs.textOverflow !== 'ellipsis') bad.push('ovf ' + (e.id || e.className) + ' "' + e.textContent.trim().slice(0, 30) + '"'); }
    return {bad: bad.slice(0, 10), docX: document.documentElement.scrollWidth > vw, docY: document.documentElement.scrollHeight > vh}; });
  await p.screenshot({path: OUT + `mkmain-${tag}.png`});
  console.log(tag, JSON.stringify(r), errs.length ? errs : '');
  await b.close();
}
