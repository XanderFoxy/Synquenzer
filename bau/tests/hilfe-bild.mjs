import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const [file, out] = [process.argv[2], process.argv[3]];
const b = await launch();
const page = await open(b, 'X', {file, dpr: 2});
await page.waitForTimeout(800); await openMk(page); await page.waitForTimeout(700);
const texts = await page.evaluate(() => [...document.querySelectorAll('#synthSheet .mkpt')].map(e => { const r = e.getBoundingClientRect(); return [e.textContent.trim(), Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }).filter(t => /^(REC|CUTOFF|EDIT|EXIT|PAGE|\+ ?\/ ?YES|UP|DOWN|BANK|9|11|1|MOD SEQUENCE|ON ?\/ ?OFF)$/.test(t[0])));
console.log(JSON.stringify(texts));
await b.close();
