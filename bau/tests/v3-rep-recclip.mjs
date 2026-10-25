import { chromium } from 'playwright';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-rep-recclip/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const VP = {P1: [390, 844], P2: [375, 667], W: [844, 1180], P3: [320, 568], L1: [844, 390]};
const res = [];
for (const name of ['base', 'new']) for (const [vp, [w, h]] of Object.entries(VP)) for (const sc of ['a', 'b']) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + D + name + '.html'); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 30000});
  await p.waitForTimeout(400);
  if (sc === 'a') {
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setClip(0, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: 1, n: 57, v: .8}]}); Q.selectTrack(0); Q.songFromChain([{scene: 0, bars: 4}]); Q.selectTrack(1); Q.songView(true); Q.songRecTargets({clips: true, chords: true, notes: true, mel: true}); });
  } else {
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); });
    await p.waitForTimeout(300);
    // tap the real SONG ⇄ corner
    const sw = await p.$('.corner.sw');
    if (sw) { const bb = await sw.boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); }
  }
  await p.waitForTimeout(700);
  const m = await p.evaluate(() => {
    const r = document.querySelector('#songView .sv-rec'); if (!r || !r.offsetParent) return {missing: true, songOpen: !document.getElementById('songView').hidden};
    const t = r.querySelector('.t'), cs = getComputedStyle(t), rcs = getComputedStyle(r);
    const rb = r.getBoundingClientRect(), tb = t.getBoundingClientRect();
    const rg = document.createRange(); rg.selectNodeContents(t); const gb = rg.getBoundingClientRect();
    const row = [...document.querySelectorAll('#songView .sv-top > *')].filter(e => e.offsetParent && !e.hidden).map(e => (e.className.replace(/rb |sv-b /g, '')) + ':' + Math.round(e.getBoundingClientRect().width));
    return {text: t.textContent, btnW: Math.round(rb.width * 10) / 10, tClient: t.clientWidth, tScroll: t.scrollWidth, textInkW: Math.round(gb.width * 10) / 10,
      clipLeft: Math.round((rb.left + parseFloat(rcs.borderLeftWidth) - gb.left) * 10) / 10, clipRight: Math.round((gb.right - (rb.right - parseFloat(rcs.borderRightWidth))) * 10) / 10,
      tOverflow: cs.overflow, tTO: cs.textOverflow, tWS: cs.whiteSpace, btnOverflow: rcs.overflow, ver: (window.SYNQUENZER.version || ''), row, side: document.getElementById('songView').classList.contains('side')};
  });
  const rb = await p.$('#songView .sv-rec');
  if (rb && (vp === 'P1' || vp === 'P2' || vp === 'W')) { const bb = await rb.boundingBox(); if (bb) await p.screenshot({path: D + `${name}-${vp}-${sc}.png`, clip: {x: Math.max(0, bb.x - 70), y: Math.max(0, bb.y - 6), width: Math.min(w, bb.width + 140), height: bb.height + 12}}); }
  res.push({name, vp, sc, ...m, errs: errs.length});
  await ctx.close();
}
await b.close();
for (const r of res) console.log(JSON.stringify(r));
