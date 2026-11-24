// Rauchtest Eignung: Profil laden, Lied mit erfundenem Text + Sinus-WAV importieren, Eignung, Weg, Zeile abspielen.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const G = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/gt/';
const U = 'http://localhost:8947/app/';
function wav(zeilen) {
  const sr = 22050, teile = [];
  let t = 0.3; const noten = [];
  for (const z of zeilen) { for (const m of z) { noten.push({ t, d: 0.36, m }); t += 0.44; } t += 0.7; }
  const N = Math.ceil((t + 0.3) * sr), x = new Int16Array(N);
  for (const n of noten) {
    const f = 440 * Math.pow(2, (n.m - 69) / 12), a = Math.floor(n.t * sr), L = Math.floor(n.d * sr);
    for (let i = 0; i < L; i++) { const env = Math.min(1, i / 220, (L - i) / 220); x[a + i] = Math.round(9000 * env * (Math.sin(2 * Math.PI * f * i / sr) + 0.3 * Math.sin(4 * Math.PI * f * i / sr))); }
  }
  const b = Buffer.alloc(44 + N * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + N * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(N * 2, 40);
  for (let i = 0; i < N; i++) b.writeInt16LE(x[i], 44 + i * 2);
  return b;
}
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, colorScheme: 'dark' });
  const p = await ctx.newPage();
  const fehler = [], warn = [];
  p.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') fehler.push('error: ' + m.text()); if (m.type() === 'warning') warn.push(m.text()); });
  const prof = fs.readFileSync(G + 'notiz/profil-link.txt', 'utf8').trim().split('#profil=').pop();
  await p.goto(U + '#profil=' + prof); await p.waitForTimeout(800);
  await p.goto(U + '#neu'); await p.waitForTimeout(400);
  await p.fill('#f-titel', 'Silver Rain (Test)');
  await p.fill('#f-text', '[Verse]\nSilver rain is falling down\nevery road is calling home\n\n[Chorus]\nHold the fire, hold the light\nnever let the morning go');
  const w = wav([[55, 57, 58, 60, 58, 57, 55], [53, 55, 57, 58, 57, 55, 53], [58, 60, 62, 63, 62, 60, 58], [60, 62, 63, 62, 60, 58, 57]]);
  await p.setInputFiles('input[type=file]', { name: 'silver-rain.wav', mimeType: 'audio/wav', buffer: w });
  await p.locator('button', { hasText: 'Speichern' }).tap();
  await p.waitForSelector('.karte.eignung', { timeout: 15000 }); await p.waitForTimeout(900);
  const hash = await p.evaluate(() => location.hash);
  console.log('nach import:', hash);
  console.log('EIGNUNG:', (await p.locator('.karte.eignung').innerText()).replace(/\n+/g, ' / ').slice(0, 700));
  await p.screenshot({ path: G + 'fotos/e-eignung.png' });
  const id = decodeURIComponent(hash.split('/')[1]);
  const daten = await p.evaluate(async (id) => new Promise((ok) => { const r = indexedDB.open('gesangstrainer'); r.onsuccess = () => { const q = r.result.transaction('lieder').objectStore('lieder').get(id); q.onsuccess = () => ok(q.result); q.onerror = () => ok(null); }; r.onerror = () => ok(null); }), id);
  if (daten) console.log('zuordnung:', daten.zeilen.map((z) => z.silben.map((s) => `${s.text}:${s.midi}`).join(' ')).join(' | '));
  const tk = p.locator('.eg-trans button');
  if (await tk.count()) { await tk.tap(); await p.waitForTimeout(500); console.log('trans-knopf:', await p.locator('.eg-trans button').innerText(), '| meldung:', await p.textContent('#meldung')); }
  await p.locator('a', { hasText: 'Weg zu diesem Lied' }).first().tap(); await p.waitForTimeout(700);
  console.log('weg: wochen', await p.locator('.pfad .station').count(), '|', (await p.locator('.pfad .station h3').allInnerTexts()).join(' | '));
  await p.locator('.pfad details.ueb').first().evaluate((d) => { d.open = true; });
  await p.screenshot({ path: G + 'fotos/e-weg.png', fullPage: true });
  await p.goto(U + `#lied/${encodeURIComponent(id)}/zeile/t1-1/bau`); await p.waitForTimeout(900);
  console.log('zeile kugeln:', await p.locator('.kette .kugel').count(), '| bau-schritte:', await p.locator('.bau-schritt').count(), '| tonart:', await p.locator('.stepper output').innerText());
  await p.locator('.rund-knopf[aria-label="Abspielen"]').tap(); await p.waitForTimeout(1100);
  console.log('spielt: jetzt-kugel', await p.locator('.kugel.jetzt').count(), '| puls', await p.locator('.rund-knopf.puls').count());
  await p.locator('.bau-schritt').nth(1).tap(); await p.waitForTimeout(500);
  console.log('bau-schritt 2: aus', await p.locator('.kugel-wort.aus').count(), '| an', await p.locator('.bau-schritt.an').innerText().then((t) => t.replace(/\n/g, ' ')));
  await p.goto(U + `#lied/${encodeURIComponent(id)}/teil/t1`); await p.waitForTimeout(500);
  console.log('teil: bau-chips', await p.locator('a.chip[href$="/bau"]').count());
  await p.goto(U + `#warmup/${encodeURIComponent(id)}`); await p.waitForTimeout(500);
  console.log('warmup schritte:', await p.locator('.schritt-punkte i').count());
  await p.goto(U + '#uebungen'); await p.waitForTimeout(500);
  console.log('uebungen:', (await p.locator('main h2').allInnerTexts()).join(' | '), '| erste:', await p.locator('details.ueb h3').first().innerText(), '|', await p.locator('details.ueb .leise.klein').first().innerText());
  await p.goto(U + '#lied/the-wall'); await p.waitForTimeout(600);
  console.log('the wall:', (await p.locator('.karte.eignung h3').innerText()));
  console.log('scrollWidth:', await p.evaluate(() => document.documentElement.scrollWidth));
  console.log('FEHLER:', fehler.length ? fehler.join('\n') : 0, '| Warnungen:', warn.length ? warn.slice(0, 5).join(' ; ') : 0);
  await b.close();
})();
