import { open, APP, BASE, OUT } from './v3-qareg-mk1-pw.mjs';
const hdr = p => p.evaluate(() => { const sh = document.getElementById('synthSheet'); if (!sh || !sh.offsetParent) return 'closed';
  const seg = sh.querySelector('.sh-head .seg.eng'); const btns = seg ? [...seg.querySelectorAll('button')].map(b => (b.innerText || '').replace(/\s+/g, ' ').trim() + ':' + Math.round(b.getBoundingClientRect().width) + (b.classList.contains('mk2z') ? 'z' : '')) : [];
  const pa = [...sh.querySelectorAll('.preset .pa')].map(b => Math.round(b.getBoundingClientRect().width)); const pn = sh.querySelector('.preset .pn');
  const tt = sh.querySelector('.sh-title'); const hd = sh.querySelector('.sh-head'); const hr = hd.getBoundingClientRect();
  const out = [...hd.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width && (b.getBoundingClientRect().right > hr.right + .5 || b.getBoundingClientRect().left < hr.left - .5)).map(b => b.innerText.trim());
  return (seg && seg.classList.contains('engchip') ? 'CHIP ' : 'KEYS ') + btns.join(' ') + ' | arrows ' + pa.join('/') + ' name ' + (pn ? Math.round(pn.getBoundingClientRect().width) : '-') + ' | title ' + (tt ? Math.round(tt.getBoundingClientRect().width) : '-') + ' | headScroll ' + (hd.scrollWidth > hd.clientWidth + 1) + ' outside ' + JSON.stringify(out); });
const tab = (p, re) => p.evaluate(re => { const t = [...document.querySelectorAll('#synthSheet button.tab')].find(b => new RegExp(re).test(b.innerText.trim())); if (t) t.click(); return !!t; }, re).then(() => p.waitForTimeout(400));
for (const [n, f] of [['base', BASE], ['new', APP]]) {
  for (const [w, h] of [[844, 1180], [667, 375], [844, 390]]) {
    const {b, p, errs} = await open({width: w, height: h}, f, true);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(600);
    console.log(n, w + 'x' + h, 'open      ', await hdr(p));
    await tab(p, '^FILTER'); console.log(n, w + 'x' + h, 'tab FILTER', await hdr(p));
    await tab(p, '^OSZ$'); console.log(n, w + 'x' + h, 'tab OSZ   ', await hdr(p));
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.closeEditor && Q.closeEditor(); }); await p.waitForTimeout(400);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.openEditor(); }); await p.waitForTimeout(600);
    console.log(n, w + 'x' + h, 'reopen    ', await hdr(p));
    if (errs.length) console.log('errs', errs);
    await b.close();
  }
  // rotation with editor open
  for (const [[w1, h1], [w2, h2]] of [[[390, 844], [844, 390]], [[844, 390], [390, 844]], [[926, 428], [428, 926]]]) {
    const {b, p, errs} = await open({width: w1, height: h1}, f, true);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(600);
    console.log(n, 'rot', w1 + 'x' + h1, 'before', await hdr(p));
    await p.setViewportSize({width: w2, height: h2}); await p.waitForTimeout(800);
    console.log(n, 'rot', w2 + 'x' + h2, 'after ', await hdr(p));
    await p.screenshot({path: OUT + `rot-${n}-${w1}to${w2}.png`});
    if (errs.length) console.log('errs', errs);
    await b.close();
  }
}
