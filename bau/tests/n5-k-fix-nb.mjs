// K1-fix: hit area of ⋯ (edm1 / edm2) and of every head button around it, before (APP=base) and after
import {launch} from './n5-k-blib.mjs';
for (const [w, h] of [[844, 390], [667, 375], [926, 428], [320, 568], [375, 667], [390, 844]]) {
  const {b, p} = await launch({viewport: {width: w, height: h}, touch: true, mobile: true, dpr: 2});
  await p.evaluate(() => { loadPreset(3, 'f-moog-bass'); selectTrack(3); ED.tab = 'osc'; openEditor(); }); await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const hit = e => { const r = e.getBoundingClientRect(); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let y = Math.floor(r.top) - 12; y <= r.bottom + 12; y++) for (let x = Math.floor(r.left) - 12; x <= r.right + 12; x++) { const h = document.elementFromPoint(x, y); if (h && (h === e || e.contains(h))) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } } return x1 < 0 ? '0x0' : (x1 - x0 + 1) + 'x' + (y1 - y0 + 1); };
    const m = [...EL.synthSheet.querySelectorAll('.edm')].find(x => x.getBoundingClientRect().width > 0), q = m.getBoundingClientRect();
    const nb = [...EL.synthSheet.querySelectorAll('button')].filter(x => { const r = x.getBoundingClientRect(); return x !== m && r.width > 0 && r.right > q.left - 60 && r.left < q.right + 60 && r.bottom > q.top - 50 && r.top < q.bottom + 50; });
    return {me: m.className.replace('hb rb ', '') + ' ' + hit(m), nb: nb.map(x => (x.className.replace(/\s+/g, '.') + ':' + (x.textContent || '').trim().slice(0, 6)).slice(0, 30) + ' ' + hit(x))};
  });
  console.log(JSON.stringify({vp: w + 'x' + h, ...r}));
  await b.close();
}
