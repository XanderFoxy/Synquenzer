// ganzes Lied (266 s): Laden, Auto-Durchlauf, Zeichnen, Export – Zeiten und Fehler
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const E2E = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w3/e2e';
const DATEI = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/repo/the-wall/original/Gesang-Platzhalter-3.wav';
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 428, height: 926 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, acceptDownloads: true });
  const page = await ctx.newPage();
  const fehler = [];
  page.on('pageerror', (e) => fehler.push('pageerror ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') fehler.push('console ' + m.text()); });
  await page.goto('http://127.0.0.1:9850/the-wall/werkstatt3/index.html');
  await page.waitForFunction(() => window.werkstatt3);
  let t = Date.now();
  await page.setInputFiles('#dateiEingabe', DATEI);
  await page.waitForFunction(() => window.werkstatt3.Z.v && !window.werkstatt3.Z.beschaeftigt, null, { timeout: 60000 });
  console.log('laden ms', Date.now() - t);
  t = Date.now();
  await page.locator('#bAuto').tap();
  // Reaktionsfähigkeit während des Durchlaufs: rAF-Lücken messen
  await page.evaluate(() => { window._luecke = 0; let l = performance.now(); const f = (n) => { window._luecke = Math.max(window._luecke, n - l); l = n; if (window.werkstatt3.Z.beschaeftigt) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  await page.waitForFunction(() => !document.getElementById('bericht').hidden && !window.werkstatt3.Z.beschaeftigt, null, { timeout: 300000 });
  const ms = Date.now() - t;
  console.log('auto ms', ms, '·', await page.textContent('#bericht'));
  console.log('größte Ruckel-Lücke im Hauptfaden während auto (ms)', Math.round(await page.evaluate(() => window._luecke)));
  // Zeichnen: ganze Ansicht
  const zt = await page.evaluate(() => { const w = window.werkstatt3; w.Z.sicht.pps = 1; const t0 = performance.now(); for (let i = 0; i < 10; i++) { w.Z.sicht.t0 = i * 3; w.zeichnenSofort(); } return (performance.now() - t0) / 10; });
  console.log('Zeichnen (ganzes Lied sichtbar) ms je Bild', zt.toFixed(1));
  const zt2 = await page.evaluate(() => { const w = window.werkstatt3; w.Z.sicht.pps = 70; const t0 = performance.now(); for (let i = 0; i < 20; i++) { w.Z.sicht.t0 = 100 + i * 0.3; w.zeichnenSofort(); } return (performance.now() - t0) / 20; });
  console.log('Zeichnen (Normalansicht, Scrollen) ms je Bild', zt2.toFixed(1));
  const mem = await page.evaluate(() => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1));
  console.log('JS-Heap MB', mem, 'Verlauf', JSON.stringify(await page.evaluate(() => window.werkstatt3.verlauf.info())));
  t = Date.now();
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.locator('#bExport').tap()]);
  await dl.saveAs(E2E + '/lang-fertig.wav');
  console.log('export ms', Date.now() - t, dl.suggestedFilename(), fs.statSync(E2E + '/lang-fertig.wav').size);
  await page.screenshot({ path: E2E + '/lang-hoch.png' });
  console.log('Fehler', fehler.length ? fehler : 0);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(2); });
