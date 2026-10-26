import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2] || new URL('../mk-br-MK7/index.html', import.meta.url).pathname), OUT = new URL('./v3-mk7-shots/', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
const only = process.env.FMT ? process.env.FMT.split(',') : Object.keys(FMT);
for (const f of only) {
  const [w, h] = FMT[f];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: f !== 'W', deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { MKUI.setv(MKUI.KN.mode, 1, false); MKUI.render(); });
  const shots = [['spiel', () => MKUI.toSpiel()], ['eing1', () => MKUI.setWahl(1, 3)], ['eing1-eb2', () => { MKUI.setWahl(1, 3); MKUI.P.shift = 1; MKUI.render(); }], ['mixer', () => MKUI.setWahl(1, 4)], ['filter', () => MKUI.setWahl(1, 5)], ['fcmod', () => MKUI.setWahl(1, 6)], ['amp', () => MKUI.setWahl(1, 7)],
    ['kpegel', () => MKUI.setWahl(2, 0)], ['kpan', () => MKUI.setWahl(2, 2)], ['baender', () => { MKUI.P.bA = 'chl'; MKUI.viewOpen('baender'); }], ['baender-pan', () => { MKUI.P.bA = 'chp'; MKUI.viewOpen('baender'); }]];
  for (const [n, fn] of shots) {
    await page.evaluate(String(fn).replace(/^\(\) => /, '() => ' ) === '' ? null : `(${fn})()`); await page.waitForTimeout(200);
    if (n.startsWith('baender')) { } else await page.evaluate(() => { if (MKUI.P.view) MKUI.viewClose(); });
    await page.screenshot({path: OUT + f + '-' + n + '.png'});
  }
  console.log(f, errs);
  await ctx.close();
}
await browser.close();
