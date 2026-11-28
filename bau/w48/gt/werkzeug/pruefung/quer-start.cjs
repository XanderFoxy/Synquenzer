const { chromium } = require('playwright');
const G = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/';
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  for (const [w, hh] of [[926, 428], [428, 926], [760, 1000]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: hh }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, colorScheme: 'dark', permissions: ['microphone'] });
    const p = await ctx.newPage(); const f = []; p.on('pageerror', (e) => f.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') f.push(m.text()); });
    await p.goto('http://localhost:8961/app/#einsingen/the-wall'); await p.waitForSelector('.tr-start'); await p.waitForTimeout(500);
    await p.locator('.eh-fuss button', { hasText: 'Überspringen' }).tap(); await p.waitForTimeout(400);
    const lage = () => p.evaluate(() => { const r = document.querySelector('.tr-rolle').getBoundingClientRect(), k = document.querySelector('.kopf').getBoundingClientRect(), l = document.querySelector('.leiste').getBoundingClientRect(); return `Tonbahn ${Math.round(r.top)}–${Math.round(r.bottom)}, frei ${Math.round(k.bottom)}–${Math.round(l.top)}`; });
    const vor = await lage(); const sb = () => p.evaluate(() => { const s = document.querySelector('.tr-start').getBoundingClientRect(); return ` Stopp ${Math.round(s.top)}–${Math.round(s.bottom)}`; });
    const st = p.locator('.tr-start'); await st.scrollIntoViewIfNeeded(); await st.tap(); await p.waitForTimeout(1200);
    const nach = (await lage()) + (await sb());
    const n = await p.evaluate(() => [...document.querySelectorAll('#ansicht button, #ansicht a')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => Math.round(Math.min(e.getBoundingClientRect().width, e.getBoundingClientRect().height))).sort((a, b) => a - b).slice(0, 3));
    console.log(`${w}×${hh}: vor Start ${vor} | nach Start ${nach} | kleinste Tippflächen ${n.join(',')} | Fehler ${f.length}`);
    await p.screenshot({ path: `${G}fotos/p-start-${w}x${hh}.png` });
    await st.tap({ force: true });
    await ctx.close();
  }
  await b.close();
})();
