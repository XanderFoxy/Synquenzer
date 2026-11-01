// Layout 428x926 / 926x428 / 428x650: start view, synth editor (OSC and LFO page) and the result of an opened menu are
// pixel-equal to 4.30.0 except the new 6th LFO field (A.9: no existing view changes); no horizontal scrolling.
// node n8-layout.mjs [index.html]
import {chromium} from 'playwright';
import path from 'path'; import {fileURLToPath} from 'url'; import fs from 'fs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const NEW = path.resolve(process.argv[2] || path.join(HERE, '../../../index.html')), OLD = path.resolve(HERE, '../../../../../snapshots/R-4300.html');
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
// pixels that differ between two PNGs (decoded in a page); the start view has a live display, so 4.30.0 against itself is the bar
const dp = await (await b.newContext()).newPage();
async function diff(x, y, y0 = 0) {   // B2: y0 = erst ab dieser Bildzeile zählen
  return dp.evaluate(async ([a, c, y0]) => { const ld = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
    const [A, C] = await Promise.all([ld(a), ld(c)]); if (A.width !== C.width || A.height !== C.height) return 1e9;
    const cv = new OffscreenCanvas(A.width, A.height), g = cv.getContext('2d'); g.drawImage(A, 0, 0); const da = g.getImageData(0, 0, A.width, A.height).data; g.clearRect(0, 0, A.width, A.height); g.drawImage(C, 0, 0); const dc = g.getImageData(0, 0, A.width, A.height).data;
    let n = 0; for (let k = y0 * A.width * 4; k < da.length; k += 4) if (da[k] !== dc[k] || da[k + 1] !== dc[k + 1] || da[k + 2] !== dc[k + 2]) n++; return n; }, [x.toString('base64'), y.toString('base64'), y0]);
}
for (const [W, H] of [[428, 926], [926, 428], [428, 650]]) {
  const a = await shots(OLD, W, H), a2 = await shots(OLD, W, H), c = await shots(NEW, W, H);
  // B2: die Kopfzeile des Synth-Editors ändert sich bewusst ([◆] von V6A, Engine-Wahl mit Bit Mask) – dort ab der Zeile unter dem Kopf vergleichen
  for (const k of ['start', 'osc', 'menu']) { const y0 = k === 'osc' ? (H > W ? 100 : 92) : 0, self = await diff(a[k], a2[k], y0), d = await diff(a[k], c[k], y0);
    ok(W + '×' + H + ' ' + k + (y0 ? ' (unter dem Kopf)' : '') + ' wie 4.30.0', d <= Math.max(self * 2, 0) + 400, d + ' Pixel anders (4.30.0 gegen sich selbst: ' + self + ')'); }
  ok(W + '×' + H + ' keine waagrechte Scrollleiste', c.hs);
}
await b.close();
console.log(fails ? 'FEHLER: ' + fails : 'ALLES GRÜN'); process.exit(fails ? 1 : 0);
