import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], out = process.argv[3];
const b = await chromium.launch();
for (const [w, h, tag] of [[428, 926, 'p'], [926, 428, 'q']]) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    const D = window.SYNQUENZER;
    D.ndpChoose(); D.ndpOpen();
    await new Promise(r => setTimeout(r, 600));
    return D.ndpInfo().open;
  });
  console.log(tag, JSON.stringify(r), errs);
  await p.screenshot({path: out + '-' + tag + '.png'});
  await p.evaluate(() => window.SYNQUENZER.ndpView({view: 'spiel'}));
  await p.waitForTimeout(300);
  await p.screenshot({path: out + '-spiel-' + tag + '.png'});
  await p.close();
}
await b.close();
