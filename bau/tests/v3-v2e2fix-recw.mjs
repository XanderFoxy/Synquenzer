// V2e′-fix: song transport ● label fit, with the app's real font (Barlow Semi Condensed / JetBrains Mono from dirigent-wt/fonts)
import { chromium } from 'playwright';
const APP = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html';
const FONTS = 'file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/fonts/';
const SHOT = process.env.SHOT || '';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files'] });
const VP = {P1: [390, 844], P2: [375, 667], W: [844, 1180], P3: [320, 568], L1: [844, 390], L2: [667, 375]};
let fail = 0;
for (const [vp, [w, h]] of Object.entries(VP)) for (const sc of ['a', 'b', 'c']) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 30000});
  const font = process.env.NOFONT ? 'fallback' : await p.evaluate(async F => {
    const f = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
    const st = document.createElement('style'); st.textContent = f.map(([fam, file, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};src:url(${F}${file}-latin-${w}-normal.woff2) format("woff2")}`).join('')).join(''); document.head.appendChild(st);
    await Promise.all(['500 10px "Barlow Semi Condensed"', '700 10px "Barlow Semi Condensed"', '600 10px "Barlow Semi Condensed"', '700 10px "JetBrains Mono"'].map(s => document.fonts.load(s)));
    await document.fonts.ready; return document.fonts.check('700 8px "Barlow Semi Condensed"') && [...document.fonts].some(x => x.family.includes('Barlow') && x.status === 'loaded');
  }, FONTS);
  await p.waitForTimeout(300);
  await p.evaluate(sc => { const Q = window.SYNQUENZER; Q.newProject({init: true});
    if (sc !== 'b') { Q.setClip(0, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: 1, n: 57, v: .8}]}); Q.selectTrack(0); Q.songFromChain([{scene: 0, bars: 4}]); Q.selectTrack(1); }
    return 1; }, sc);
  await p.waitForTimeout(300);
  if (sc === 'b') { const sw = await p.$('.corner.sw'); const bb = await sw.boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); }
  else await p.evaluate(sc => { const Q = window.SYNQUENZER; Q.songView(true); if (sc === 'a') Q.songRecTargets({clips: true, chords: true, notes: true, mel: true}); else Q.songLoop && Q.songLoop(true); }, sc);
  await p.waitForTimeout(700);
  const m = await p.evaluate(() => {
    const out = {}, inner = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return [r.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft) - .01, r.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight) + .01]; };
    for (const q of ['.sv-rec .t', '.sv-play .t', '.sv-loop .v', '.sv-loop .t', '.sv-sw .swl']) {
      const t = document.querySelector('#songView ' + q); if (!t || !t.offsetParent) continue;
      const btn = t.closest('button'), [l, r] = inner(btn), rg = document.createRange(); rg.selectNodeContents(t); const gb = rg.getBoundingClientRect();
      out[q] = {txt: t.textContent, btnW: Math.round(btn.getBoundingClientRect().width * 10) / 10, cut: Math.round(Math.max(0, l - gb.left, gb.right - r) * 10) / 10, lines: Math.round(gb.height / (parseFloat(getComputedStyle(t).fontSize) || 8))};
    }
    const row = [...document.querySelectorAll('#songView .sv-top > *')].filter(e => e.offsetParent && !e.hidden).map(e => e.className.replace(/rb |sv-b /g, '') + ':' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
    const top = document.querySelector('#songView .sv-top'); 
    return {out, row, rowOver: top.scrollWidth - top.clientWidth, side: document.getElementById('songView').classList.contains('side')};
  });
  const cuts = Object.entries(m.out).filter(([k, v]) => v.cut > 0.5);
  const small = m.row.filter(s => { const [ww, hh] = s.split(':')[1].split('x').map(Number); return hh < 40 || ww < 40; });
  const ok = font && !cuts.length && m.rowOver <= 0 && !errs.length;
  if (!ok) fail++;
  console.log((ok ? 'PASS ' : 'FAIL ') + vp + ' ' + sc + ' font=' + font + ' ' + JSON.stringify(m.out['.sv-rec .t']) + ' cuts=' + JSON.stringify(cuts) + ' row=' + m.row.join(' ') + (small.length ? ' SMALL=' + small : '') + ' over=' + m.rowOver + (errs.length ? ' ERR ' + errs : ''));
  if (SHOT && (vp === 'P1' || vp === 'P2' || vp === 'W')) { const t = await p.$('#songView .sv-top'); const bb = await t.boundingBox(); await p.screenshot({path: SHOT + `-${vp}-${sc}.png`, clip: {x: bb.x, y: bb.y, width: Math.min(w, bb.width), height: bb.height}}); }
  await ctx.close();
}
await b.close();
console.log(fail ? fail + ' FAILED' : 'all passed');
process.exit(fail ? 1 : 0);
