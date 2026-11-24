const { chromium } = require('/opt/node-tools/node_modules/playwright');
const E2E = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w3/e2e';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const f = []; p.on('pageerror', (e) => f.push(e.message));
  await p.goto('http://127.0.0.1:9850/the-wall/werkstatt2/index.html'); await p.waitForTimeout(800);
  const l = p.locator('#kopf a[href="../werkstatt3/"]');
  const bb = await l.boundingBox(); console.log('W2-Link', await l.textContent(), JSON.stringify(bb));
  await p.screenshot({ path: E2E + '/w2-kopf.png', clip: { x: 0, y: 0, width: 428, height: 120 } });
  await l.tap(); await p.waitForURL(/werkstatt3/); console.log('→', p.url());
  await p.goto('http://127.0.0.1:9850/the-wall/index.html');
  const l2 = p.locator('a[href="werkstatt3/"]'); console.log('Wall-Link', await l2.count(), await l2.first().textContent());
  await l2.first().scrollIntoViewIfNeeded(); const bb2 = await l2.first().boundingBox(); console.log(JSON.stringify(bb2));
  await p.screenshot({ path: E2E + '/wall-karte.png', clip: { x: 0, y: Math.max(0, bb2.y - 120), width: 428, height: 220 } });
  console.log('Fehler', f.length ? f : 0); await b.close();
})();
