import {launch, open} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], process.argv[3] || 'L1');
console.log(await page.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); };
  return {mkqh: q('.mkqh'), pre: q('.mkqh .preset'), pv: q('.mkqh .pv'), pa: q('.mkqh .pa'), tabs: q('.mkqh .sh-tabs'), tab: q('.mkqh .tab'), nav: q('.mkqh .mknav'), more: q('.mkqmore'), x: q('.mkqh .sh-x'), fr: q('.mkfr'), body: q('#synthSheet .sh-body'), ef: document.elementFromPoint(385, 51).className}; }));
await b.close();
