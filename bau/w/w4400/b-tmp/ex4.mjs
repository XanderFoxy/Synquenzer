import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + file); await p.waitForTimeout(1500);
for (const mode of ['perc', 'drum']) {
  await p.evaluate(async (mode) => { const D = window.SYNQUENZER; if (mode === 'perc') { D.selectTrack(0); D.setParam(0, 'engine', 'north'); D.openEditor(); await new Promise(r => setTimeout(r, 300)); D.ndpOpen({perc: 0}); } else { D.ndpChoose(); D.ndpOpen(); } await new Promise(r => setTimeout(r, 900)); NDP.perfReset(); }, mode);
  const r = await (await p.$('#ndp .ndpk[data-k="mDec"]')).boundingBox(); const x = r.x + r.width / 2, y = r.y + r.height / 2;
  await p.mouse.move(x, y); await p.mouse.down(); for (let k = 1; k <= 120; k++) { await p.mouse.move(x, y - (k % 60) * 2); await p.waitForTimeout(8); } await p.mouse.up();
  const perf = await p.evaluate(() => NDP.info().perf);
  // paint cost
  const pc = await p.evaluate(() => { const t0 = performance.now(); for (let k = 0; k < 50; k++) { UI.sndVer++; UI.drumVer++; NDP.view({}); } return (performance.now() - t0) / 50; });
  console.log(mode, JSON.stringify(perf), 'rebuild ms', pc.toFixed(2));
  await p.evaluate(() => SYNQUENZER.ndpClose());
}
console.log(errs);
await b.close();
