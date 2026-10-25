// independent repro: engine chip vs. four keys on first open vs. after a tab tap (portrait phones)
import { chromium } from 'playwright';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const sizes = (process.env.SIZES || '428x926,414x896,390x844,375x667,360x780,320x568').split(',').map(s => s.split('x').map(Number));
const state = page => page.evaluate(() => {
  const sh = document.getElementById('synthSheet'); const r1 = sh && sh.querySelector('.sh-head .r1');
  if (!r1) return null;
  const eng = r1.querySelector('.seg.eng');
  const tt = r1.querySelector('.sh-title'); const b = r1.querySelector('.sh-title .stt b');
  return {open: sh.classList.contains('open'), chip: !!(eng && eng.classList.contains('engchip')),
    keys: eng ? [...eng.querySelectorAll('button')].map(x => x.textContent.trim()).join('|') : null,
    titleW: tt ? Math.round(tt.getBoundingClientRect().width) : null,
    nameClipped: b ? b.scrollWidth > b.clientWidth + 1 : null,
    engL: eng ? Math.round(eng.getBoundingClientRect().left) : null,
    row: [...r1.children].map(c => (c.className || c.tagName).split(' ')[0] + ':' + Math.round(c.getBoundingClientRect().width)).join(' '),
    tab: (sh.querySelector('.sh-tabs .tab.on') || {}).textContent};
});
for (const [w, h] of sizes) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + FILE);
  await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await page.waitForTimeout(500);
  // instrument the chip builder: what did the header see when it decided?
  await page.evaluate(() => { const o = window.engChip; window.__w = []; window.engChip = function (i) { const sh = document.getElementById('synthSheet'); const tt = sh && sh.querySelector('.sh-title'); window.__w.push({tw: tt ? tt.getBoundingClientRect().width : null, disp: sh ? getComputedStyle(sh).display : null}); return o.apply(this, arguments); }; });
  const eng0 = await page.evaluate(() => [S.tracks[0].kind, S.tracks[0].sound.engine, S.tracks[0].name]);
  await page.evaluate(() => SYNQUENZER.selectTrack(0));
  // real tap on the KLANG key in the transport (the user path)
  const kl = await page.$('#bKlang');
  if (kl && await kl.isVisible()) await page.tap('#bKlang'); else await page.evaluate(() => SYNQUENZER.openEditor());
  await page.waitForTimeout(500);
  const s1 = await state(page); const w1 = await page.evaluate(() => window.__w.splice(0));
  await page.screenshot({path: OUT + `v3-rp-mk1-chipfirst-${w}x${h}-a-open.png`});
  // real tap on the FILTER tab
  await page.tap('#synthSheet .sh-tabs .tab[data-tab="filter"]'); await page.waitForTimeout(400);
  const s2 = await state(page); const w2 = await page.evaluate(() => window.__w.splice(0));
  await page.screenshot({path: OUT + `v3-rp-mk1-chipfirst-${w}x${h}-b-filter.png`});
  // back to OSZ
  await page.tap('#synthSheet .sh-tabs .tab[data-tab="osc"]'); await page.waitForTimeout(400);
  const s3 = await state(page);
  // close with ✕ and reopen with KLANG
  await page.tap('#synthSheet .sh-x'); await page.waitForTimeout(400);
  if (kl && await kl.isVisible()) await page.tap('#bKlang'); else await page.evaluate(() => SYNQUENZER.openEditor());
  await page.waitForTimeout(500);
  const s4 = await state(page); const w4 = await page.evaluate(() => window.__w.splice(0));
  console.log(`\n=== ${w}x${h} track0=${JSON.stringify(eng0)} klangKey=${!!kl}`);
  console.log(' open   :', JSON.stringify(s1), 'chipCalls', JSON.stringify(w1));
  console.log(' filter :', JSON.stringify(s2), 'chipCalls', JSON.stringify(w2));
  console.log(' osc    :', JSON.stringify(s3));
  console.log(' reopen :', JSON.stringify(s4), 'chipCalls', JSON.stringify(w4));
  if (errs.length) console.log(' errors:', errs.slice(0, 3));
  await ctx.close();
}
await browser.close();
