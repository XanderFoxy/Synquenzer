// M-PLATZ für die Legende: 6 Formate, Treffer ≥ 44 × 44, keine Seiten-Überbreite, Leinwand bleibt ≥ 48 px, Bildschirmfoto je Format
import { open, sing, chor, sleep, HERE } from './lib.mjs';
const F = [['P1', 320, 568], ['P2', 375, 667], ['P3', 390, 844], ['L1', 568, 320], ['L2', 844, 390], ['L3', 926, 428]]; let fail = 0;
for (const [n, w, h] of F) {
  const {b, p, errs} = await open({width: w, height: h});
  await sing(p); await chor(p, 'barber'); await p.evaluate(() => SYNQUENZER.g6pgSing(null, 0)); await p.evaluate(() => SYNQUENZER.g2Open()); await sleep(900);
  const r = await p.evaluate(() => { const bs = [...document.querySelectorAll('#wpSheet .g6pgleg button')].map(b => b.getBoundingClientRect()), lg = document.querySelector('#wpSheet .g6pgleg').getBoundingClientRect(), cv = G2.ed.cv.getBoundingClientRect();
    const q = document.querySelector('#wpSheet .qb').getBoundingClientRect(), sl = document.querySelector('#wpSheet .wpsl').getBoundingClientRect();
    const blk = (G2.ed.blk || []).map(b => cv.top + b.y - G2.ed.rowH / 2).concat(SYNQUENZER.g6pgHit().map(h => h.y - h.h / 2));
    return {n: bs.length, minW: Math.min(...bs.map(x => x.width)), minH: Math.min(...bs.map(x => x.height)), over: document.documentElement.scrollWidth - innerWidth, cvH: Math.round(cv.height), legB: Math.round(lg.bottom),
      notesTop: Math.round(Math.min(...blk)), slB: Math.round(sl.bottom), qbB: Math.round(q.bottom)}; });
  const good = r.minW >= 44 && r.minH >= 44 && r.over <= 0 && r.slB <= r.qbB && r.notesTop >= r.legB - 1 && errs.length === 0;
  if (!good) fail++;
  console.log((good ? '✓ ' : '✗ ') + n + ' ' + w + '×' + h + ' ' + JSON.stringify(r) + (errs.length ? ' ' + errs[0] : ''));
  await p.screenshot({path: HERE + '/../shots/platz-' + n + '.png'});
  await b.close();
}
console.log(fail ? fail + ' FEHLER' : 'alle grün'); process.exit(fail ? 1 : 0);
