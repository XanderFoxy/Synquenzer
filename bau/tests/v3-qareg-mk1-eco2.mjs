import { open, APP, BASE, OUT } from './v3-qareg-mk1-pw.mjs';
for (const [w, h, tag] of [[844, 1180, 'W'], [375, 667, 'P2'], [320, 568, 'P3']]) for (const [n, f] of [['base', BASE], ['new', APP]]) for (const eng of ['analog', 'mk']) {
  if (n === 'base' && eng === 'mk') continue;
  const {b, p, errs} = await open({width: w, height: h}, f, true);
  await p.evaluate(async (eng) => { const Q = window.SYNQUENZER; Q.forceNative(true); await new Promise(r => setTimeout(r, 400)); Q.selectTrack(0); if (eng === 'mk') Q.setEngine(0, 'mk'); Q.openEditor(); await new Promise(r => setTimeout(r, 500)); const t = [...document.querySelectorAll('#synthSheet button.tab')][1]; t && t.click(); }, eng); await p.waitForTimeout(700);
  const r = await p.evaluate(() => [...document.querySelectorAll('#synthSheet .seg.eng button')].map(b => { const cs = getComputedStyle(b, '::before'); return b.innerText.replace(/\s+/g, ' ') + (b.classList.contains('eco') ? '[eco]' : '') + ' before=' + cs.content + '/' + cs.display; }));
  console.log(tag, n, eng, JSON.stringify(r), errs.length ? errs : '');
  await b.close();
}
