// crop+zoom two PNGs side by side into one PNG: node crop.mjs a.png b.png x y w h scale out.png
import { chromium } from 'playwright';
import fs from 'fs';
const [a, b, x, y, w, h, sc, out] = process.argv.slice(2);
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
const p = await br.newPage({viewport: {width: Math.round(w * sc * 2 + 30), height: Math.round(h * sc + 20)}});
const d = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
await p.setContent(`<body style="margin:0;background:#f0f;display:flex;gap:10px;padding:10px">${[a, b].map(f => `<div style="width:${w * sc}px;height:${h * sc}px;overflow:hidden;position:relative"><img src="${d(f)}" style="position:absolute;left:${-x * sc}px;top:${-y * sc}px;transform-origin:0 0;transform:scale(${sc});image-rendering:pixelated"></div>`).join('')}</body>`);
await p.waitForTimeout(200);
await p.screenshot({path: out});
await br.close();
