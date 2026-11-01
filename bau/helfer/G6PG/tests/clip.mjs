// Vergleich Basis ↔ G6+g: liegt die Stärke-Zeile des Noten-Editors ganz im Blatt?
import { open, sing, chor, sleep } from './lib.mjs';
for (const app of [process.env.BASE, process.env.MINE]) {
  process.env.APP = app;
  for (const [n, w, h] of [['P1', 320, 568], ['P2', 375, 667], ['L1', 568, 320], ['L2', 844, 390]]) {
    const L = await import('./lib.mjs?' + Math.random());
    const {b, p} = await L.open({width: w, height: h});
    await L.sing(p); await L.chor(p, 'barber'); await p.evaluate(() => wpOpen({t: stimmeT(), s: 0})); await sleep(700);
    const r = await p.evaluate(() => { const q = document.querySelector('#wpSheet .qb').getBoundingClientRect(), s = document.querySelector('#wpSheet .wpsl').getBoundingClientRect(), c = WP.ed.cv.getBoundingClientRect(), f = document.querySelector('#wpSheet .wpf').getBoundingClientRect(); return {qbB: Math.round(q.bottom), slB: Math.round(f.bottom), cvH: Math.round(c.height)}; });
    console.log(app.split('/').slice(-2).join('/'), n, JSON.stringify(r), r.slB <= r.qbB ? 'ganz' : 'ABGESCHNITTEN');
    await b.close();
  }
}
