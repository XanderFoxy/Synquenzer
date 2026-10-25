import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const files = {old: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK0-fix.html', neu: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html'};
for (const [w, h] of [[568, 320], [667, 375], [736, 414], [640, 360]]) for (const k of ['old', 'neu']) for (const eng of k === 'old' ? ['analog'] : ['analog', 'mk']) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const page = await ctx.newPage(); await page.goto('file://' + files[k]); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(eng => { if (eng !== 'analog') SYNQUENZER.setEngine(0, eng); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }, eng); await page.waitForTimeout(600);
  const r = await page.evaluate(() => { const hd = document.querySelector('#synthSheet .sh-head'); const vw = innerWidth; const out = [];
    for (const b of hd.querySelectorAll('button')) { const r = b.getBoundingClientRect(); if (r.width === 0) continue; if (r.right > vw + .5 || r.left < -.5) out.push((b.getAttribute('aria-label') || b.innerText).slice(0, 14) + '@' + Math.round(r.left) + '-' + Math.round(r.right)); }
    const pv = hd.querySelector('.pv'); return {off: out, pv: pv ? Math.round(pv.getBoundingClientRect().width) : null, x: (() => { const x = [...hd.querySelectorAll('button')].find(b => /Schließen|schließen|✕/.test((b.getAttribute('aria-label') || '') + b.innerText)); return x ? Math.round(x.getBoundingClientRect().right) : null; })()}; });
  console.log(w + 'x' + h, k, eng, JSON.stringify(r));
  if (w === 568) await page.screenshot({path: new URL(`./v3-qa-mk1-hdr-${w}-${k}-${eng}.png`, import.meta.url).pathname, clip: {x: 0, y: 0, width: w, height: 100}});
  await ctx.close();
}
await browser.close();
