import {launch, open, openMk} from './v3-qmkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2] || 'P1', {dpr: 3}); await openMk(page); await page.waitForTimeout(800);
console.log(await page.evaluate(() => { const out = []; const walk = (e, d) => { const r = e.getBoundingClientRect(), n = e.querySelectorAll('*').length; if (n >= 40) out.push('  '.repeat(d) + e.tagName + (e.id ? '#' + e.id : '') + '.' + String(e.className.baseVal ?? e.className).split(' ').slice(0, 3).join('.') + ' n=' + n + ' vis=' + getComputedStyle(e).visibility + ' disp=' + getComputedStyle(e).display + ' r=' + [r.left, r.top, r.width, r.height].map(Math.round)); if (d < 3) for (const c of e.children) walk(c, d + 1); }; walk(document.body, 0); return out.join('\n'); }));
await b.close();
