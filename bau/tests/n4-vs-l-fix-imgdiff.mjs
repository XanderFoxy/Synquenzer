// VS-L-fix: Bild-Vergleich (Chromium-Canvas): node n4-vs-l-fix-imgdiff.mjs a.png b.png [a2 b2 …] → Anteil verschiedener Pixel + Rahmen
import {chromium} from 'playwright';
import fs from 'fs';
const args = process.argv.slice(2), br = await chromium.launch(), p = await br.newPage();
for (let i = 0; i < args.length; i += 2) {
  const A = fs.readFileSync(args[i]).toString('base64'), B = fs.readFileSync(args[i + 1]).toString('base64');
  const r = await p.evaluate(async ([A, B]) => {
    const ld = s => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.src = 'data:image/png;base64,' + s; });
    const a = await ld(A), b = await ld(B); if (a.width !== b.width || a.height !== b.height) return {size: [a.width, a.height, b.width, b.height]};
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height; const x = c.getContext('2d');
    x.drawImage(a, 0, 0); const da = x.getImageData(0, 0, c.width, c.height).data; x.clearRect(0, 0, c.width, c.height); x.drawImage(b, 0, 0); const db = x.getImageData(0, 0, c.width, c.height).data;
    let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let i = 0; i < da.length; i += 4) if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) { n++; const px = (i / 4) % c.width, py = Math.floor(i / 4 / c.width); x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); }
    return {n, box: n ? [x0, y0, x1, y1] : null, w: c.width, h: c.height};
  }, [A, B]);
  console.log(args[i].split('/').pop(), '↔', args[i + 1].split('/').pop(), JSON.stringify(r));
}
await br.close();
