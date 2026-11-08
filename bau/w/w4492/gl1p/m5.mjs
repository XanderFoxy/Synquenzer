import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const FILE = process.argv[2];
const b = await chromium.launch();
for (const [w, h] of [[926, 370], [926, 428], [428, 926]]) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, deviceScaleFactor: 2}); const p = await ctx.newPage();
  await p.goto('file://' + FILE); await p.waitForTimeout(1500);
  for (const sel of [false, true]) {
  const r = await p.evaluate(async sel => { stop(); SYNQUENZER.loadDemo(); S.tracks[0].clips[0] = {len: 2, key: {root: 2, scale: 'aeolian', src: 'user'}, notes: [0, 2, 4, 5, 7, 9, 11, 12].map((d, k) => ({t: k, d: .4, n: 60 + d, v: .8}))}; clipChanged(0, 0); SYNQUENZER.lf1Dir(0, 0, {st: 27}); R.selT = sel ? 0 : 1; R.selS = 0; UI.dirty.grid = true;
    await new Promise(r => setTimeout(r, 400));
    const C = UI.cells[0][0], q = e => { const rg = document.createRange(); rg.selectNodeContents(e); const x = rg.getBoundingClientRect(); return [+x.left.toFixed(1), +x.top.toFixed(1), +x.right.toFixed(1), +x.bottom.toFixed(1)]; }, cr = C.el.getBoundingClientRect();
    return {cellW: UI.cellW, cell: [cr.width, cr.height], mxRow: GL1.mxRow, ln: C.ln.textContent, lnR: q(C.ln), kb: C.kbg.textContent, kbR: q(C.kbg), kbBox: (r => [r.left, r.top, r.right, r.bottom].map(v => +v.toFixed(1)))(C.kbg.getBoundingClientRect())};
  }, sel);
  console.log(w + 'x' + h, sel ? 'sel' : '   ', JSON.stringify(r));
  }
  await ctx.close();
}
await b.close();
