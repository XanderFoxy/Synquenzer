// read pixels of a PNG (img coords): node v3-mkp-px.mjs file.png x,y x,y ...
import {launch} from './v3-mkp-lib.mjs';
import fs from 'fs';
const b = await launch(); const p = await b.newPage();
const r = await p.evaluate(async ([src, pts]) => { const i = new Image(); await new Promise(r => { i.onload = r; i.src = src; }); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0);
  return pts.map(([x, y]) => { const d = g.getImageData(x, y, 1, 1).data; const r = d[0] / 255, gg = d[1] / 255, bb = d[2] / 255, mx = Math.max(r, gg, bb), mn = Math.min(r, gg, bb), l = (mx + mn) / 2, dd = mx - mn; let h = 0, s = 0; if (dd) { s = dd / (1 - Math.abs(2 * l - 1)); h = mx === r ? 60 * (((gg - bb) / dd) % 6) : mx === gg ? 60 * ((bb - r) / dd + 2) : 60 * ((r - gg) / dd + 4); } return [x, y, d[0], d[1], d[2], Math.round((h + 360) % 360), Math.round(s * 100), Math.round(l * 100)]; }); },
  ['data:image/png;base64,' + fs.readFileSync(process.argv[2]).toString('base64'), process.argv.slice(3).map(s => s.split(',').map(Number))]);
for (const x of r) console.log(x.join(' ')); await b.close();
