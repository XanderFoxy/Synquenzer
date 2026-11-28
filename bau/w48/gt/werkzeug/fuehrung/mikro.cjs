// Fake-Mikrofon (gesungener Ton Ges3): Tonhöhe erkannt, Prozent erscheint, Ablauf 1 → 2 → 3 … → Abschluss.
const { chromium } = require('playwright');
const G = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/';
const U = 'http://localhost:8961/app/';
const PROFIL = { tief: 46, hoch: 58, kern: [49, 58], typ: 'Bariton (Schätzung)', uebergaenge: [54, 58], quelle: 'profil' };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${G}werkzeug/fuehrung/ges3.wav`, '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, colorScheme: 'dark', permissions: ['microphone'] });
  await ctx.addInitScript((p) => { if (!localStorage.getItem('gt.stimme')) localStorage.setItem('gt.stimme', JSON.stringify(p)); }, PROFIL);
  const p = await ctx.newPage();
  const fehler = [];
  p.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') fehler.push('console: ' + m.text()); });
  const t0 = Date.now(), s = () => ((Date.now() - t0) / 1000).toFixed(0) + 's';

  // ---- 1. freie Übung: Vokal-Leiter (Startton Ges3)
  await p.goto(U + '#uebung/vokal-leiter'); await p.waitForTimeout(900);
  const schneller = async (n) => { for (let i = 0; i < n; i++) { const k = p.locator('.tr-tempo button[aria-label="Schneller"]'); if (await k.isDisabled()) break; await k.tap(); } };
  await schneller(12);
  console.log(s(), 'Tempo', await p.locator('.tr-bpm').innerText());
  await p.locator('.tr-start').tap();
  const phasen = new Set(); let live = '', zahlen = new Set();
  for (let i = 0; i < 120; i++) {
    await p.waitForTimeout(150);
    phasen.add(await p.locator('.tr-phase').innerText());
    const z = await p.locator('.tr-zahl').innerText(); if (z) zahlen.add(z);
    const l = await p.locator('.tr-live.an').count() ? await p.locator('.tr-live').innerText() : '';
    if (l && !live) { live = l; await p.screenshot({ path: G + 'fotos/f-mikro-singen.png' }); }
    if (await p.locator('.tr-chip').count()) break;
  }
  console.log(s(), 'Phasen:', [...phasen].join(' → '), '| Einzähler:', [...zahlen].join(''), '| live:', live);
  console.log(s(), 'Durchgang 1:', await p.locator('.tr-chip').first().innerText().catch(() => '–'), '|', JSON.stringify(await p.evaluate(() => window.__gtLetzte && { g: window.__gtLetzte.e && window.__gtLetzte.e.gesamt, teile: window.__gtLetzte.e && window.__gtLetzte.e.teile.map((t) => t.id + ':' + (t.wert == null ? '-' : Math.round(t.wert * 100))).join(' '), frames: window.__gtLetzte.frames, ton: window.__gtLetzte.stimme.slice(-6) })));
  await p.waitForSelector('.tr-erg', { timeout: 90000 });
  await p.waitForTimeout(1500);
  console.log(s(), 'Ergebnis:', (await p.locator('.tr-erg').innerText()).replace(/\s+/g, ' ').slice(0, 420));
  await p.locator('.tr-erg').screenshot({ path: G + 'fotos/f-mikro-ergebnis.png' });
  console.log(s(), 'Verlauf:', await p.evaluate(() => localStorage.getItem('gt.verlauf')).then((x) => (x || '').slice(0, 200)));

  // ---- 2. geführte Einheit: 1 → 2 → 3 … → Abschluss
  await p.goto(U + '#einsingen/the-wall'); await p.waitForTimeout(1200);
  console.log(s(), 'Einheit:', await p.locator('.eh-schritt').innerText(), '|', await p.locator('.eh-held h1').innerText(), '|', await p.locator('.eh-ertrag').innerText());
  await p.locator('.eh-fuss button', { hasText: 'Überspringen' }).tap(); await p.waitForTimeout(500);
  console.log(s(), 'nach Überspringen:', await p.locator('.eh-schritt').innerText(), '|', await p.locator('.eh-held h1').innerText());
  await schneller(14);
  await p.locator('.tr-start').tap();
  await p.waitForTimeout(6000);
  console.log(s(), 'Ring während der Übung:', await p.locator('.eh-held .pring-innen b').innerText());
  await p.screenshot({ path: G + 'fotos/f-mikro-einheit.png' });
  await p.waitForSelector('.tr-erg', { timeout: 90000 }); await p.waitForTimeout(1200);
  console.log(s(), 'Ergebnis 2:', (await p.locator('.tr-erg h3').innerText()), (await p.locator('.tr-erg .pring-innen b').innerText()) + ' %', '| Ring warm:', await p.locator('.eh-held .pring-innen b').innerText());
  const weiter = p.locator('.tr-erg button.haupt');
  console.log(s(), 'Weiter-Knopf:', await weiter.innerText());
  await weiter.tap(); await p.waitForTimeout(600);
  console.log(s(), 'jetzt:', await p.locator('.eh-schritt').innerText(), '|', await p.locator('.eh-held h1').innerText());
  for (let i = 0; i < 8; i++) {
    const k = p.locator('.eh-fuss button').last(); const t = await k.innerText(); await k.tap(); await p.waitForTimeout(450);
    if (/Abschluss/.test(t)) break;
  }
  console.log(s(), 'Abschluss:', (await p.locator('.eh-held').innerText()).replace(/\s+/g, ' ').slice(0, 200));
  await p.screenshot({ path: G + 'fotos/f-mikro-abschluss.png', fullPage: true });

  // ---- 3. Liedzeile mit Xanders eigener Vokal-Spur als Vorsänger
  await p.goto(U + '#lied/the-wall/ueben/r1-2/1'); await p.waitForTimeout(1200);
  console.log(s(), 'Zeile: Vorsingen =', await p.locator('.tr-optionen .segment').first().locator('button.an').innerText(), '| Tempo', await p.locator('.tr-bpm').innerText());
  await p.locator('.tr-start').tap();
  const ph2 = new Set();
  for (let i = 0; i < 200; i++) { await p.waitForTimeout(200); ph2.add(await p.locator('.tr-phase').innerText()); if (await p.locator('.tr-chip').count()) break; }
  console.log(s(), 'Phasen Zeile:', [...ph2].join(' → '), '| Durchgang 1:', await p.locator('.tr-chip').first().innerText().catch(() => '–'));
  await p.screenshot({ path: G + 'fotos/f-mikro-zeile.png' });
  await p.locator('.tr-start').tap(); await p.waitForTimeout(300);
  // ---- 4. quer
  await p.setViewportSize({ width: 926, height: 428 }); await p.waitForTimeout(500);
  console.log(s(), 'quer Querscroll:', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  await p.screenshot({ path: G + 'fotos/f-mikro-zeile-quer.png' });
  console.log(fehler.length ? 'FEHLER:\n' + fehler.join('\n') : 'keine Konsolenfehler');
  await b.close();
})().catch((e) => { console.error('ABBRUCH', e); process.exit(1); });
