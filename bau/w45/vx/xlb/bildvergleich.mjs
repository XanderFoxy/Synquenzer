// Normales Projekt (Demo) sieht aus wie 4.78: Bildschirmfoto Basis vs. XLB je Größe, Vergleich per md5 der PNG.
// Aufruf: node bildvergleich.mjs <basis.html> <index.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import crypto from 'node:crypto';
import path from 'node:path';
const A = path.resolve(process.argv[2]), B = path.resolve(process.argv[3]);
const b = await chromium.launch();
const out = [];
for (const [w, h] of [[428, 926], [926, 428], [320, 568]]) {
  const md = {};
  for (const [k, f] of [['basis', A], ['neu', B]]) {
    const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 1, hasTouch: true, isMobile: true});
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.goto('file://' + f, {waitUntil: 'load', timeout: 120000});
    await p.waitForFunction(() => typeof BOOT !== 'undefined' && BOOT.done, null, {polling: 'raf', timeout: 120000});
    await p.waitForTimeout(1200);
    const png = await p.screenshot({animations: 'disabled', caret: 'hide'});
    md[k] = crypto.createHash('md5').update(png).digest('hex').slice(0, 12); md[k + 'Err'] = errs;
    await ctx.close();
  }
  out.push({w, h, gleich: md.basis === md.neu, ...md});
}
console.log(JSON.stringify(out));
await b.close();
