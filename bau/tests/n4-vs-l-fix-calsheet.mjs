// VS-L-fix: Mikro-Blatt quer während Einmessen (Schritte-Liste) und mit Ergebnis-Zeile: passt es? node n4-vs-l-fix-calsheet.mjs <file>
import {chromium} from 'playwright';
import {INIT as INIT2} from './v3-vs2-h.mjs';
const file = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
for (const [k, w, h] of [['L1', 844, 390], ['L2', 667, 375], ['XL', 926, 428], ['P2', 375, 667]]) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage();
  await p.addInitScript(INIT2); await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(500);
  await p.evaluate(() => SYNQUENZER.stimmeStart({route: 'speaker', cal: false})); await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 8000}).catch(() => {});
  await p.evaluate(() => SYNQUENZER.stimmeSheet()); await sleep(300);
  const m = () => p.evaluate(() => { const e = document.querySelector('.pop.stpop'), r = e.getBoundingClientRect(), g = e.querySelector('.st-go').getBoundingClientRect(); return {top: Math.round(r.top), h: Math.round(r.height), sh: e.scrollHeight, ch: e.clientHeight, goBottom: Math.round(g.bottom), vh: innerHeight}; });
  const a = await m();
  await p.evaluate(() => { ST.lastCal = {ok: true, kind: 'voll', medianMs: 41.2, spreadMs: 0.31, gainDb: -31, route: 'speaker'}; stSheetFill(UI.pop.el); popFit(UI.pop.el); }); await sleep(100);
  const b = await m();
  await p.evaluate(() => { ST.cal = {kind: 'voll', step: 'chirp'}; stSheetFill(UI.pop.el); popFit(UI.pop.el); }); await sleep(100);
  const c = await m();
  await p.evaluate(() => { ST.cal = null; stSheetFill(UI.pop.el); });
  console.log(k, 'Ruhe', JSON.stringify(a), '| Ergebnis', JSON.stringify(b), '| Einmessen läuft', JSON.stringify(c));
  await ctx.close();
}
await br.close();
