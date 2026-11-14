import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs'; import fs from 'fs';
const [A, B] = process.argv.slice(2), b = await chromium.launch(), p = await b.newPage();
const r = await p.evaluate(async ([a, c]) => { const ld = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
  const [x, y] = [await ld(a), await ld(c)], g = (i) => { const cv = new OffscreenCanvas(i.width, i.height), t = cv.getContext('2d'); t.drawImage(i, 0, 0); return t.getImageData(0, 0, i.width, i.height).data; };
  const d1 = g(x), d2 = g(y); let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let k = 0; k < d1.length; k += 4) if (d1[k] !== d2[k] || d1[k + 1] !== d2[k + 1] || d1[k + 2] !== d2[k + 2]) { n++; const px = (k / 4) % x.width, py = Math.floor(k / 4 / x.width); x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); }
  return {n, bbox: [x0, y0, x1, y1]}; }, [fs.readFileSync(A).toString('base64'), fs.readFileSync(B).toString('base64')]);
console.log(JSON.stringify(r)); await b.close();
