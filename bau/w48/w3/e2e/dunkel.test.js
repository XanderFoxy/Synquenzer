const { chromium } = require('/opt/node-tools/node_modules/playwright');
const E2E = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w3/e2e';
(async () => {
  const browser = await chromium.launch();
  const out = [];
  for (const [n, vw, vh] of [['dunkel-hoch', 428, 926], ['leer-quer', 926, 428]]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: n.startsWith('dunkel') ? 'dark' : 'light' });
    const page = await ctx.newPage(); const f = []; page.on('pageerror', (e) => f.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') f.push(m.text()); });
    await page.goto('http://127.0.0.1:9850/the-wall/werkstatt3/index.html'); await page.waitForFunction(() => window.werkstatt3);
    if (n === 'leer-quer') { await page.screenshot({ path: E2E + '/' + n + '.png' }); out.push(n + ' Fehler ' + f.length); await ctx.close(); continue; }
    await page.setInputFiles('#dateiEingabe', E2E + '/Refrain1.wav');
    await page.waitForFunction(() => window.werkstatt3.Z.v && !window.werkstatt3.Z.beschaeftigt);
    await page.locator('#bAuto').tap();
    await page.waitForFunction(() => !document.getElementById('bericht').hidden && !window.werkstatt3.Z.beschaeftigt, null, { timeout: 120000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: E2E + '/' + n + '.png', fullPage: true });
    out.push(n + ' Fehler ' + f.length + ' ' + f.join('|'));
    await ctx.close();
  }
  console.log(out.join('\n')); await browser.close();
})();
