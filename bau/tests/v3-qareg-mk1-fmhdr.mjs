// FM / WT track: tap KLANG, then FILTER tab (rebuilt header = settled state); ‹ › and name widths, base vs new
import { open, APP, BASE, OUT } from './v3-qareg-mk1-pw.mjs';
const SA = '#app{padding-left:47px!important;padding-right:47px!important}';
const hdr = p => p.evaluate(() => { const sh = document.getElementById('synthSheet'); const seg = sh.querySelector('.sh-head .seg.eng');
  const keys = [...seg.querySelectorAll('button')].map(b => (b.innerText || '').replace(/\s+/g, ' ').trim() + ':' + Math.round(b.getBoundingClientRect().width)).join(' ');
  const pa = [...sh.querySelectorAll('.preset .pa')].map(b => Math.round(b.getBoundingClientRect().width)); const pn = sh.querySelector('.preset .pn'); const pv = sh.querySelector('.preset .pv');
  const tx = pn.textContent; const rg = document.createRange(); rg.selectNodeContents(pn); 
  return keys + ' | ‹› ' + pa.join('/') + 'px | name box ' + Math.round(pv.getBoundingClientRect().width) + ' text ' + Math.round(pn.getBoundingClientRect().width) + 'px of ' + Math.round(pn.scrollWidth) + ' "' + tx + '"'; });
for (const [w, h, css, tag] of [[844, 390, '', 'L1'], [926, 428, SA, 'L0-SA (12 Pro Max)'], [844, 390, SA, 'L1-SA (12/13)'], [667, 375, '', 'L2']]) for (const eng of ['fm', 'wt', 'analog']) for (const [n, f] of [['base', BASE], ['new', APP]]) {
  const {b, p} = await open({width: w, height: h}, f, true); if (css) await p.addStyleTag({content: css});
  await p.evaluate(e => { const Q = window.SYNQUENZER; Q.selectTrack(0); if (e !== 'analog') Q.setEngine(0, e); }, eng); await p.waitForTimeout(300);
  await p.tap('#bKlang'); await p.waitForTimeout(700);
  await p.locator('#synthSheet button.tab', {hasText: 'FILTER'}).tap(); await p.waitForTimeout(500);
  console.log(tag.padEnd(20), eng.padEnd(6), n.padEnd(4), await hdr(p));
  if (tag === 'L0-SA (12 Pro Max)' && eng === 'fm') await p.screenshot({path: OUT + `fmhdr-L0SA-${n}.png`, clip: {x: 0, y: 0, width: w, height: 130}});
  await b.close();
}
