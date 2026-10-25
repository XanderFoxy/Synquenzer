// MK1 screenshots of the AM panel in all formats (states via argv: spiel | filter | shift | half)
import { chromium } from 'playwright';
const FILE = process.env.MK_FILE || new URL('../mk-wt/index.html', import.meta.url).pathname;
const st = process.argv[2] || 'spiel', fm = (process.argv[3] || 'P1,P2,P3,L1,L2,W,L0').split(',');
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180], L0: [926, 428]};
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const n of fm) {
  const [w, h] = FMT[n];
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await p.waitForTimeout(600);
  await p.evaluate(st => { if (st === 'filter' || st === 'shift') MKUI.setWahl(1, 5); if (st === 'shift') { MKUI.P.shift = 1; MKUI.render(); } }, st);
  await p.waitForTimeout(100);
  const info = await p.evaluate(() => ({panel: SYNQUENZER.mkPanel(), over: [...document.querySelectorAll('#synthSheet .mkx .lg, #synthSheet .mkx .pn, #synthSheet .mkx .pb, #synthSheet .mkx .ma span, #synthSheet .mkx .mn, #synthSheet .sh-head button')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent).slice(0, 12)}));
  console.log(n, JSON.stringify({fmt: info.panel && info.panel.fmt, half: info.panel && info.panel.half, scale: info.panel && info.panel.scale, body: info.panel && info.panel.body, over: info.over, errs}));
  await p.screenshot({path: `v3-mk1-shots/mk1-${st}-${n}.png`});
  await p.close();
}
await b.close();
