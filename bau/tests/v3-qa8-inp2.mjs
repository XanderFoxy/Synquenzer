// repro 2: page.tap (Playwright touch) on the name field of the MS 2000 Sichern popup vs. the VA one; then type a name and write
import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await launch();
for (const f of ['P1', 'L1']) {
  const {ctx, page: p, errs} = await open(b, f);
  await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); mkProg.select(1, 5); SYNQUENZER.mkSet(0, 't.0.f.cut', 60); });
  await sleep(500);
  await p.tap('#synthSheet .sh-head .hb.sv'); await sleep(400);
  await p.tap('.pop.mk8w input.tin'); await sleep(300);
  const foc = await p.evaluate(() => document.activeElement === document.querySelector('.pop.mk8w input.tin'));
  await p.keyboard.type('Mein Lead');
  const val = await p.evaluate(() => document.querySelector('.pop.mk8w input.tin').value);
  await p.tap('.pop.mk8w [data-a="go"]'); await sleep(600);
  const name = await p.evaluate(() => { const c = mkProg.current(); return c && c.text; });
  console.log(f, 'MS 2000 Sichern: tap on name field focused =', foc, '| value after typing "Mein Lead":', JSON.stringify(val), '| written as', name, '| errs', errs.length);
  // the same with the VA Sichern popup (track 1 is VA)
  await p.evaluate(() => { closeEditor && closeEditor(); SYNQUENZER.selectTrack(1); SYNQUENZER.openEditor(); SYNQUENZER.setParam && 0; }); await sleep(500);
  await p.evaluate(() => { try { SYNQUENZER.setParam(1, 'cutoff', 0.3); } catch (e) {} });
  await p.tap('#synthSheet .sh-head .hb.sv'); await sleep(400);
  await p.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur(); });
  const has = await p.evaluate(() => !!document.querySelector('#popLayer .pop input.tin'));
  if (has) { await p.tap('#popLayer .pop input.tin'); await sleep(300); }
  const fv = await p.evaluate(() => document.activeElement === document.querySelector('#popLayer .pop input.tin'));
  console.log(f, 'VA Sichern: input present', has, '| tap focused =', fv);
  await ctx.close();
}
await b.close();
