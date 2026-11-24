const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w3';
const PORT = fs.readFileSync(S + '/test/port', 'utf8').trim();
const URL = `http://127.0.0.1:${PORT}/the-wall/werkstatt3/index.html`;
const DATEI = S + '/test/ausschnitt20.wav';
let ok = 0, fehl = 0;
const pruef = (b, t) => { if (b) { ok++; console.log('  ok  ', t); } else { fehl++; console.log('  FEHL', t); } };
(async () => {
  const browser = await chromium.launch();
  for (const [name, vw, vh] of [['hoch', 428, 926], ['quer', 926, 428]]) {
    console.log('==', name, vw + 'x' + vh);
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true });
    const page = await ctx.newPage();
    const fehler = [];
    page.on('pageerror', (e) => fehler.push('pageerror ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') fehler.push('console ' + m.text()); });
    await page.goto(URL);
    await page.waitForFunction(() => window.werkstatt3);
    pruef(await page.isVisible('#leer'), 'Anleitung ohne Datei sichtbar');
    pruef(await page.isVisible('#zurueck'), 'Link Werkstatt 2 sichtbar');
    pruef((await page.textContent('.privat')).includes('bleibt auf dem Gerät'), 'Hinweis Gerät');
    await page.setInputFiles('#dateiEingabe', DATEI);
    await page.waitForFunction(() => window.werkstatt3.Z.v && document.querySelectorAll('.lage').length === 1, null, { timeout: 20000 });
    pruef(await page.isVisible('#buehne'), 'Pianorolle sichtbar nach Upload');
    pruef(!(await page.isDisabled('#bAuto')), 'Auto-Knopf bereit');
    const t0 = Date.now();
    await page.locator('#bAuto').tap();
    await page.waitForFunction(() => !document.getElementById('bericht').hidden, null, { timeout: 90000 });
    const bericht = await page.textContent('#bericht');
    console.log('  Bericht:', bericht, '(' + (Date.now() - t0) + ' ms)');
    pruef(/Anschläge auf dem Raster/.test(bericht) && /Noten/.test(bericht), 'Bericht mit Raster und Noten');
    const lagen = await page.$$eval('.lage', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, vorne: e.classList.contains('vorne'), t: e.querySelector('.fahne').textContent }; }));
    console.log('  Lagen:', lagen.map((l) => `${l.t} @${Math.round(l.x)},${Math.round(l.y)}`).join(' | '));
    pruef(lagen.length >= 4, 'mind. 4 Versionen (Original, Gereinigt, Getimed, Auto) – ' + lagen.length);
    const ys = lagen.map((l) => l.y).sort((a, b) => a - b), xs = lagen.slice().sort((a, b) => a.y - b.y).map((l) => l.x);
    pruef(ys.every((y, i) => i === 0 || y - ys[i - 1] >= 40), 'Staffelung senkrecht (je ≥ 40 px, nichts auf 0)');
    pruef(xs.every((x, i) => i === 0 || x > xs[i - 1]), 'Staffelung schräg nach rechts');
    pruef(lagen.slice().sort((a, b) => a.y - b.y)[0].t.includes('Auto-Durchlauf'), 'neueste oben/vorne');
    const nNoten = await page.evaluate(() => window.werkstatt3.Z.v.noten.length);
    pruef(nNoten > 10, 'Noten-Blobs: ' + nNoten);
    // Leinwand gezeichnet: Pixel prüfen
    const vielfalt = await page.evaluate(() => { const c = document.getElementById('rolle'), g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, s = new Set(); for (let i = 0; i < d.length; i += 4 * 97) s.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]); return s.size; });
    pruef(vielfalt > 12, 'Pianorolle zeichnet (Farben ' + vielfalt + ')');
    if (name === 'hoch') await page.screenshot({ path: S + '/ui-hoch.png', fullPage: true });
    else { await page.screenshot({ path: S + '/ui-quer.png' }); }
    // ältere Version nach vorne (Fähnchen antippen)
    const alt = page.locator('.lage', { hasText: 'Gereinigt' });
    await alt.tap();
    await page.waitForTimeout(400);
    const vn = await page.evaluate(() => window.werkstatt3.Z.v.name);
    pruef(vn === 'Gereinigt', 'Fähnchen antippen holt „Gereinigt“ nach vorne');
    const obenTxt = await page.$$eval('.lage', (els) => els.map((e) => [e.getBoundingClientRect().top, e.querySelector('.fahne').textContent]).sort((a, b) => a[0] - b[0])[0][1]);
    pruef(obenTxt.includes('Gereinigt'), 'gewählte Lage liegt vorne oben');
    if (name === 'quer') { await page.evaluate(() => document.getElementById('zwiebel').scrollIntoView()); await page.screenshot({ path: S + '/ui-quer-zwiebel.png' }); }
    if (name === 'hoch') await page.screenshot({ path: S + '/ui-hoch-alt.png', fullPage: true });
    pruef(!(await page.isDisabled('#bAktuell')), '„Aktuell“ aktiv');
    await page.locator('#bAktuell').tap();
    await page.waitForTimeout(400);
    pruef(await page.evaluate(() => window.werkstatt3.Z.v.name) === 'Auto-Durchlauf', '„Aktuell“ holt neueste zurück');
    // Note senkrecht ziehen (Tonhöhe +1 Halbton)
    const idx = await page.evaluate(() => { const w = window.werkstatt3, N = w.Z.v.noten; let i = N.findIndex((n) => n.t1 - n.t0 > 0.2 && n.t0 > 1); if (i < 0) i = 0; w.zeige(N[i].t0 - 0.5); return i; });
    await page.waitForTimeout(100);
    let o = await page.evaluate((i) => window.werkstatt3.ort(i), idx);
    const pph = await page.evaluate(() => window.werkstatt3.Z.sicht.pph);
    const vorher = await page.evaluate(() => document.querySelectorAll('.lage').length);
    await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(o.x, o.y - pph * 0.5, { steps: 4 }); await page.mouse.move(o.x, o.y - pph * 1.1, { steps: 4 }); await page.mouse.up();
    await page.waitForFunction((n) => document.querySelectorAll('.lage').length > n && !window.werkstatt3.Z.beschaeftigt, vorher, { timeout: 15000 });
    const vt = await page.evaluate(() => window.werkstatt3.Z.v.name);
    pruef(/Halbton/.test(vt), 'Senkrecht ziehen → neue Version: ' + vt);
    // Note waagrecht ziehen (Timing, rastet ein)
    o = await page.evaluate((i) => window.werkstatt3.ort(i), idx);
    const pps = await page.evaluate(() => window.werkstatt3.Z.sicht.pps);
    const v2 = await page.evaluate(() => document.querySelectorAll('.lage').length);
    await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(o.x + 20, o.y, { steps: 3 }); await page.mouse.move(o.x + pps * 0.13, o.y, { steps: 4 }); await page.mouse.up();
    await page.waitForFunction((n) => document.querySelectorAll('.lage').length > n && !window.werkstatt3.Z.beschaeftigt, v2, { timeout: 15000 }).catch(() => {});
    const vz = await page.evaluate(() => window.werkstatt3.Z.v.name);
    pruef(/ms/.test(vz), 'Waagrecht ziehen → neue Version: ' + vz);
    const aufStrich = await page.evaluate((i) => { const w = window.werkstatt3, n = w.Z.v.noten[i], E = w.E, g = 60 / E.bpm / 4; const l = E.versatz + Math.round((n.peak - E.versatz) / g) * g; return Math.abs(n.peak - l) * 1000; }, idx);
    pruef(aufStrich < 3, 'Spitze nach dem Ziehen auf dem Strich (' + aufStrich.toFixed(2) + ' ms)');
    // Doppeltipp auf Note → zurück auf die Stufe
    o = await page.evaluate((i) => window.werkstatt3.ort(i), idx);
    const v3 = await page.evaluate(() => document.querySelectorAll('.lage').length);
    await page.touchscreen.tap(o.x, o.y); await page.waitForTimeout(120); await page.touchscreen.tap(o.x, o.y);
    await page.waitForTimeout(1500);
    const vd = await page.evaluate(() => window.werkstatt3.Z.v.name);
    console.log('  nach Doppeltipp:', vd, '/ Lagen', await page.evaluate(() => document.querySelectorAll('.lage').length), 'vorher', v3);
    pruef(true, 'Doppeltipp ohne Fehler');
    // ▶ / ■
    await page.locator('#bSpiel').tap(); await page.waitForTimeout(400);
    pruef(await page.getAttribute('#bSpiel', 'aria-label') === 'Anhalten', '▶ spielt');
    await page.locator('#bSpiel').tap();
    pruef(await page.getAttribute('#bSpiel', 'aria-label') === 'Abspielen', '■ hält an');
    // Export
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.locator('#bExport').tap()]);
    const ziel = S + '/test/export-' + name + '.wav';
    await dl.saveAs(ziel);
    const gr = fs.statSync(ziel).size, kopf = fs.readFileSync(ziel).subarray(0, 44);
    pruef(dl.suggestedFilename() === 'ausschnitt20_fertig.wav', 'Dateiname ' + dl.suggestedFilename());
    pruef(Math.abs(gr - (44 + 960000 * 3)) < 64 && kopf.readUInt16LE(34) === 24 && kopf.readUInt32LE(24) === 48000, 'WAV 24 bit 48 kHz, ' + gr + ' Bytes');
    const [dl2] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.locator('#bExportRein').tap()]);
    pruef(dl2.suggestedFilename() === 'ausschnitt20_gereinigt.wav', 'nur gereinigt: ' + dl2.suggestedFilename());
    if (name === 'hoch') {
      const n0 = await page.evaluate(() => document.querySelectorAll('.lage').length);
      await page.evaluate(() => window.werkstatt3.verlauf.bereit());
      await page.reload();
      await page.waitForFunction((n) => document.querySelectorAll('.lage').length === n, n0, { timeout: 20000 }).catch(() => {});
      pruef(await page.evaluate(() => document.querySelectorAll('.lage').length) === n0, 'Verlauf nach Neuladen wieder da (' + n0 + ')');
    }
    pruef(fehler.length === 0, 'keine Fehler in der Konsole' + (fehler.length ? ': ' + fehler.join(' | ') : ''));
    await ctx.close();
  }
  await browser.close();
  console.log(`\n${ok} ok, ${fehl} Fehler`);
  process.exit(fehl ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
