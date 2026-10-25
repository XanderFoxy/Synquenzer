// real UI: tap KLANG, then tap the FILTER tab; header before/after (W 844x1180 and L2 667x375)
import { open, APP, OUT } from './v3-qareg-mk1-pw.mjs';
const hdr = p => p.evaluate(() => { const sh = document.getElementById('synthSheet');
  const seg = sh.querySelector('.sh-head .seg.eng'); const btns = [...seg.querySelectorAll('button')].map(b => (b.innerText || '').replace(/\s+/g, ' ').trim() + ':' + Math.round(b.getBoundingClientRect().left) + '+' + Math.round(b.getBoundingClientRect().width));
  const pa = [...sh.querySelectorAll('.preset .pa')].map(b => Math.round(b.getBoundingClientRect().left) + '+' + Math.round(b.getBoundingClientRect().width)); const pn = sh.querySelector('.preset .pv');
  return btns.join(' ') + ' | ‹› ' + pa.join(' ') + ' name ' + Math.round(pn.getBoundingClientRect().left) + '+' + Math.round(pn.getBoundingClientRect().width); });
const SA = '#app{padding-left:47px!important;padding-right:47px!important}';
for (const [w, h, tag, css] of [[844, 1180, 'W'], [667, 375, 'L2'], [844, 390, 'L1-SA', SA]]) {
  const {b, p, errs} = await open({width: w, height: h}, APP, true); if (css) await p.addStyleTag({content: css});
  await p.tap('#bKlang'); await p.waitForTimeout(700);
  console.log(tag, 'after tap KLANG     ', await hdr(p)); await p.screenshot({path: OUT + `flip-${tag}-1-open.png`, clip: {x: 0, y: 0, width: w, height: 140}});
  const t = p.locator('#synthSheet button.tab', {hasText: 'FILTER'}); await t.tap(); await p.waitForTimeout(500);
  console.log(tag, 'after tap FILTER tab', await hdr(p)); await p.screenshot({path: OUT + `flip-${tag}-2-filter.png`, clip: {x: 0, y: 0, width: w, height: 140}});
  console.log('errs', errs); await b.close();
}
