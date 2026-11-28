const { chromium } = require('playwright');
const fs = require('fs');
const G = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/';
const TR = fs.readFileSync(G + 'app/js/trainer.js', 'utf8').replace('aktiv = { D, k, sb, T0, tZ, tS, tE, vorB, frames, pl, e: null, fertig };', 'aktiv = { D, k, sb, T0, tZ, tS, tE, vorB, frames, pl, e: null, fertig }; window.__gtAktiv = aktiv;').replace('export function sitzung() {', 'window.__gtSZ = SZ;\nexport function sitzung() {');
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, colorScheme: 'dark', permissions: ['microphone'] });
  await ctx.route('**/app/js/trainer.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: TR }));
  const p = await ctx.newPage();
  await p.goto('http://localhost:8961/app/#uebung/arpeggio'); await p.waitForSelector('.tr-start'); await p.waitForTimeout(300);
  await p.locator('.tr-start').tap();
  await p.waitForFunction(() => document.querySelector('.tr-phase').textContent === 'Hör zu');
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const cv = document.querySelector('.tr-cv'), g = cv.getContext('2d'); const out = [];
    for (const y of [9, 12, 30]) { const d = g.getImageData(0, y, cv.width, 1).data; let runs = [], st = -1; for (let x = 0; x <= cv.width; x++) { const hell = x < cv.width && d[x * 4] > 150 && d[x * 4 + 1] > 150 && d[x * 4 + 2] > 150; if (hell && st < 0) st = x; if (!hell && st >= 0) { runs.push(st + '-' + (x - 1) + ':' + d[st * 4] + ',' + d[st * 4 + 3]); st = -1; } } out.push(y + ': ' + runs.join(' ')); }
    const A = window.__gtAktiv, SZ = window.__gtSZ; const t = SZ.ctx.currentTime - (SZ.ctx.outputLatency || SZ.ctx.baseLatency || 0);
    out.push('pos ' + ((t - A.T0) / A.sb).toFixed(2) + ' erw x ' + (40 + ((t - A.T0) / A.sb) / A.D.laenge * (cv.clientWidth - 50)).toFixed(1) + ' w ' + cv.clientWidth + ' dpr ' + cv.width / cv.clientWidth);
    return out;
  });
  console.log(r.join('\n'));
  await p.locator('.tr-rolle').screenshot({ path: G + 'fotos/p-debug-rolle.png' });
  await b.close();
})();
