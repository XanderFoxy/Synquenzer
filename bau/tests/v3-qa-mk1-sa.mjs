// QA MK1 (FP-TOUCH / FP-IPHONE): iPhone portrait with real safe areas (standalone: top 47, bottom 34) and Safari with
// toolbars (390 x 664), landscape with notch (844 x 390, 47 left/right, 21 bottom): panel clipping, hit areas, scroll.
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk1-shots/';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const CASES = [
  ['P1-standalone', 390, 844, '#app{padding:47px 0 34px 0 !important}'],
  ['P1-safari', 390, 664, ''],
  ['P1-max-standalone', 430, 932, '#app{padding:59px 0 34px 0 !important}'],
  ['P2-se', 375, 667, ''],
  ['L1-notch-home', 844, 390, '#app{padding:0 47px 21px 47px !important}'],
  ['L1-max-notch', 932, 430, '#app{padding:0 59px 21px 59px !important}'],
];
const out = [];
for (const [nm, w, h, css] of CASES) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  if (css) await page.addStyleTag({content: css});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(700);
  const r = await page.evaluate(() => {
    const pi = SYNQUENZER.mkPanel();
    const app = document.getElementById('app').getBoundingClientRect();
    const ctl = [...document.querySelectorAll('#synthSheet .mkx, #mkWh .mkwheel, #synthSheet .sh-head button')].filter(e => e.offsetParent && !e.closest('[hidden]'));
    const outside = ctl.filter(e => { const b = e.getBoundingClientRect(); return b.width && (b.bottom > app.bottom + .5 || b.top < app.top - .5 || b.left < app.left - .5 || b.right > app.right + .5); }).map(e => (e.dataset.k || e.dataset.w || e.textContent.trim().slice(0, 10)) + '@' + Math.round(e.getBoundingClientRect().bottom));
    const pg = document.querySelector('#synthSheet .pg');
    const kb = document.getElementById('kbArea').getBoundingClientRect();
    // clipped controls: a control whose rect leaves its scroll/clip container
    const clip = ctl.filter(e => { let p = e.parentElement; const b = e.getBoundingClientRect(); while (p && p !== document.body) { const cs = getComputedStyle(p); if (/(hidden|auto|scroll|clip)/.test(cs.overflow + cs.overflowY + cs.overflowX)) { const q = p.getBoundingClientRect(); if (b.bottom > q.bottom + 1 || b.top < q.top - 1 || b.right > q.right + 1 || b.left < q.left - 1) return true; } p = p.parentElement; } return false; }).map(e => e.dataset.k || e.dataset.w || e.textContent.trim().slice(0, 10));
    return {fmt: pi && pi.fmt, half: pi && pi.half, pg: pg ? [Math.round(pg.clientHeight), pg.scrollHeight, Math.round(pg.clientWidth), pg.scrollWidth] : null,
      kb: [Math.round(kb.top), Math.round(kb.height)], doc: [document.scrollingElement.scrollWidth, document.scrollingElement.scrollHeight], outside, clip};
  });
  out.push(`${nm} ${w}x${h}: fmt ${r.fmt} half ${r.half}; .pg client/scroll H ${r.pg && r.pg.slice(0, 2)} W ${r.pg && r.pg.slice(2)}; keyboard top ${r.kb[0]} h ${r.kb[1]}; doc ${r.doc}; outside app: ${r.outside.join(',') || 'none'}; clipped: ${r.clip.join(',') || 'none'}; errs ${errs.length}`);
  await page.screenshot({path: OUT + 'sa-' + nm + '.png'});
  await ctx.close();
}
console.log(out.join('\n'));
await browser.close();
