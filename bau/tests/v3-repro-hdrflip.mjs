// independent repro: synth-sheet header on first open vs. after a tab tap vs. reopen (real taps)
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const file = process.argv[2] || S + 'mk-wt/index.html';
const SA = '#app{padding-left:47px!important;padding-right:47px!important}';
const hdr = p => p.evaluate(() => { const sh = document.getElementById('synthSheet');
  const r = e => e ? Math.round(e.getBoundingClientRect().left) + '+' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height) : '-';
  const seg = sh.querySelector('.sh-head .seg.eng');
  const btns = seg ? [...seg.querySelectorAll('button')].map(b => (b.innerText || '').replace(/\s+/g, ' ').trim() + ':' + r(b)) : [];
  const pa = [...sh.querySelectorAll('.preset .pa')].map(r); const pn = sh.querySelector('.preset .pv');
  const tt = sh.querySelector('.sh-title');
  return {chip: !!(seg && seg.classList.contains('engchip')), eng: btns.join(' '), arrows: pa.join(' '), name: r(pn) + ' "' + (pn ? pn.innerText : '') + '"', title: r(tt), cls: seg ? seg.className : '', mk2z: !!sh.querySelector('.mk2z'), mkht: !!sh.querySelector('.sh-head.mkht'), ver: window.SYNQUENZER && SYNQUENZER.version };
});
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h, tag, css] of [[844, 1180, 'W'], [667, 375, 'L2'], [844, 390, 'L1-SA', SA], [390, 844, 'P1'], [844, 390, 'L1']]) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000}); await p.waitForTimeout(800);
  if (css) await p.addStyleTag({content: css});
  await p.tap('#bKlang'); await p.waitForTimeout(700);
  console.log(tag, '1 open   ', JSON.stringify(await hdr(p)));
  await p.locator('#synthSheet button.tab', {hasText: 'FILTER'}).tap(); await p.waitForTimeout(500);
  console.log(tag, '2 FILTER ', JSON.stringify(await hdr(p)));
  await p.locator('#synthSheet button.tab').first().tap(); await p.waitForTimeout(500);
  console.log(tag, '3 tab1   ', JSON.stringify(await hdr(p)));
  // close (✕, real tap) and reopen
  await p.locator('#synthSheet .sh-x').tap(); await p.waitForTimeout(500);
  const closed = await p.evaluate(() => !document.getElementById('synthSheet').classList.contains('open'));
  await p.tap('#bKlang'); await p.waitForTimeout(700);
  const open = true, open2 = closed;
  console.log(tag, '4 reopen ', JSON.stringify(await hdr(p)), 'closedBetween', open2);
  if (errs.length) console.log('errs', errs);
  await ctx.close();
}
await b.close();
