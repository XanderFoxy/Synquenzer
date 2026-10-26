import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const [file, out] = [process.argv[2], process.argv[3]];
const b = await launch();
for (const f of ['X', 'P1']) {
  const page = await open(b, f, {file});
  await page.waitForTimeout(800); await openMk(page); await page.waitForTimeout(700);
  await page.screenshot({path: out + '-' + f + '.png'});
  console.log(f, 'errs', JSON.stringify(page.errs).slice(0, 300));
  await page.ctx.close();
}
await b.close();
