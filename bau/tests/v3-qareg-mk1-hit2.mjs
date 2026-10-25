import { open, APP, BASE } from './v3-qareg-mk1-pw.mjs';
for (const [w, h, tag] of [[844, 390, 'L1'], [667, 375, 'L2'], [390, 844, 'P1']]) for (const [n, f] of [['base', BASE], ['new', APP]]) {
  const {b, p} = await open({width: w, height: h}, f, true);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(400);
  await p.locator('#synthSheet button.tab', {hasText: 'FILTER'}).tap(); await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const out = {}; const lab = e => { if (!e) return 'none'; const k = e.closest('button') || e; return (k.id || k.className.toString().split(' ')[0] || k.tagName) + ':' + (k.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 8); };
    for (const x of [60, 100, 140, 200, 240]) { const col = []; let last = null; for (let y = 30; y < 110; y++) { const l = lab(document.elementFromPoint(x, y)); if (l !== last) { col.push(y + ' ' + l); last = l; } } out[x] = col.join(' → '); } return out; });
  console.log('==', tag, n); for (const k of Object.keys(r)) console.log('  x' + k, r[k]);
  await b.close();
}
