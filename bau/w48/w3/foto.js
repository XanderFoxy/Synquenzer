// Foto der Musterseite: node foto.js [thema] [ausgabe] [ganz]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const thema = process.argv[2] || 'konsole';
  const aus = process.argv[3] || path.join(__dirname, 'thema-konsole.png');
  const ganz = process.argv[4] === 'ganz';
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    reducedMotion: process.env.RM ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  const fehler = [];
  p.on('pageerror', e => fehler.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  await p.addInitScript(t => { try { localStorage.setItem('w3-thema', t) } catch (e) {} }, thema);
  await p.goto('file://' + path.join(__dirname, 'repo/the-wall/werkstatt3/css/muster-konsole.html'));
  await p.waitForTimeout(500);
  const info = await p.evaluate(() => {
    const H = document.documentElement, s = getComputedStyle(H);
    const ueber = [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 0.5).map(e => e.tagName + '.' + e.className).slice(0, 8);
    const klein = [...document.querySelectorAll('button,.pille')].filter(e => { const r = e.getBoundingClientRect(); return r.height < 44 || r.width < 44 }).map(e => e.textContent.trim() + ':' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
    return { thema: H.dataset.thema, grund: s.getPropertyValue('--grund').trim(), schrift: getComputedStyle(document.body).fontFamily.slice(0, 40), scrollW: document.documentElement.scrollWidth, hoehe: document.documentElement.scrollHeight, ueber, klein };
  });
  console.log(JSON.stringify(info), fehler.length ? 'FEHLER: ' + fehler.join(' | ') : 'keine Fehler');
  await p.screenshot({ path: aus, fullPage: ganz });
  await b.close();
})();
