import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK7/index.html';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
const page = await ctx.newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(async () => {
  const S = SYNQUENZER; S.setEngine(0, 'mk');
  const out = {};
  out.mk = S.mkGet(0);
  out.tracks = S.getState ? null : null;
  out.keys = Object.keys(S).filter(k => /mk|voc|engine|Track|track/i.test(k));
  return out;
});
console.log(JSON.stringify(r, null, 1).slice(0, 4000));
console.log('errs', errs);
await browser.close();
