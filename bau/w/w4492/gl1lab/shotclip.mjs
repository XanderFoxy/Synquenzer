// Ausschnitt-Foto: node shotclip.mjs <png-in> <x> <y> <w> <h> <png-out>  (über eine Seite, die das Bild zeigt)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [inp, x, y, w, h, outp] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: +w, height: +h}});
const data = fs.readFileSync(inp).toString('base64');
await p.setContent(`<body style="margin:0;overflow:hidden"><img src="data:image/png;base64,${data}" style="position:absolute;left:${-x}px;top:${-y}px"></body>`);
await p.waitForTimeout(200); await p.screenshot({path: outp}); await b.close();
