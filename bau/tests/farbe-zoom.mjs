import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const [file, out] = [process.argv[2], process.argv[3]];
const b = await launch();
const page = await open(b, 'X', {file, dpr: 3});
await page.waitForTimeout(800); await openMk(page); await page.waitForTimeout(700);
await page.screenshot({path: out + '-X.png', scale: 'css'});
await page.screenshot({path: out + '-zoom.png', clip: {x: 330, y: 45, width: 230, height: 150}});
console.log('errs', JSON.stringify(page.errs).slice(0, 300));
await b.close();
