// Mikrofon (Fake-Gerät mit gesungener Tonleiter A2–A3), Stimmlage geführt + von Hand, dann jeden Knopf einmal antippen.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const G = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/';
const U = 'http://localhost:8947/app/';
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${G}werkzeug/eignung/tonleiter-a2-a3.wav`, '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, colorScheme: 'dark', permissions: ['microphone'] });
  await ctx.addInitScript(() => {
    window.__toene = 0; const S = window.AudioScheduledSourceNode && AudioScheduledSourceNode.prototype;
    if (S) { const st = S.start; S.start = function (...a) { window.__toene++; return st.apply(this, a); }; }
  });
  const p = await ctx.newPage();
  const fehler = [];
  let dialoge = 0;
  p.on('dialog', (d) => { dialoge++; d.dismiss(); });
  p.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/mitsingen\.js|404/.test(m.text())) fehler.push('error: ' + m.text()); });
  // --- 1. geführt mit Mikrofon
  await p.goto(U + '#stimme'); await p.waitForTimeout(700);
  await p.locator('button', { hasText: 'Jetzt singen' }).tap(); await p.waitForTimeout(300);
  for (let k = 0; k < 3; k++) {
    await p.locator('.mic-ring .rund-knopf').tap(); await p.waitForTimeout(4200);
    console.log(`schritt ${k + 1}: blase`, await p.locator('.ton-blase').innerText(), '|', await p.locator('.mic-buehne .leise.klein').innerText(), '|', await p.locator('.mic-buehne p.leise').last().innerText());
    await p.locator('.knopf-reihe button').first().tap(); await p.waitForTimeout(700);
  }
  await p.waitForTimeout(600);
  console.log('gespeichert (mikro):', await p.evaluate(() => localStorage.getItem('gt.stimme')));
  await p.screenshot({ path: G + 'fotos/e-stimme-mikro.png', fullPage: true });
  // --- 2. von Hand
  await p.locator('button', { hasText: 'Ton von Hand wählen' }).tap(); await p.waitForTimeout(300);
  await p.locator('.hand-taste[data-m="45"]').tap(); await p.locator('.hand-taste[data-m="62"]').tap();
  console.log('hand:', await p.locator('.hand-anzeige').innerText());
  await p.screenshot({ path: G + 'fotos/e-stimme-hand.png' });
  await p.locator('button', { hasText: 'Diese Lage speichern' }).tap(); await p.waitForTimeout(400);
  console.log('gespeichert (hand):', (await p.evaluate(() => localStorage.getItem('gt.stimme'))).slice(0, 160));
  // --- 3. jeden Knopf
  const eigen = await p.evaluate(async () => new Promise((ok) => { const r = indexedDB.open('gesangstrainer'); r.onsuccess = () => { try { const q = r.result.transaction('lieder').objectStore('lieder').getAllKeys(); q.onsuccess = () => ok(q.result); q.onerror = () => ok([]); } catch (e) { ok([]); } }; r.onerror = () => ok([]); }));
  const routen = ['#start', '#lied/the-wall', '#lied/the-wall/weg', '#lied/the-wall/teil/r1', '#lied/the-wall/zeile/r1-3', '#warmup/the-wall', '#stimme', '#uebungen', '#neu', '#mitsingen/the-wall'];
  const ohne = [], gleich = [];
  let getippt = 0;
  const zustand = () => p.evaluate(() => [location.hash, document.querySelector('#ansicht').innerHTML.length, document.querySelector('#ansicht').innerHTML.replace(/\d+(\.\d+)?/g, '').length,
    document.querySelectorAll('[open]').length, document.querySelectorAll('.an,.puls,[aria-pressed="true"]').length, document.querySelector('#meldung').className + document.querySelector('#meldung').textContent, window.__toene, scrollY].join('|'));
  for (const r of routen) {
    await p.goto(U + r); await p.reload(); await p.waitForTimeout(450);
    const sel = '#ansicht button:visible, #ansicht a[href]:visible, #ansicht summary:visible, .leiste a, #zurueck:visible';
    const n = Math.min(await p.locator(sel).count(), 45);
    for (let i = 0; i < n; i++) {
      if (i) { await p.goto(U + r); await p.reload(); await p.waitForTimeout(350); }
      const el = p.locator(sel).nth(i);
      if (!(await el.count())) continue;
      const name = ((await el.innerText().catch(() => '')) || (await el.getAttribute('aria-label')) || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      const href = await el.getAttribute('href');
      const d0 = dialoge, vor = await zustand();
      try { await el.tap({ timeout: 1500 }); } catch (e) { try { await el.click({ timeout: 1500, force: true }); } catch (e2) { ohne.push(`${r} [${i}] ${name}: nicht antippbar`); continue; } }
      getippt++;
      await p.waitForTimeout(380);
      const nach = await zustand();
      if (vor === nach && dialoge === d0) { if (href && (U + href).endsWith(r) || href === r) gleich.push(`${r}: ${name}`); else ohne.push(`${r} [${i}] ${name} ${href || ''}`); }
    }
  }
  console.log('getippt:', getippt, '| ohne Wirkung:', ohne.length ? '\n  ' + ohne.join('\n  ') : 0);
  console.log('Link auf aktuelle Seite (gewollt):', gleich.length, gleich.slice(0, 6).join(' ; '));
  console.log('FEHLER:', fehler.length ? fehler.join('\n') : 0);
  await b.close();
})();
