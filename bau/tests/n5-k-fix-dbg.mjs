import {launch} from './n5-k-blib.mjs';
for (const [w, h, cls] of [[844, 390, 'edm1'], [320, 568, 'edm2']]) {
  const {b, p} = await launch({viewport: {width: w, height: h}, touch: true, mobile: true, dpr: 2});
  await p.evaluate(() => { loadPreset(3, 'f-moog-bass'); selectTrack(3); ED.tab = 'osc'; openEditor(); }); await p.waitForTimeout(500);
  console.log(w, JSON.stringify(await p.evaluate(cls => { const x = EL.synthSheet.querySelector('.' + cls), r = x.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2; const d = e => e === x ? 'ME' : e ? (e.tagName + '.' + e.className).slice(0, 22) : null;
    const col = [], row = []; for (let y = Math.floor(r.top) - 8; y <= r.bottom + 8; y++) col.push(y + ':' + d(document.elementFromPoint(cx, y))); for (let xx = Math.floor(r.left) - 8; xx <= r.right + 8; xx++) row.push(xx + ':' + d(document.elementFromPoint(xx, cy)));
    return {r: [r.left, r.top, r.right, r.bottom], col: col.filter(s => !s.endsWith('ME')), row: row.filter(s => !s.endsWith('ME'))}; }, cls)));
  await b.close();
}
