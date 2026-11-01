// Layout 428x926 / 926x428 / 428x650: start view, synth editor (OSC and LFO page) and the result of an opened menu are
// pixel-equal to 4.30.0 except the new 6th LFO field (A.9: no existing view changes); no horizontal scrolling.
// node n8-layout.mjs [index.html]
import {chromium} from 'playwright';
import path from 'path'; import {fileURLToPath} from 'url'; import fs from 'fs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const NEW = path.resolve(process.argv[2] || path.join(HERE, '../index.html')), OLD = path.resolve(HERE, '../../../snapshots/R-4300.html');
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const b = await chromium.launch();
async function shots(file, W, H) {
  const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true}); const p = await ctx.newPage();
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await p.addStyleTag({content: '*{animation:none!important;transition:none!important;caret-color:transparent!important}'});
  await p.waitForTimeout(600); const out = {};
  out.start = await p.screenshot(); out.hs = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  await p.evaluate(async () => { R.selT = 0; ED.tab = 'osc'; ED.sub.osc = 'o1'; openEditor(); await new Promise(r => setTimeout(r, 300)); });
  out.osc = await p.screenshot();
  await p.evaluate(async () => { closeSheets(); openMenu(); await new Promise(r => setTimeout(r, 300)); });
  out.menu = await p.screenshot();
  await ctx.close(); return out;
}
for (const [W, H] of [[428, 926], [926, 428], [428, 650]]) {
  const a = await shots(OLD, W, H), c = await shots(NEW, W, H);
  for (const k of ['start', 'osc', 'menu']) ok(W + '×' + H + ' ' + k + ' pixelgleich zu 4.30.0', Buffer.compare(a[k], c[k]) === 0, a[k].length + ' / ' + c[k].length + ' Byte');
  ok(W + '×' + H + ' keine waagrechte Scrollleiste', c.hs);
}
await b.close();
console.log(fails ? 'FEHLER: ' + fails : 'ALLES GRÜN'); process.exit(fails ? 1 : 0);
