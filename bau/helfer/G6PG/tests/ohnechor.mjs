// Ohne Chor: Noten- und Marken-Editor pixelgleich zur Basis R-4252 (Regel 28) + Smoke (Start ohne Fehler)
import { sing, sleep } from './lib.mjs';
const shots = {};
for (const [tag, app] of [['base', process.env.BASE], ['mine', process.env.MINE]]) {
  process.env.APP = app; const L = await import('./lib.mjs?' + tag);
  const {b, p, errs} = await L.open();
  await L.sing(p);
  const r = {};
  await p.evaluate(() => SYNQUENZER.g2Open()); await sleep(1500); await p.evaluate(() => g2Paint());
  r.g2 = await p.evaluate(() => G2.ed.cv.toDataURL()); await p.evaluate(() => SYNQUENZER.g2Close());
  await p.evaluate(() => wpOpen({t: stimmeT(), s: 0})); await sleep(1500); await p.evaluate(() => wpPaint());
  r.wp = await p.evaluate(() => WP.ed.cv.toDataURL()); await p.evaluate(() => wpClose());
  r.errs = errs; shots[tag] = r; await b.close();
}
const g2 = shots.base.g2 === shots.mine.g2, wp = shots.base.wp === shots.mine.wp, e = shots.mine.errs.length === 0;
console.log((g2 ? '✓' : '✗') + ' Noten-Editor ohne Chor pixelgleich'); console.log((wp ? '✓' : '✗') + ' Marken-Editor ohne Chor pixelgleich'); console.log((e ? '✓' : '✗') + ' Smoke ohne Fehler ' + JSON.stringify(shots.mine.errs.slice(0, 3)));
process.exit(g2 && wp && e ? 0 : 1);
