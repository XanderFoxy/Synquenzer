import { chromium } from 'playwright';
const file = process.argv[2], out = process.argv[3];
const b = await chromium.launch();
for (const [w, h] of [[428, 926], [926, 428], [428, 650]]) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  await p.evaluate(() => { openMasterPage(); });
  await p.waitForTimeout(500);
  await p.screenshot({path: `${out}/master-${w}x${h}.png`});
  await p.close();
}
await b.close();
