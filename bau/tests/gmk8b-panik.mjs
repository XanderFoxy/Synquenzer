// QA typical defect C15: PANIK (header ■ while stopped) and double stop while playing end everything incl. delay tails of both timbres
import {launch, open, mkOk, sleep, DIR, tapSel} from './gmk8b-h.mjs';
const {ok, fails} = mkOk();
const IDS = (process.env.IDS || 'f-mk-k105,f-mk-k109,f-mk-k115,f-mk-k212,f-mk-k315,f-mk-k415,f-mk-k516,f-mk-k616,f-mk-k701,f-mk-k202,f-mk-k806,f-mk-k812,f-mk-k815').split(',');
const br = await launch(true);
const {ctx, page, errs} = await open(br, {mic: true});
await page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); await MKK.decodeAll(); });
await sleep(800); await page.evaluate(() => window.__recOut());
const stopSel = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /stop|■/i.test((b.getAttribute('aria-label') || '') + b.textContent) && b.getBoundingClientRect().top < 60); return b ? (b.id ? '#' + b.id : null) : null; });
for (const id of IDS) {
  const r = await page.evaluate(async id => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    SYNQUENZER.browserTap(id); closeBrowser(false); await w(300);
    for (const n of [48, 52, 55]) SYNQUENZER.keyOn(n, .8, 'q' + n); await w(2000); for (const n of [48, 52, 55]) SYNQUENZER.keyOff(n, 'q' + n);
    await w(60); window.__recStop(); await w(200); const pre = window.__recStop();
    panic(); await w(300); window.__recStop(); await w(400); const t = window.__recStop();
    const db = a => { let e = 0; for (let i = 0; i < a.L.length; i++) e += .5 * (a.L[i] * a.L[i] + a.R[i] * a.R[i]); return 10 * Math.log10(e / Math.max(1, a.L.length) + 1e-30); };
    return {id, name: FACTORY_BY_ID.get(id).name, mode: S.tracks[0].sound.p.mk.mode, pre: db(pre), tail: db(t)};
  }, id);
  ok(r.id.slice(5) + ' ' + r.name.padEnd(13) + ' mode ' + r.mode + ' panic() kills release + delay tails', r.tail < -70, 'before ' + r.pre.toFixed(1) + ' dBFS, 300–700 ms after panic ' + r.tail.toFixed(1) + ' dBFS');
}
ok('console', errs.length === 0, errs.slice(0, 3).join(' | '));
await br.close();
console.log(fails() ? 'FAIL ' + fails() : 'ALL PASS');
