// Rauchtest Mitsingen: Testseite, Teil wählen, Abspielen (Tipp), Kugeln laufen, Mikrofon (Test-Gerät), Foto. 0 Fehler.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const FOTO = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/fotos/';
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, colorScheme: 'dark', permissions: ['microphone'] });
  const p = await ctx.newPage();
  const fehler = [];
  p.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') fehler.push(m.type() + ': ' + m.text()); });
  p.on('requestfailed', (r) => fehler.push('request: ' + r.url()));
  const t0 = Date.now();
  await p.goto('http://localhost:8957/werkzeug/mitsingen/test.html');
  await p.waitForFunction(() => window.ms && window.ms.bereit, null, { timeout: 60000 });
  console.log('bereit nach', Date.now() - t0, 'ms |', await p.textContent('.ms-status'));
  console.log('kugeln gesamt:', await p.locator('.ms-bahn .kugel').count(), '| teile:', await p.locator('.ms-chips[aria-label=Teil] button').count());
  await p.locator('.ms-chips[aria-label=Teil] button', { hasText: 'Refrain 1' }).tap();
  await p.locator('.rund-knopf[aria-label="Abspielen"]').tap();
  await p.waitForTimeout(1500);
  const z1 = await p.evaluate(() => window.ms.zeit);
  const pos1 = await p.evaluate(() => [...document.querySelectorAll('.ms-bahn .kugel')].filter((k) => k.style.opacity !== '0').map((k) => k.style.transform).slice(0, 3));
  await p.locator('.ms-chips button', { hasText: 'Mikrofon' }).tap();
  await p.waitForTimeout(2500);
  const z2 = await p.evaluate(() => window.ms.zeit);
  const pos2 = await p.evaluate(() => [...document.querySelectorAll('.ms-bahn .kugel')].filter((k) => k.style.opacity !== '0').map((k) => k.style.transform).slice(0, 3));
  console.log('liedzeit', z1.toFixed(2), '→', z2.toFixed(2), '| kugeln bewegt:', JSON.stringify(pos1[0]) !== JSON.stringify(pos2[0]), '| sichtbar', pos2.length);
  console.log('jetzt-kugel:', await p.locator('.ms-bahn .kugel.jetzt').count(), '| groß:', await p.textContent('.silbe-gross'), '| zeile:', await p.textContent('.ms-zeile'));
  await p.locator('.ms-chips button', { hasText: 'geglättet' }).tap(); await p.waitForTimeout(800);
  console.log('art geglättet an:', await p.locator('.ms-chips button.an', { hasText: 'geglättet' }).count(), '| spiegel sichtbar:', await p.locator('.vs-flaeche').count(), '| spiegel-text:', await p.textContent('.vs-fazit'));
  await p.fill('#ms-vokal', '80'); await p.dispatchEvent('#ms-vokal', 'input');
  const klein = await p.evaluate(() => [...document.querySelectorAll('.ms button')].filter((x) => { const r = x.getBoundingClientRect(); return r.width && (r.height < 44 || r.width < 44); }).map((x) => x.textContent.trim()));
  console.log('Knöpfe unter 44 px:', klein.length ? klein : 'keine');
  const quer = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  console.log('Querscroll:', quer);
  await p.screenshot({ path: FOTO + 'm-mitsingen.png', fullPage: true });
  const w = await p.evaluate(async () => {
    const m = await import('../../app/js/vokalfilter.js'); const sr = 48000, n = sr * 3, L = new Float32Array(n), R = new Float32Array(n);
    for (let i = 0; i < n; i++) { const v = 0.3 * Math.sin(2 * Math.PI * 196 * i / sr) + 0.15 * Math.sin(2 * Math.PI * 392 * i / sr); L[i] = v + 0.05 * Math.sin(i * 0.37); R[i] = v - 0.05 * Math.sin(i * 0.37); }
    const t = performance.now(); const r = await m.imHintergrund([L, R], sr, { trennen: true, rein: true });
    return { ms: Math.round(performance.now() - t), laenge: r.y.length, vokal: r.info.anteile.vokal.anteil.toFixed(2), rein: r.info.reinRahmen };
  });
  console.log('Worker (Stereo, trennen+rein, 3 s):', JSON.stringify(w));
  await p.evaluate(() => window.ms.schliesse());
  console.log('FEHLER:', fehler.length, fehler.slice(0, 8));
  await b.close();
})();
