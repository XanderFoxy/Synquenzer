import { open, APP, BASE, OUT } from './v3-qareg-mk1-pw.mjs';
for (const [w, h, tag] of [[390, 844, 'P1'], [844, 390, 'L1']]) for (const [n, f] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: w, height: h}, f, true);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.forceNative(true); await new Promise(r => setTimeout(r, 500)); Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(700);
  const r = await p.evaluate(() => [...document.querySelectorAll('#synthSheet .seg.eng button')].map(b => b.innerText.replace(/\s+/g, ' ') + (b.classList.contains('eco') ? '[eco]' : '') + ' ' + getComputedStyle(b, '::before').content));
  await p.screenshot({path: OUT + `eco-${tag}-${n}.png`, clip: {x: 0, y: 40, width: w, height: 60}});
  console.log(tag, n, JSON.stringify(r), errs.length ? errs : '');
  await b.close();
}
