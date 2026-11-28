const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 926, height: 428 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, colorScheme: 'dark', permissions: ['microphone'] });
  const p = await ctx.newPage();
  await p.addInitScript(() => { const o = window.scrollBy; window.scrollBy = function (...a) { console.log('scrollBy ' + JSON.stringify(a) + ' y=' + scrollY + ' max=' + (document.documentElement.scrollHeight - innerHeight)); return o.apply(this, a); }; });
  p.on('console', (m) => console.log('PAGE', m.text()));
  await p.goto('http://localhost:8961/app/#einsingen/the-wall'); await p.waitForSelector('.tr-start'); await p.waitForTimeout(500);
  await p.locator('.eh-fuss button', { hasText: 'Überspringen' }).tap(); await p.waitForTimeout(400);
  const st = p.locator('.tr-start'); await st.scrollIntoViewIfNeeded();
  console.log(await p.evaluate(() => { const r = document.querySelector('.tr-rolle').getBoundingClientRect(), s = document.querySelector('.tr-start').getBoundingClientRect(); return `vor Tipp: y=${scrollY} rolle ${Math.round(r.top)}-${Math.round(r.bottom)} start ${Math.round(s.top)}-${Math.round(s.bottom)}`; }));
  console.log('vor', await p.evaluate(() => [...document.querySelectorAll('#ansicht > *')].map((e) => e.className.split(' ')[0] + ':' + Math.round(e.getBoundingClientRect().height)).join(' ')));
  await st.tap();
  for (const ms of [100, 400, 1200]) { await p.waitForTimeout(ms); console.log(ms, await p.evaluate(() => { const r = document.querySelector('.tr-rolle').getBoundingClientRect(); const kids = [...document.querySelectorAll('#ansicht > *')].map((e) => e.className.split(' ')[0] + ':' + Math.round(e.getBoundingClientRect().height)).join(' '); return `y=${scrollY} rolle ${Math.round(r.top)}-${Math.round(r.bottom)} | ${kids}`; })); }
  await b.close();
})();
