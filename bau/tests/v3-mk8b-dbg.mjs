import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
const page = await ctx.newPage();
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
console.log(await page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); openBrowser(0); BR.kp = 5; brRefresh();
  const b = document.querySelector('#sndSheet .brow .binfo'), q = b.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2;
  const d = (x, y) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className : null; };
  const c = document.querySelector('#sndSheet .brkg[data-g="5"]'), cl = c.querySelector('.cl');
  return JSON.stringify({q: [q.left, q.top, q.width, q.height], l: d(cx - 21.5, cy), r: d(cx + 21.5, cy), t: d(cx, cy - 21.5), bo: d(cx, cy + 21.5), after: getComputedStyle(b, '::after').content,
    chip: [c.clientWidth, c.scrollWidth, cl.clientWidth, cl.scrollWidth, getComputedStyle(c).paddingLeft, getComputedStyle(c).fontSize, getComputedStyle(c).letterSpacing]}); }));
await browser.close();
